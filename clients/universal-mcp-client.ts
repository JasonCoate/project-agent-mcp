#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: Record<string, any>;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class MCPClient {
  private serverProcess: ChildProcess | null = null;
  private messageId: number = 0;
  private pendingRequests: Map<number, PendingRequest> = new Map();

  async start(): Promise<void> {
    this.serverProcess = spawn('node', ['./mcp-server/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.serverProcess.stdout?.on('data', (data: Buffer) => {
      this.handleResponse(data.toString());
    });

    this.serverProcess.stderr?.on('data', (data: Buffer) => {
      console.error('MCP Server Error:', data.toString());
    });

    // Interactive CLI
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('Project Agent MCP Client Started');
    console.log(
      'Available commands: list, create-project, get-context, help, exit'
    );

    rl.on('line', async (input: string) => {
      await this.handleCommand(input.trim());
      rl.prompt();
    });

    rl.prompt();
  }

  private async handleCommand(command: string): Promise<void> {
    const [cmd, ...args] = command.split(' ');

    switch (cmd) {
      case 'list':
        await this.listTools();
        break;
      case 'create-project':
        await this.createProject(args);
        break;
      case 'get-context':
        await this.getContext(args[0]);
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
        process.exit(0);
        break;
      default:
        console.log('Unknown command. Type "help" for available commands.');
    }
  }

  private async sendRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = ++this.messageId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.serverProcess?.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  private handleResponse(data: string): void {
    try {
      const response: MCPResponse = JSON.parse(data);
      const pending = this.pendingRequests.get(response.id);

      if (pending) {
        this.pendingRequests.delete(response.id);
        if (response.error) {
          pending.reject(new Error(response.error.message));
        } else {
          pending.resolve(response.result);
        }
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
    }
  }

  private async listTools(): Promise<void> {
    try {
      const result = await this.sendRequest('tools/list');
      console.log('\nAvailable Tools:');
      result.tools.forEach((tool: MCPTool) => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
    } catch (error) {
      console.error('Error listing tools:', (error as Error).message);
    }
  }

  private async createProject(args: string[]): Promise<void> {
    const name = args.join(' ');
    if (!name) {
      console.log('Usage: create-project <project name>');
      return;
    }

    try {
      const result = await this.sendRequest('tools/call', {
        name: 'create_project',
        arguments: { name },
      });
      console.log('Project created:', result);
    } catch (error) {
      console.error('Error creating project:', (error as Error).message);
    }
  }

  private async getContext(projectId: string): Promise<void> {
    if (!projectId) {
      console.log('Usage: get-context <project-id>');
      return;
    }

    try {
      const result = await this.sendRequest('tools/call', {
        name: 'get_project_context',
        arguments: { project_id: projectId },
      });
      console.log('Project Context:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error getting context:', (error as Error).message);
    }
  }

  private showHelp(): void {
    console.log(`
Available Commands:
  list                    - List all available MCP tools
  create-project <name>   - Create a new project
  get-context <id>        - Get project context by ID
  help                    - Show this help message
  exit                    - Exit the client

Example:
  create-project My New App
  get-context abc-123-def
    `);
  }
}

const client = new MCPClient();
client.start().catch(console.error);