import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed']).default('planning')
});

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed']).optional()
});

export class ProjectManagerTool {
  constructor(private db: DatabaseManager) {}

  getTools(): Tool[] {
    return [
      {
        name: "create_project",
        description: "Create a new project",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Project name" },
            description: { type: "string", description: "Project description" },
            status: { 
              type: "string", 
              enum: ["planning", "active", "on-hold", "completed"],
              default: "planning"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "get_project",
        description: "Get project details by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Project ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "update_project",
        description: "Update project details",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Project ID" },
            name: { type: "string", description: "Project name" },
            description: { type: "string", description: "Project description" },
            status: { 
              type: "string", 
              enum: ["planning", "active", "on-hold", "completed"]
            }
          },
          required: ["id"]
        }
      },
      {
        name: "list_projects",
        description: "List all projects",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "create_project":
        const projectData = createProjectSchema.parse(args);
        const projectId = await this.db.createProject({
          ...projectData,
          description: projectData.description || ''
        });
        await this.db.addMemory({
          project_id: projectId,
          event_type: 'milestone',
          content: `Project "${projectData.name}" created`,
          metadata: { action: 'create_project' }
        });
        return { success: true, project_id: projectId };

      case "get_project":
        const project = await this.db.getProject(args.id);
        if (!project) {
          throw new Error(`Project with ID ${args.id} not found`);
        }
        return project;

      case "update_project":
        const updateData = updateProjectSchema.parse(args);
        const { id, ...updates } = updateData;
        await this.db.updateProject(id, updates);
        await this.db.addMemory({
          project_id: id,
          event_type: 'milestone',
          content: `Project updated: ${JSON.stringify(updates)}`,
          metadata: { action: 'update_project', changes: updates }
        });
        return { success: true };

      case "list_projects":
        return await this.db.getAllProjects();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}