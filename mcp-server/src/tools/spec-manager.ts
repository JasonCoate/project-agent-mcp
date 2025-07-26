import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
import { z } from 'zod';

const createSpecSchema = z.object({
  project_id: z.string(),
  type: z.enum(['requirement', 'technical', 'design', 'acceptance']),
  title: z.string(),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

export class SpecManagerTool {
  constructor(private db: DatabaseManager) {}

  getTools(): Tool[] {
    return [
      {
        name: "create_spec",
        description: "Create a new specification",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID" },
            type: { 
              type: "string", 
              enum: ["requirement", "technical", "design", "acceptance"],
              description: "Specification type"
            },
            title: { type: "string", description: "Specification title" },
            content: { type: "string", description: "Specification content" },
            priority: { 
              type: "string", 
              enum: ["low", "medium", "high", "critical"],
              default: "medium"
            }
          },
          required: ["project_id", "type", "title", "content"]
        }
      },
      {
        name: "get_specs",
        description: "Get all specifications for a project",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID" }
          },
          required: ["project_id"]
        }
      },
      {
        name: "update_spec",
        description: "Update a specification",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Spec ID" },
            title: { type: "string", description: "Specification title" },
            content: { type: "string", description: "Specification content" },
            status: { 
              type: "string", 
              enum: ["draft", "active", "deprecated"]
            },
            priority: { 
              type: "string", 
              enum: ["low", "medium", "high", "critical"]
            }
          },
          required: ["id"]
        }
      },
      {
        name: "validate_specs",
        description: "Validate project specifications for consistency",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID" }
          },
          required: ["project_id"]
        }
      }
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "create_spec":
        const specData = createSpecSchema.parse(args);
        const specId = await this.db.createSpec({
          ...specData,
          status: 'draft'
        });
        await this.db.addMemory({
          project_id: specData.project_id,
          event_type: 'spec_change',
          content: `New ${specData.type} specification created: ${specData.title}`,
          metadata: { action: 'create_spec', spec_id: specId, type: specData.type }
        });
        return { success: true, spec_id: specId };

      case "get_specs":
        return await this.db.getSpecsByProject(args.project_id);

      case "update_spec":
        const { id, ...updates } = args;
        await this.db.updateSpec(id, updates);
        
        // Get spec to find project_id for memory logging
        const spec = await this.db.getSpecsByProject(''); // Need to implement getSpec by ID
        await this.db.addMemory({
          project_id: args.project_id || '', // Would need to fetch this
          event_type: 'spec_change',
          content: `Specification updated: ${JSON.stringify(updates)}`,
          metadata: { action: 'update_spec', spec_id: id, changes: updates }
        });
        return { success: true };

      case "validate_specs":
        const specs = await this.db.getSpecsByProject(args.project_id);
        const validation = this.validateSpecConsistency(specs);
        
        if (validation.issues.length > 0) {
          await this.db.addMemory({
            project_id: args.project_id,
            event_type: 'issue',
            content: `Spec validation found ${validation.issues.length} issues`,
            metadata: { action: 'validate_specs', issues: validation.issues }
          });
        }
        
        return validation;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private validateSpecConsistency(specs: any[]): any {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for missing critical specs
    const hasRequirements = specs.some(s => s.type === 'requirement');
    const hasTechnical = specs.some(s => s.type === 'technical');
    
    if (!hasRequirements) issues.push("No requirement specifications found");
    if (!hasTechnical) warnings.push("No technical specifications found");

    // Check for conflicting requirements
    const activeSpecs = specs.filter(s => s.status === 'active');
    const priorities = activeSpecs.map(s => s.priority);
    const criticalCount = priorities.filter(p => p === 'critical').length;
    
    if (criticalCount > 3) {
      warnings.push("Too many critical priority specs - consider reviewing priorities");
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      summary: {
        total_specs: specs.length,
        active_specs: activeSpecs.length,
        by_type: specs.reduce((acc, spec) => {
          acc[spec.type] = (acc[spec.type] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }
}