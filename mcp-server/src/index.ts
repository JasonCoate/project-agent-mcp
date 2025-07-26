import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
  CallToolResult,
  ListToolsResult
} from '@modelcontextprotocol/sdk/types.js';

import { DatabaseManager } from './database.js';
import { ProjectManagerTool } from './tools/project-manager.js';
import { SpecManagerTool } from './tools/spec-manager.js';
import { TaskManagerTool } from './tools/task-manager.js';
import { ContextManagerTool } from './tools/context-manager.js';

class ProjectAgentServer {
  private server: Server;
  private db: DatabaseManager;
  private tools: {
    project: ProjectManagerTool;
    spec: SpecManagerTool;
    task: TaskManagerTool;
    context: ContextManagerTool;
  };

  constructor() {
    this.server = new Server(
      {
        name: "project-agent-mcp",
        version: "1.0.0"
      }
    );

    this.db = new DatabaseManager();
    this.tools = {
      project: new ProjectManagerTool(this.db),
      spec: new SpecManagerTool(this.db),
      task: new TaskManagerTool(this.db),
      context: new ContextManagerTool(this.db)
    };

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest): Promise<ListToolsResult> => {
      const allTools = [
        ...this.tools.project.getTools(),
        ...this.tools.spec.getTools(),
        ...this.tools.task.getTools(),
        ...this.tools.context.getTools()
      ];

      return { tools: allTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        // Route to appropriate tool handler
        if (name === 'create_project' || name === 'get_project' || 
            name === 'update_project' || name === 'list_projects') {
          result = await this.tools.project.handleTool(name, args);
        } else if (name.includes('spec')) {
          result = await this.tools.spec.handleTool(name, args);
        } else if (name.includes('task') || name.includes('progress')) {
          result = await this.tools.task.handleTool(name, args);
        } else if (name.includes('context') || name.includes('search') || name.includes('note')) {
          result = await this.tools.context.handleTool(name, args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ],
          isError: false
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text", 
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Project Agent MCP Server running on stdio");
  }
}

const server = new ProjectAgentServer();
server.run().catch(console.error);