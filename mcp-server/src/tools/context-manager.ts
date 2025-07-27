import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
import { ProjectContext } from '../types/index.js';

export class ContextManagerTool {
  constructor(private db: DatabaseManager) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_project_context',
        description:
          'Get comprehensive project context including specs, tasks, and recent activity',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            include_memory: {
              type: 'boolean',
              default: true,
              description: 'Include recent memory/activity',
            },
            memory_limit: {
              type: 'number',
              default: 20,
              description: 'Number of recent memory entries to include',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'add_context_note',
        description: 'Add a contextual note or decision to project memory',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            content: { type: 'string', description: 'Note content' },
            event_type: {
              type: 'string',
              enum: ['decision', 'issue', 'milestone', 'note'],
              default: 'note',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata',
              additionalProperties: true,
            },
          },
          required: ['project_id', 'content'],
        },
      },
      {
        name: 'search_context',
        description: 'Search through project context and memory',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            query: { type: 'string', description: 'Search query' },
            event_types: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by event types',
            },
          },
          required: ['project_id', 'query'],
        },
      },
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_project_context':
        return await this.getProjectContext(
          args.project_id,
          args.include_memory,
          args.memory_limit
        );

      case 'add_context_note':
        const noteId = await this.db.addMemory({
          project_id: args.project_id,
          event_type: args.event_type || 'note',
          content: args.content,
          metadata: args.metadata || {},
        });
        return { success: true, note_id: noteId };

      case 'search_context':
        return await this.searchContext(
          args.project_id,
          args.query,
          args.event_types
        );

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async getProjectContext(
    projectId: string,
    includeMemory: boolean = true,
    memoryLimit: number = 20
  ): Promise<ProjectContext> {
    const [project, specs, tasks, recentMemory] = await Promise.all([
      this.db.getProject(projectId),
      this.db.getSpecsByProject(projectId),
      this.db.getTasksByProject(projectId),
      includeMemory ? this.db.getRecentMemory(projectId, memoryLimit) : [],
    ]);

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const progressSummary = {
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'done').length,
      blocked_tasks: tasks.filter(t => t.status === 'blocked').length,
      overall_progress:
        tasks.length > 0
          ? Math.round(
              tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
            )
          : 0,
    };

    return {
      project,
      specs,
      tasks,
      recent_memory: recentMemory,
      progress_summary: progressSummary,
    };
  }

  private async searchContext(
    projectId: string,
    query: string,
    eventTypes?: string[]
  ): Promise<any> {
    // Simple text search implementation
    const [specs, tasks, memory] = await Promise.all([
      this.db.getSpecsByProject(projectId),
      this.db.getTasksByProject(projectId),
      this.db.getRecentMemory(projectId, 100),
    ]);

    const queryLower = query.toLowerCase();
    const results = {
      specs: specs.filter(
        spec =>
          spec.title.toLowerCase().includes(queryLower) ||
          spec.content.toLowerCase().includes(queryLower)
      ),
      tasks: tasks.filter(
        task =>
          task.title.toLowerCase().includes(queryLower) ||
          (task.description &&
            task.description.toLowerCase().includes(queryLower))
      ),
      memory: memory.filter(entry => {
        const matchesQuery = entry.content.toLowerCase().includes(queryLower);
        const matchesType =
          !eventTypes || eventTypes.includes(entry.event_type);
        return matchesQuery && matchesType;
      }),
    };

    return {
      query,
      total_results:
        results.specs.length + results.tasks.length + results.memory.length,
      results,
    };
  }
}
