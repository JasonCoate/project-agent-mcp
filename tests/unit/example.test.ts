import { describe, it, expect } from '@jest/globals';
import { Project, Task } from '../../mcp-server/src/types/index';
import { ProjectManagerTool } from '../../mcp-server/src/tools/project-manager';

// Mock DatabaseManager for testing
class MockDatabaseManager {
  private projects: Map<string, Project> = new Map();
  private projectCounter = 1;

  async createProject(data: { name: string; description: string; status: string }): Promise<string> {
    const id = `project_${this.projectCounter++}`;
    const project: Project = {
      id,
      name: data.name,
      description: data.description,
      status: data.status as Project['status'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, project);
    return id;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      Object.assign(project, updates, { updated_at: new Date().toISOString() });
    }
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async addMemory(_data: any): Promise<void> {
    // Mock implementation
  }
}

describe('Project Types', () => {
  it('should create a valid Project object', () => {
    const project: Project = {
      id: 'test-1',
      name: 'Test Project',
      description: 'A test project',
      status: 'planning',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(project.id).toBe('test-1');
    expect(project.name).toBe('Test Project');
    expect(project.status).toBe('planning');
  });

  it('should create a valid Task object', () => {
    const task: Task = {
      id: 'task-1',
      project_id: 'project-1',
      title: 'Test Task',
      description: 'A test task',
      status: 'todo',
      progress: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(task.id).toBe('task-1');
    expect(task.project_id).toBe('project-1');
    expect(task.status).toBe('todo');
    expect(task.progress).toBe(0);
  });
});

describe('ProjectManagerTool', () => {
  let projectManager: ProjectManagerTool;
  let mockDb: MockDatabaseManager;

  beforeEach(() => {
    mockDb = new MockDatabaseManager();
    projectManager = new ProjectManagerTool(mockDb as any);
  });

  it('should return correct tool definitions', () => {
    const tools = projectManager.getTools();
    expect(tools).toHaveLength(4);
    expect(tools[0].name).toBe('create_project');
    expect(tools[1].name).toBe('get_project');
    expect(tools[2].name).toBe('update_project');
    expect(tools[3].name).toBe('list_projects');
  });

  it('should create a project successfully', async () => {
    const result = await projectManager.handleTool('create_project', {
      name: 'Test Project',
      description: 'Test Description',
      status: 'planning',
    });

    expect(result.success).toBe(true);
    expect(result.project_id).toBeDefined();
    expect(typeof result.project_id).toBe('string');
  });

  it('should get a project by ID', async () => {
    // First create a project
    const createResult = await projectManager.handleTool('create_project', {
      name: 'Test Project',
      description: 'Test Description',
    });

    // Then get it
    const project = await projectManager.handleTool('get_project', {
      id: createResult.project_id,
    });

    expect(project.id).toBe(createResult.project_id);
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('Test Description');
  });

  it('should list all projects', async () => {
    // Create a few projects
    await projectManager.handleTool('create_project', { name: 'Project 1' });
    await projectManager.handleTool('create_project', { name: 'Project 2' });

    const projects = await projectManager.handleTool('list_projects', {});
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(2);
  });

  it('should throw error for unknown tool', async () => {
    await expect(
      projectManager.handleTool('unknown_tool', {})
    ).rejects.toThrow('Unknown tool: unknown_tool');
  });
});
