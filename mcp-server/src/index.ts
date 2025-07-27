import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
  CallToolResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';

import { DatabaseManager } from './database.js';
import { ProjectManagerTool } from './tools/project-manager.js';
import { SpecManagerTool } from './tools/spec-manager.js';
import { TaskManagerTool } from './tools/task-manager.js';
import { ContextManagerTool } from './tools/context-manager.js';
import { MemoryAssistantTool } from './tools/memory-assistant.js';
import { createFeatureWorkflowTools } from './tools/feature-workflow-tools.js';
import { FeatureWorkflowManager } from './tools/feature-workflow-manager.js';

class ProjectAgentServer {
  private server: Server;
  private db: DatabaseManager;
  private tools: {
    project: ProjectManagerTool;
    spec: SpecManagerTool;
    task: TaskManagerTool;
    context: ContextManagerTool;
    memory: MemoryAssistantTool;
  };
  private featureWorkflowTools: any;
  private featureWorkflowManager: FeatureWorkflowManager;

  constructor() {
    this.server = new Server({
      name: 'project-agent-mcp',
      version: '1.0.0',
    });

    this.db = new DatabaseManager();
    this.tools = {
      project: new ProjectManagerTool(this.db),
      spec: new SpecManagerTool(this.db),
      task: new TaskManagerTool(this.db),
      context: new ContextManagerTool(this.db),
      memory: new MemoryAssistantTool(this.db),
    };

    // Initialize feature workflow tools
    this.featureWorkflowManager = new FeatureWorkflowManager(
      this.db,
      process.cwd()
    );
    this.featureWorkflowTools = createFeatureWorkflowTools(
      this.db,
      process.cwd()
    );

    // Initialize workflow database tables
    this.initializeWorkflowDatabase();

    this.setupHandlers();
  }

  private async initializeWorkflowDatabase() {
    try {
      await this.featureWorkflowManager.initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize workflow database:', error);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async (_request: ListToolsRequest): Promise<ListToolsResult> => {
        const allTools = [
          ...this.tools.project.getTools(),
          ...this.tools.spec.getTools(),
          ...this.tools.task.getTools(),
          ...this.tools.context.getTools(),
          ...this.tools.memory.getTools(),
          ...this.featureWorkflowTools.getTools(),
        ];

        return { tools: allTools };
      }
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest): Promise<CallToolResult> => {
        const { name, arguments: args } = request.params;

        console.error(`[DEBUG] Tool called: ${name}`);

        try {
          let result;

          // Route to appropriate tool handler
          if (
            name === 'create_project' ||
            name === 'get_project' ||
            name === 'update_project' ||
            name === 'list_projects'
          ) {
            console.error(`[DEBUG] Routing to project tool`);
            result = await this.tools.project.handleTool(name, args);
          } else if (
            name.includes('feature_workflow') ||
            name.includes('workflow')
          ) {
            // Handle feature workflow tools
            console.error(`[DEBUG] Routing to feature workflow tool`);
            result = await this.featureWorkflowTools.handleTool(name, args);
          } else if (name.includes('spec')) {
            console.error(`[DEBUG] Routing to spec tool`);
            result = await this.tools.spec.handleTool(name, args);
          } else if (name.includes('task') || name.includes('progress')) {
            console.error(`[DEBUG] Routing to task tool`);
            result = await this.tools.task.handleTool(name, args);
          } else if (
            name.includes('session') ||
            name.includes('knowledge') ||
            name.includes('memory') ||
            name.includes('retrieve') ||
            name.includes('query')
          ) {
            console.error(`[DEBUG] Routing to memory tool`);
            result = await this.tools.memory.handleTool(name, args);
          } else if (
            name.includes('context') ||
            name.includes('search') ||
            name.includes('note')
          ) {
            console.error(`[DEBUG] Routing to context tool`);
            result = await this.tools.context.handleTool(name, args);
          } else {
            console.error(`[DEBUG] No route found for tool: ${name}`);
            throw new Error(`Unknown tool: ${name}`);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Project Agent MCP Server running on stdio');
  }
}

const server = new ProjectAgentServer();
server.run().catch(console.error);
