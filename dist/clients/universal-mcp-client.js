#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const readline = __importStar(require("readline"));
class MCPClient {
    serverProcess = null;
    messageId = 0;
    pendingRequests = new Map();
    async start() {
        this.serverProcess = (0, child_process_1.spawn)('node', ['./mcp-server/dist/src/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        this.serverProcess.stdout?.on('data', (data) => {
            this.handleResponse(data.toString());
        });
        this.serverProcess.stderr?.on('data', (data) => {
            console.error('MCP Server Error:', data.toString());
        });
        // Interactive CLI
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        console.log('Project Agent MCP Client Started');
        console.log('Available commands: list, create-project, get-context, help, exit');
        rl.on('line', async (input) => {
            await this.handleCommand(input.trim());
            rl.prompt();
        });
        rl.prompt();
    }
    async handleCommand(command) {
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
    async sendRequest(method, params = {}) {
        const id = ++this.messageId;
        const request = {
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
    handleResponse(data) {
        try {
            const response = JSON.parse(data);
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
                this.pendingRequests.delete(response.id);
                if (response.error) {
                    pending.reject(new Error(response.error.message));
                }
                else {
                    pending.resolve(response.result);
                }
            }
        }
        catch (error) {
            console.error('Failed to parse response:', error);
        }
    }
    async listTools() {
        try {
            const result = await this.sendRequest('tools/list');
            console.log('\nAvailable Tools:');
            result.tools.forEach((tool) => {
                console.log(`- ${tool.name}: ${tool.description}`);
            });
        }
        catch (error) {
            console.error('Error listing tools:', error.message);
        }
    }
    async createProject(args) {
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
        }
        catch (error) {
            console.error('Error creating project:', error.message);
        }
    }
    async getContext(projectId) {
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
        }
        catch (error) {
            console.error('Error getting context:', error.message);
        }
    }
    showHelp() {
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
