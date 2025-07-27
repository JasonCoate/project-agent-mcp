import { describe, it, expect, beforeEach } from '@jest/globals';
import { Task, Spec } from '../../mcp-server/src/types/index';
import { TaskManagerTool } from '../../mcp-server/src/tools/task-manager';

// Mock DatabaseManager for testing
class MockDatabaseManager {
  private tasks: Map<string, Task> = new Map();
  private specs: Map<string, Spec> = new Map();
  private taskCounter = 1;
  private memories: any[] = [];

  async createTask(data: any): Promise<string> {
    const id = `task_${this.taskCounter++}`;
    const task: Task = {
      id,
      project_id: data.project_id,
      spec_id: data.spec_id,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      progress: data.progress || 0,
      assignee: data.assignee,
      due_date: data.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    return id;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      Object.assign(task, updates, { updated_at: new Date().toISOString() });
    }
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.project_id === projectId);
  }

  async getSpecsByProject(projectId: string): Promise<Spec[]> {
    return Array.from(this.specs.values()).filter(spec => spec.project_id === projectId);
  }

  async addMemory(data: any): Promise<void> {
    this.memories.push(data);
  }

  // Helper methods for testing
  addMockSpec(spec: Spec): void {
    this.specs.set(spec.id, spec);
  }

  getMemories(): any[] {
    return this.memories;
  }
}

