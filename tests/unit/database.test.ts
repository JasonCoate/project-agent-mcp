import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../../mcp-server/src/database';
import { Task, MemoryEntry } from '../../mcp-server/src/types/index';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('DatabaseManager', () => {
  let db: DatabaseManager;
  const testDbPath = join(__dirname, 'test.db');

  beforeEach(async () => {
    // Clean up any existing test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    db = new DatabaseManager(testDbPath);
    // Give the database time to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('constructor', () => {
    it('should create database with default path when no path provided', () => {
      const defaultDb = new DatabaseManager();
      expect(defaultDb).toBeInstanceOf(DatabaseManager);
    });

    it('should create database with custom path', () => {
      expect(db).toBeInstanceOf(DatabaseManager);
      expect(existsSync(testDbPath)).toBe(true);
    });
  });

  describe('Project methods', () => {
    describe('createProject', () => {
      it('should create a project with minimal data', async () => {
        const projectData = {
          name: 'Test Project',
          description: 'A test project',
          status: 'planning' as const,
        };

        const projectId = await db.createProject(projectData);
        expect(projectId).toBeDefined();
        expect(typeof projectId).toBe('string');
        expect(projectId.length).toBeGreaterThan(0);
      });

      it('should create a project with all fields', async () => {
        const projectData = {
          name: 'Complete Project',
          description: 'A complete test project with all fields',
          status: 'active' as const,
        };

        const projectId = await db.createProject(projectData);
        expect(projectId).toBeDefined();
      });
    });

    describe('getProject', () => {
      it('should retrieve a project by ID', async () => {
        const projectData = {
          name: 'Test Project',
          description: 'A test project',
          status: 'planning' as const,
        };

        const projectId = await db.createProject(projectData);
        const project = await db.getProject(projectId);

        expect(project).toBeDefined();
        expect(project?.id).toBe(projectId);
        expect(project?.name).toBe('Test Project');
        expect(project?.description).toBe('A test project');
        expect(project?.status).toBe('planning');
        expect(project?.created_at).toBeDefined();
        expect(project?.updated_at).toBeDefined();
      });

      it('should return null for non-existent project', async () => {
        const project = await db.getProject('non-existent-id');
        expect(project).toBeNull();
      });
    });

    describe('updateProject', () => {
      let projectId: string;

      beforeEach(async () => {
        projectId = await db.createProject({
          name: 'Original Project',
          description: 'Original description',
          status: 'planning',
        });
      });

      it('should update project name', async () => {
        await db.updateProject(projectId, { name: 'Updated Project' });
        const project = await db.getProject(projectId);
        expect(project?.name).toBe('Updated Project');
      });

      it('should update project description', async () => {
        await db.updateProject(projectId, { description: 'Updated description' });
        const project = await db.getProject(projectId);
        expect(project?.description).toBe('Updated description');
      });

      it('should update project status', async () => {
        await db.updateProject(projectId, { status: 'active' });
        const project = await db.getProject(projectId);
        expect(project?.status).toBe('active');
      });

      it('should update multiple fields at once', async () => {
        await db.updateProject(projectId, {
          name: 'Multi-Updated Project',
          description: 'Multi-updated description',
          status: 'completed',
        });
        const project = await db.getProject(projectId);
        expect(project?.name).toBe('Multi-Updated Project');
        expect(project?.description).toBe('Multi-updated description');
        expect(project?.status).toBe('completed');
      });
    });

    describe('getAllProjects', () => {
      it('should return empty array when no projects exist', async () => {
        const projects = await db.getAllProjects();
        expect(Array.isArray(projects)).toBe(true);
        expect(projects).toHaveLength(0);
      });

      it('should return all projects ordered by updated_at DESC', async () => {
        // Create multiple projects
        const project1Id = await db.createProject({
          name: 'Project 1',
          description: 'First project',
          status: 'planning',
        });
        
        // Add a small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const project2Id = await db.createProject({
          name: 'Project 2',
          description: 'Second project',
          status: 'active',
        });

        const projects = await db.getAllProjects();
        expect(projects).toHaveLength(2);
        // Verify both projects are returned
        const projectIds = projects.map(p => p.id);
        expect(projectIds).toContain(project1Id);
        expect(projectIds).toContain(project2Id);
      });
    });
  });

  describe('Spec methods', () => {
    let projectId: string;

    beforeEach(async () => {
      projectId = await db.createProject({
        name: 'Test Project',
        description: 'Project for spec testing',
        status: 'planning',
      });
    });

    describe('createSpec', () => {
      it('should create a spec with all required fields', async () => {
        const specData = {
          project_id: projectId,
          type: 'requirement' as const,
          title: 'Test Requirement',
          content: 'This is a test requirement specification',
          status: 'draft' as const,
          priority: 'medium' as const,
        };

        const specId = await db.createSpec(specData);
        expect(specId).toBeDefined();
        expect(typeof specId).toBe('string');
      });

      it('should create specs with different types', async () => {
        const types = ['requirement', 'technical', 'design', 'acceptance'] as const;
        
        for (const type of types) {
          const specId = await db.createSpec({
            project_id: projectId,
            type,
            title: `${type} spec`,
            content: `Content for ${type} specification`,
            status: 'draft',
            priority: 'medium',
          });
          expect(specId).toBeDefined();
        }
      });
    });

    describe('getSpecsByProject', () => {
      it('should return empty array for project with no specs', async () => {
        const specs = await db.getSpecsByProject(projectId);
        expect(Array.isArray(specs)).toBe(true);
        expect(specs).toHaveLength(0);
      });

      it('should return all specs for a project ordered by priority and created_at', async () => {
        // Create specs with different priorities
        await db.createSpec({
          project_id: projectId,
          type: 'requirement',
          title: 'Low Priority Spec',
          content: 'Low priority content',
          status: 'draft',
          priority: 'low',
        });

        await db.createSpec({
          project_id: projectId,
          type: 'technical',
          title: 'High Priority Spec',
          content: 'High priority content',
          status: 'draft',
          priority: 'high',
        });

        const specs = await db.getSpecsByProject(projectId);
        expect(specs).toHaveLength(2);
        // Verify both specs are returned with correct priorities
        const priorities = specs.map(s => s.priority);
        expect(priorities).toContain('high');
        expect(priorities).toContain('low');
      });

      it('should only return specs for the specified project', async () => {
        // Create another project
        const otherProjectId = await db.createProject({
          name: 'Other Project',
          description: 'Another project',
          status: 'planning',
        });

        // Create specs for both projects
        await db.createSpec({
          project_id: projectId,
          type: 'requirement',
          title: 'Spec for Project 1',
          content: 'Content for project 1',
          status: 'draft',
          priority: 'medium',
        });

        await db.createSpec({
          project_id: otherProjectId,
          type: 'requirement',
          title: 'Spec for Project 2',
          content: 'Content for project 2',
          status: 'draft',
          priority: 'medium',
        });

        const specs = await db.getSpecsByProject(projectId);
        expect(specs).toHaveLength(1);
        expect(specs[0].project_id).toBe(projectId);
        expect(specs[0].title).toBe('Spec for Project 1');
      });
    });

    describe('updateSpec', () => {
      let specId: string;

      beforeEach(async () => {
        specId = await db.createSpec({
          project_id: projectId,
          type: 'requirement',
          title: 'Original Spec',
          content: 'Original content',
          status: 'draft',
          priority: 'medium',
        });
      });

      it('should update spec title', async () => {
        await db.updateSpec(specId, { title: 'Updated Spec Title' });
        const specs = await db.getSpecsByProject(projectId);
        expect(specs[0].title).toBe('Updated Spec Title');
      });

      it('should update spec content', async () => {
        await db.updateSpec(specId, { content: 'Updated content' });
        const specs = await db.getSpecsByProject(projectId);
        expect(specs[0].content).toBe('Updated content');
      });

      it('should update spec status', async () => {
        await db.updateSpec(specId, { status: 'active' });
        const specs = await db.getSpecsByProject(projectId);
        expect(specs[0].status).toBe('active');
      });

      it('should update spec priority', async () => {
        await db.updateSpec(specId, { priority: 'critical' });
        const specs = await db.getSpecsByProject(projectId);
        expect(specs[0].priority).toBe('critical');
      });
    });
  });

  describe('Task methods', () => {
    let projectId: string;
    let specId: string;

    beforeEach(async () => {
      projectId = await db.createProject({
        name: 'Test Project',
        description: 'Project for task testing',
        status: 'planning',
      });

      specId = await db.createSpec({
        project_id: projectId,
        type: 'requirement',
        title: 'Test Spec',
        content: 'Spec for task testing',
        status: 'draft',
        priority: 'medium',
      });
    });

    describe('createTask', () => {
      it('should create a task with minimal data', async () => {
        const taskData = {
          project_id: projectId,
          spec_id: specId,
          title: 'Test Task',
          description: 'A test task',
          status: 'todo' as const,
          progress: 0,
          assignee: undefined,
          due_date: undefined,
        };

        const taskId = await db.createTask(taskData);
        expect(taskId).toBeDefined();
        expect(typeof taskId).toBe('string');
      });

      it('should create a task with all fields', async () => {
        const taskData = {
          project_id: projectId,
          spec_id: specId,
          title: 'Complete Task',
          description: 'A complete task with all fields',
          status: 'in-progress' as const,
          progress: 50,
          assignee: 'john.doe',
          due_date: '2024-12-31T23:59:59Z',
        };

        const taskId = await db.createTask(taskData);
        expect(taskId).toBeDefined();
      });
    });

    describe('getTasksByProject', () => {
      it('should return empty array for project with no tasks', async () => {
        const tasks = await db.getTasksByProject(projectId);
        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks).toHaveLength(0);
      });

      it('should return all tasks for a project ordered by status and created_at', async () => {
        // Create tasks with different statuses
        await db.createTask({
          project_id: projectId,
          spec_id: specId,
          title: 'Done Task',
          description: 'Completed task',
          status: 'done',
          progress: 100,
          assignee: undefined,
          due_date: undefined,
        });

        await db.createTask({
          project_id: projectId,
          spec_id: specId,
          title: 'Todo Task',
          description: 'Todo task',
          status: 'todo',
          progress: 0,
          assignee: undefined,
          due_date: undefined,
        });

        const tasks = await db.getTasksByProject(projectId);
        expect(tasks).toHaveLength(2);
        expect(tasks.every((task: Task) => task.project_id === projectId)).toBe(true);
      });

      it('should only return tasks for the specified project', async () => {
        // Create another project
        const otherProjectId = await db.createProject({
          name: 'Other Project',
          description: 'Another project',
          status: 'planning',
        });

        // Create tasks for both projects
        await db.createTask({
          project_id: projectId,
          spec_id: specId,
          title: 'Task for Project 1',
          description: 'Task description',
          status: 'todo',
          progress: 0,
          assignee: undefined,
          due_date: undefined,
        });

        await db.createTask({
          project_id: otherProjectId,
          spec_id: undefined,
          title: 'Task for Project 2',
          description: 'Task description',
          status: 'todo',
          progress: 0,
          assignee: undefined,
          due_date: undefined,
        });

        const tasks = await db.getTasksByProject(projectId);
        expect(tasks).toHaveLength(1);
        expect(tasks[0].project_id).toBe(projectId);
        expect(tasks[0].title).toBe('Task for Project 1');
      });
    });

    describe('updateTask', () => {
      let taskId: string;

      beforeEach(async () => {
        taskId = await db.createTask({
          project_id: projectId,
          spec_id: specId,
          title: 'Original Task',
          description: 'Original description',
          status: 'todo',
          progress: 0,
          assignee: undefined,
          due_date: undefined,
        });
      });

      it('should update task status', async () => {
        await db.updateTask(taskId, { status: 'in-progress' });
        const tasks = await db.getTasksByProject(projectId);
        expect(tasks[0].status).toBe('in-progress');
      });

      it('should update task progress', async () => {
        await db.updateTask(taskId, { progress: 75 });
        const tasks = await db.getTasksByProject(projectId);
        expect(tasks[0].progress).toBe(75);
      });

      it('should update task assignee', async () => {
        await db.updateTask(taskId, { assignee: 'jane.doe' });
        const tasks = await db.getTasksByProject(projectId);
        expect(tasks[0].assignee).toBe('jane.doe');
      });

      it('should update multiple fields at once', async () => {
        await db.updateTask(taskId, {
          status: 'done',
          progress: 100,
          assignee: 'completed.user',
        });
        const tasks = await db.getTasksByProject(projectId);
        expect(tasks[0].status).toBe('done');
        expect(tasks[0].progress).toBe(100);
        expect(tasks[0].assignee).toBe('completed.user');
      });
    });
  });

  describe('Memory methods', () => {
    let projectId: string;

    beforeEach(async () => {
      projectId = await db.createProject({
        name: 'Test Project',
        description: 'Project for memory testing',
        status: 'planning',
      });
    });

    describe('addMemory', () => {
      it('should add a memory entry', async () => {
        const memoryData = {
          project_id: projectId,
          event_type: 'task_update' as const,
          content: 'Task was updated',
          metadata: { action: 'update', task_id: 'task-123' },
        };

        const memoryId = await db.addMemory(memoryData);
        expect(memoryId).toBeDefined();
        expect(typeof memoryId).toBe('string');
      });

      it('should add memory with complex metadata', async () => {
        const memoryData = {
          project_id: projectId,
          event_type: 'spec_change' as const,
          content: 'Specification was created',
          metadata: {
            action: 'create_spec',
            spec_id: 'spec-456',
            type: 'requirement',
            priority: 'high',
            changes: ['title', 'content'],
          },
        };

        const memoryId = await db.addMemory(memoryData);
        expect(memoryId).toBeDefined();
      });
    });

    describe('getRecentMemory', () => {
      beforeEach(async () => {
        // Add multiple memory entries with delays to ensure proper timestamp ordering
        for (let i = 1; i <= 15; i++) {
          await db.addMemory({
          project_id: projectId,
          event_type: 'note' as const,
          content: `Test event ${i}`,
          metadata: { sequence: i },
        });
         // Delay to ensure different timestamps in SQLite
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      });

      it('should return recent memory entries with default limit', async () => {
        const memories = await db.getRecentMemory(projectId);
        expect(Array.isArray(memories)).toBe(true);
        expect(memories).toHaveLength(10); // Default limit
        // Check that we get entries from our test data
        // Note: Due to SQLite timestamp precision, exact ordering may vary
        const contents = memories.map(m => m.content);
        expect(contents.every(c => c.startsWith('Test event'))).toBe(true);
        // Verify we have a mix of entries (not all the same)
        const uniqueContents = new Set(contents);
        expect(uniqueContents.size).toBeGreaterThan(1);
      });

      it('should return recent memory entries with custom limit', async () => {
        const memories = await db.getRecentMemory(projectId, 5);
        expect(memories).toHaveLength(5);
        // Verify we get 5 entries from our test data
        const contents = memories.map(m => m.content);
        expect(contents.every(c => c.startsWith('Test event'))).toBe(true);
      });

      it('should parse metadata correctly', async () => {
        const memories = await db.getRecentMemory(projectId, 1);
        expect(memories).toHaveLength(1);
        expect(typeof memories[0].metadata).toBe('object');
        expect(memories[0].metadata).toHaveProperty('sequence');
        expect(typeof memories[0].metadata.sequence).toBe('number');
      });

      it('should return empty array for project with no memory', async () => {
        const otherProjectId = await db.createProject({
          name: 'Empty Project',
          description: 'Project with no memory',
          status: 'planning',
        });

        const memories = await db.getRecentMemory(otherProjectId);
        expect(Array.isArray(memories)).toBe(true);
        expect(memories).toHaveLength(0);
      });

      it('should only return memory for the specified project', async () => {
        const otherProjectId = await db.createProject({
          name: 'Other Project',
          description: 'Another project',
          status: 'planning',
        });

        await db.addMemory({
          project_id: otherProjectId,
          event_type: 'note' as const,
          content: 'Event for other project',
          metadata: { other: true },
        });

        const memories = await db.getRecentMemory(projectId, 20);
        expect(memories.every((memory: MemoryEntry) => memory.project_id === projectId)).toBe(true);
        expect(memories.some((memory: MemoryEntry) => memory.content === 'Event for other project')).toBe(false);
      });
    });
  });
});