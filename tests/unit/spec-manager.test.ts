import { describe, it, expect, beforeEach } from '@jest/globals';
import { Spec } from '../../mcp-server/src/types/index';
import { SpecManagerTool } from '../../mcp-server/src/tools/spec-manager';

// Mock DatabaseManager for testing
class MockDatabaseManager {
  private specs: Map<string, Spec> = new Map();
  private specCounter = 1;
  private memories: any[] = [];

  async createSpec(data: any): Promise<string> {
    const id = `spec_${this.specCounter++}`;
    const spec: Spec = {
      id,
      project_id: data.project_id,
      type: data.type,
      title: data.title,
      content: data.content,
      status: data.status || 'draft',
      priority: data.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.specs.set(id, spec);
    return id;
  }

  async updateSpec(id: string, updates: Partial<Spec>): Promise<void> {
    const spec = this.specs.get(id);
    if (spec) {
      Object.assign(spec, updates, { updated_at: new Date().toISOString() });
    }
  }

  async getSpecsByProject(projectId: string): Promise<Spec[]> {
    return Array.from(this.specs.values()).filter(spec => spec.project_id === projectId);
  }

  async addMemory(data: any): Promise<void> {
    this.memories.push(data);
  }

  // Helper methods for testing
  getMemories(): any[] {
    return this.memories;
  }

  getSpec(id: string): Spec | undefined {
    return this.specs.get(id);
  }
}

describe('SpecManagerTool', () => {
  let specManager: SpecManagerTool;
  let mockDb: MockDatabaseManager;

  beforeEach(() => {
    mockDb = new MockDatabaseManager();
    specManager = new SpecManagerTool(mockDb as any);
  });

  describe('getTools', () => {
    it('should return correct tool definitions', () => {
      const tools = specManager.getTools();
      expect(tools).toHaveLength(4);
      expect(tools[0].name).toBe('create_spec');
      expect(tools[1].name).toBe('get_specs');
      expect(tools[2].name).toBe('update_spec');
      expect(tools[3].name).toBe('validate_specs');
    });

    it('should have proper input schemas', () => {
      const tools = specManager.getTools();
      const createSpecTool = tools.find(t => t.name === 'create_spec');
      expect(createSpecTool?.inputSchema.properties).toHaveProperty('project_id');
      expect(createSpecTool?.inputSchema.properties).toHaveProperty('type');
      expect(createSpecTool?.inputSchema.properties).toHaveProperty('title');
      expect(createSpecTool?.inputSchema.properties).toHaveProperty('content');
      expect(createSpecTool?.inputSchema.required).toContain('project_id');
      expect(createSpecTool?.inputSchema.required).toContain('type');
      expect(createSpecTool?.inputSchema.required).toContain('title');
      expect(createSpecTool?.inputSchema.required).toContain('content');
    });

    it('should have correct enum values for spec types', () => {
      const tools = specManager.getTools();
      const createSpecTool = tools.find(t => t.name === 'create_spec');
      expect(createSpecTool).toBeDefined();
      expect(createSpecTool?.inputSchema.properties).toBeDefined();
      const typeProperty = createSpecTool?.inputSchema.properties?.type as any;
      expect(typeProperty?.enum).toContain('requirement');
      expect(typeProperty?.enum).toContain('technical');
      expect(typeProperty?.enum).toContain('design');
      expect(typeProperty?.enum).toContain('acceptance');
    });
  });

  describe('create_spec', () => {
    it('should create a spec successfully with minimal data', async () => {
      const result = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Test Requirement',
        content: 'This is a test requirement specification.',
      });

      expect(result.success).toBe(true);
      expect(result.spec_id).toBeDefined();
      expect(typeof result.spec_id).toBe('string');
    });

    it('should create a spec with all fields', async () => {
      const result = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical Specification',
        content: 'Detailed technical requirements and implementation details.',
        priority: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.spec_id).toBeDefined();
    });

    it('should create spec with default priority', async () => {
      const result = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'design',
        title: 'Design Spec',
        content: 'Design specification content.',
      });

      const spec = mockDb.getSpec(result.spec_id);
      expect(spec?.priority).toBe('medium');
    });

    it('should add memory when creating a spec', async () => {
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Test Requirement',
        content: 'Test content',
      });

      const memories = mockDb.getMemories();
      expect(memories).toHaveLength(1);
      expect(memories[0].event_type).toBe('spec_change');
      expect(memories[0].content).toContain('New requirement specification created: Test Requirement');
      expect(memories[0].metadata.action).toBe('create_spec');
      expect(memories[0].metadata.type).toBe('requirement');
    });

    it('should throw error for invalid spec type', async () => {
      await expect(
        specManager.handleTool('create_spec', {
          project_id: 'project-1',
          type: 'invalid-type',
          title: 'Test Spec',
          content: 'Test content',
        })
      ).rejects.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      await expect(
        specManager.handleTool('create_spec', {
          project_id: 'project-1',
          // Missing type, title, and content
        })
      ).rejects.toThrow();
    });
  });

  describe('get_specs', () => {
    beforeEach(async () => {
      // Create some test specs
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Requirement 1',
        content: 'First requirement',
      });
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical 1',
        content: 'First technical spec',
      });
      await specManager.handleTool('create_spec', {
        project_id: 'project-2',
        type: 'requirement',
        title: 'Requirement 2',
        content: 'Second requirement',
      });
    });

    it('should get all specs for a project', async () => {
      const specs = await specManager.handleTool('get_specs', {
        project_id: 'project-1',
      });

      expect(Array.isArray(specs)).toBe(true);
      expect(specs).toHaveLength(2);
      expect(specs.every((spec: Spec) => spec.project_id === 'project-1')).toBe(true);
    });

    it('should return empty array for project with no specs', async () => {
      const specs = await specManager.handleTool('get_specs', {
        project_id: 'nonexistent-project',
      });

      expect(Array.isArray(specs)).toBe(true);
      expect(specs).toHaveLength(0);
    });
  });

  describe('update_spec', () => {
    let specId: string;

    beforeEach(async () => {
      const result = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Original Title',
        content: 'Original content',
      });
      specId = result.spec_id;
    });

    it('should update spec title', async () => {
      const result = await specManager.handleTool('update_spec', {
        id: specId,
        title: 'Updated Title',
      });

      expect(result.success).toBe(true);
      const spec = mockDb.getSpec(specId);
      expect(spec?.title).toBe('Updated Title');
    });

    it('should update spec content', async () => {
      const result = await specManager.handleTool('update_spec', {
        id: specId,
        content: 'Updated content with more details',
      });

      expect(result.success).toBe(true);
      const spec = mockDb.getSpec(specId);
      expect(spec?.content).toBe('Updated content with more details');
    });

    it('should update spec status', async () => {
      const result = await specManager.handleTool('update_spec', {
        id: specId,
        status: 'active',
      });

      expect(result.success).toBe(true);
      const spec = mockDb.getSpec(specId);
      expect(spec?.status).toBe('active');
    });

    it('should update spec priority', async () => {
      const result = await specManager.handleTool('update_spec', {
        id: specId,
        priority: 'critical',
      });

      expect(result.success).toBe(true);
      const spec = mockDb.getSpec(specId);
      expect(spec?.priority).toBe('critical');
    });

    it('should update multiple fields at once', async () => {
      const result = await specManager.handleTool('update_spec', {
        id: specId,
        title: 'New Title',
        content: 'New content',
        status: 'active',
        priority: 'high',
      });

      expect(result.success).toBe(true);
      const spec = mockDb.getSpec(specId);
      expect(spec?.title).toBe('New Title');
      expect(spec?.content).toBe('New content');
      expect(spec?.status).toBe('active');
      expect(spec?.priority).toBe('high');
    });

    it('should add memory when updating a spec', async () => {
      await specManager.handleTool('update_spec', {
        id: specId,
        title: 'Updated Title',
        status: 'active',
      });

      const memories = mockDb.getMemories();
      // Should have 2 memories: 1 from creation, 1 from update
      expect(memories).toHaveLength(2);
      const updateMemory = memories[1];
      expect(updateMemory.event_type).toBe('spec_change');
      expect(updateMemory.content).toContain('Specification updated:');
      expect(updateMemory.metadata.action).toBe('update_spec');
    });
  });

  describe('validate_specs', () => {
    it('should validate specs with no issues', async () => {
      // Create a good set of specs
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Requirement 1',
        content: 'First requirement',
        priority: 'high',
      });
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical 1',
        content: 'Technical specification',
        priority: 'medium',
      });

      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.summary.total_specs).toBe(2);
      expect(validation.summary.by_type.requirement).toBe(1);
      expect(validation.summary.by_type.technical).toBe(1);
    });

    it('should identify missing requirement specs', async () => {
      // Create only technical specs
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical 1',
        content: 'Technical specification',
      });

      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('No requirement specifications found');
    });

    it('should warn about missing technical specs', async () => {
      // Create only requirement specs
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Requirement 1',
        content: 'First requirement',
      });

      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      expect(validation.valid).toBe(true); // No critical issues
      expect(validation.warnings).toContain('No technical specifications found');
    });

    it('should warn about too many critical priority specs', async () => {
      // Create 4 critical specs and set them to active
      const specIds = [];
      for (let i = 1; i <= 4; i++) {
        const result = await specManager.handleTool('create_spec', {
          project_id: 'project-1',
          type: 'requirement',
          title: `Critical Requirement ${i}`,
          content: `Critical requirement ${i}`,
          priority: 'critical',
        });
        specIds.push(result.spec_id);
      }
      
      // Set all critical specs to active status
      for (const specId of specIds) {
        await specManager.handleTool('update_spec', {
          id: specId,
          status: 'active',
        });
      }
      
      // Add a technical spec to avoid the "No technical specifications found" warning
      const techResult = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical Spec',
        content: 'Technical specification',
        priority: 'medium',
      });
      
      await specManager.handleTool('update_spec', {
        id: techResult.spec_id,
        status: 'active',
      });

      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      expect(validation.warnings).toContain(
        'Too many critical priority specs - consider reviewing priorities'
      );
    });

    it('should handle project with no specs', async () => {
      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'empty-project',
      });

      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('No requirement specifications found');
      expect(validation.summary.total_specs).toBe(0);
    });

    it('should add memory when validation finds issues', async () => {
      // Create project with missing requirements
      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'design',
        title: 'Design 1',
        content: 'Design specification',
      });

      await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      const memories = mockDb.getMemories();
      // Should have 2 memories: 1 from creation, 1 from validation
      expect(memories).toHaveLength(2);
      const validationMemory = memories[1];
      expect(validationMemory.event_type).toBe('issue');
      expect(validationMemory.content).toContain('Spec validation found');
      expect(validationMemory.metadata.action).toBe('validate_specs');
    });

    it('should count active specs correctly', async () => {
      // Create specs with different statuses
      const spec1 = await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'requirement',
        title: 'Requirement 1',
        content: 'First requirement',
      });
      
      await specManager.handleTool('update_spec', {
        id: spec1.spec_id,
        status: 'active',
      });

      await specManager.handleTool('create_spec', {
        project_id: 'project-1',
        type: 'technical',
        title: 'Technical 1',
        content: 'Technical spec',
      });
      // This one stays as 'draft'

      const validation = await specManager.handleTool('validate_specs', {
        project_id: 'project-1',
      });

      expect(validation.summary.total_specs).toBe(2);
      expect(validation.summary.active_specs).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(
        specManager.handleTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });
});