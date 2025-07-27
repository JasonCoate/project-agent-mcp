import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
import { z } from 'zod';

const createTaskSchema = z.object({
  project_id: z.string(),
  spec_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  assignee: z.string().optional(),
  due_date: z.string().optional(),
});

export class TaskManagerTool {
  constructor(private db: DatabaseManager) {}

  getTools(): Tool[] {
    return [
      {
        name: 'create_task',
        description: 'Create a new task',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            spec_id: {
              type: 'string',
              description: 'Related specification ID',
            },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            assignee: { type: 'string', description: 'Task assignee' },
            due_date: { type: 'string', description: 'Due date (ISO format)' },
          },
          required: ['project_id', 'title'],
        },
      },
      {
        name: 'update_task_progress',
        description: 'Update task status and progress',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Task ID' },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'review', 'done', 'blocked'],
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Progress percentage',
            },
            notes: { type: 'string', description: 'Progress notes' },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_tasks',
        description: 'Get all tasks for a project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'review', 'done', 'blocked'],
              description: 'Filter by status',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'analyze_progress',
        description: 'Analyze project progress and identify bottlenecks',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
          },
          required: ['project_id'],
        },
      },
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'create_task':
        const taskData = createTaskSchema.parse(args);
        const taskId = await this.db.createTask({
          ...taskData,
          description: taskData.description || '',
          status: 'todo',
          progress: 0,
        });

        await this.db.addMemory({
          project_id: taskData.project_id,
          event_type: 'task_update',
          content: `New task created: ${taskData.title}`,
          metadata: { action: 'create_task', task_id: taskId },
        });

        return { success: true, task_id: taskId };

      case 'update_task_progress':
        const { id, notes, ...updates } = args;
        await this.db.updateTask(id, updates);

        if (notes) {
          // Get task to find project_id
          // const task = await this.db.getTasksByProject(''); // Need project context
          await this.db.addMemory({
            project_id: '', // Would need to fetch project_id from task
            event_type: 'task_update',
            content: `Task progress updated: ${notes}`,
            metadata: { action: 'update_progress', task_id: id, ...updates },
          });
        }

        return { success: true };

      case 'get_tasks':
        let tasks = await this.db.getTasksByProject(args.project_id);

        if (args.status) {
          tasks = tasks.filter(task => task.status === args.status);
        }

        return tasks;

      case 'analyze_progress':
        return await this.analyzeProjectProgress(args.project_id);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async analyzeProjectProgress(projectId: string): Promise<any> {
    const tasks = await this.db.getTasksByProject(projectId);
    const specs = await this.db.getSpecsByProject(projectId);

    const analysis: {
      total_tasks: number;
      completed_tasks: number;
      in_progress_tasks: number;
      blocked_tasks: number;
      overdue_tasks: number;
      overall_progress: number;
      bottlenecks: string[];
      recommendations: string[];
    } = {
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'done').length,
      in_progress_tasks: tasks.filter(t => t.status === 'in-progress').length,
      blocked_tasks: tasks.filter(t => t.status === 'blocked').length,
      overdue_tasks: tasks.filter(
        t =>
          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
      ).length,
      overall_progress:
        tasks.length > 0
          ? Math.round(
              tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
            )
          : 0,
      bottlenecks: [],
      recommendations: [],
    };

    // Identify bottlenecks
    const blockedTasks = tasks.filter(t => t.status === 'blocked');
    if (blockedTasks.length > 0) {
      analysis.bottlenecks.push(`${blockedTasks.length} blocked tasks`);
      analysis.recommendations.push(
        'Review and resolve blocked tasks immediately'
      );
    }

    if (analysis.overdue_tasks > 0) {
      analysis.bottlenecks.push(`${analysis.overdue_tasks} overdue tasks`);
      analysis.recommendations.push('Reassess timelines for overdue tasks');
    }

    // Check spec coverage
    const specsWithTasks = new Set(tasks.map(t => t.spec_id).filter(Boolean));
    const uncoveredSpecs = specs.filter(s => !specsWithTasks.has(s.id));

    if (uncoveredSpecs.length > 0) {
      analysis.recommendations.push(
        `Create tasks for ${uncoveredSpecs.length} uncovered specifications`
      );
    }

    return analysis;
  }
}