describe('TaskManagerTool', () => {
  let taskManager: TaskManagerTool;
  let mockDb: MockDatabaseManager;

  beforeEach(() => {
    mockDb = new MockDatabaseManager();
    taskManager = new TaskManagerTool(mockDb as any);
  });

  describe('getTools', () => {
    it('should return correct tool definitions', () => {
      const tools = taskManager.getTools();
      expect(tools).toHaveLength(4);
      expect(tools[0].name).toBe('create_task');
      expect(tools[1].name).toBe('update_task_progress');
      expect(tools[2].name).toBe('get_tasks');
      expect(tools[3].name).toBe('analyze_progress');
    });

    it('should have proper input schemas', () => {
      const tools = taskManager.getTools();
      const createTaskTool = tools.find(t => t.name === 'create_task');
      expect(createTaskTool?.inputSchema.properties).toHaveProperty('project_id');
      expect(createTaskTool?.inputSchema.properties).toHaveProperty('title');
      expect(createTaskTool?.inputSchema.required).toContain('project_id');
      expect(createTaskTool?.inputSchema.required).toContain('title');
    });
  });

  describe('create_task', () => {
    it('should create a task successfully with minimal data', async () => {
      const result = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Test Task',
      });

      expect(result.success).toBe(true);
      expect(result.task_id).toBeDefined();
      expect(typeof result.task_id).toBe('string');
    });

    it('should create a task with full data', async () => {
      const result = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        spec_id: 'spec-1',
        title: 'Complete Task',
        description: 'A complete task with all fields',
        assignee: 'john.doe',
        due_date: '2024-12-31T23:59:59Z',
      });

      expect(result.success).toBe(true);
      expect(result.task_id).toBeDefined();
    });

    it('should add memory when creating a task', async () => {
      await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Test Task',
      });

      const memories = mockDb.getMemories();
      expect(memories).toHaveLength(1);
      expect(memories[0].event_type).toBe('task_update');
      expect(memories[0].content).toContain('New task created: Test Task');
    });

    it('should throw error for invalid data', async () => {
      await expect(
        taskManager.handleTool('create_task', {
          // Missing required project_id and title
          description: 'Invalid task',
        })
      ).rejects.toThrow();
    });
  });

  describe('update_task_progress', () => {
    it('should update task status and progress', async () => {
      // First create a task
      const createResult = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Test Task',
      });

      // Then update it
      const result = await taskManager.handleTool('update_task_progress', {
        id: createResult.task_id,
        status: 'in-progress',
        progress: 50,
      });

      expect(result.success).toBe(true);
    });

    it('should update task with notes', async () => {
      const createResult = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Test Task',
      });

      const result = await taskManager.handleTool('update_task_progress', {
        id: createResult.task_id,
        status: 'done',
        progress: 100,
        notes: 'Task completed successfully',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('get_tasks', () => {
    beforeEach(async () => {
      // Create some test tasks
      await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Task 1',
      });
      await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Task 2',
      });
      await taskManager.handleTool('create_task', {
        project_id: 'project-2',
        title: 'Task 3',
      });
    });

    it('should get all tasks for a project', async () => {
      const tasks = await taskManager.handleTool('get_tasks', {
        project_id: 'project-1',
      });

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(2);
      expect(tasks.every((task: Task) => task.project_id === 'project-1')).toBe(true);
    });

    it('should filter tasks by status', async () => {
      // Update one task to in-progress
      const allTasks = await taskManager.handleTool('get_tasks', {
        project_id: 'project-1',
      });
      
      await taskManager.handleTool('update_task_progress', {
        id: allTasks[0].id,
        status: 'in-progress',
      });

      const todoTasks = await taskManager.handleTool('get_tasks', {
        project_id: 'project-1',
        status: 'todo',
      });

      const inProgressTasks = await taskManager.handleTool('get_tasks', {
        project_id: 'project-1',
        status: 'in-progress',
      });

      expect(todoTasks).toHaveLength(1);
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].status).toBe('in-progress');
    });

    it('should return empty array for project with no tasks', async () => {
      const tasks = await taskManager.handleTool('get_tasks', {
        project_id: 'nonexistent-project',
      });

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(0);
    });
  });

  describe('analyze_progress', () => {
    beforeEach(async () => {
      // Create test tasks with different statuses
      const task1 = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Completed Task',
        due_date: '2024-01-01T00:00:00Z',
      });
      await taskManager.handleTool('update_task_progress', {
        id: task1.task_id,
        status: 'done',
        progress: 100,
      });

      const task2 = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'In Progress Task',
      });
      await taskManager.handleTool('update_task_progress', {
        id: task2.task_id,
        status: 'in-progress',
        progress: 50,
      });

      const task3 = await taskManager.handleTool('create_task', {
        project_id: 'project-1',
        title: 'Blocked Task',
        due_date: '2023-01-01T00:00:00Z', // Overdue
      });
      await taskManager.handleTool('update_task_progress', {
        id: task3.task_id,
        status: 'blocked',
        progress: 0,
      });

      // Add a mock spec
      mockDb.addMockSpec({
        id: 'spec-1',
        project_id: 'project-1',
        type: 'requirement',
        title: 'Test Spec',
        content: 'Test specification',
        status: 'active',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    it('should analyze project progress correctly', async () => {
      const analysis = await taskManager.handleTool('analyze_progress', {
        project_id: 'project-1',
      });

      expect(analysis.total_tasks).toBe(3);
      expect(analysis.completed_tasks).toBe(1);
      expect(analysis.in_progress_tasks).toBe(1);
      expect(analysis.blocked_tasks).toBe(1);
      expect(analysis.overdue_tasks).toBe(1);
      expect(analysis.overall_progress).toBe(50); // (100 + 50 + 0) / 3 = 50
    });

    it('should identify bottlenecks', async () => {
      const analysis = await taskManager.handleTool('analyze_progress', {
        project_id: 'project-1',
      });

      expect(analysis.bottlenecks).toContain('1 blocked tasks');
      expect(analysis.bottlenecks).toContain('1 overdue tasks');
    });

    it('should provide recommendations', async () => {
      const analysis = await taskManager.handleTool('analyze_progress', {
        project_id: 'project-1',
      });

      expect(analysis.recommendations).toContain('Review and resolve blocked tasks immediately');
      expect(analysis.recommendations).toContain('Reassess timelines for overdue tasks');
      expect(analysis.recommendations).toContain('Create tasks for 1 uncovered specifications');
    });

    it('should handle project with no tasks', async () => {
      const analysis = await taskManager.handleTool('analyze_progress', {
        project_id: 'empty-project',
      });

      expect(analysis.total_tasks).toBe(0);
      expect(analysis.overall_progress).toBe(0);
      expect(analysis.bottlenecks).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(
        taskManager.handleTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });
});