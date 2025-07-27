import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
// import { z } from 'zod'; // TODO: Remove if not needed

/**
 * Memory Assistant Tool for LLMs without thinking capabilities
 * Provides structured memory management and context persistence
 */
export class MemoryAssistantTool {
  constructor(private db: DatabaseManager) {}

  getTools(): Tool[] {
    return [
      {
        name: 'store_session_context',
        description:
          'Store current session context, decisions, and analysis for future retrieval. Use this to persist important information that would normally be lost between sessions.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            session_type: {
              type: 'string',
              enum: [
                'analysis',
                'implementation',
                'debugging',
                'planning',
                'review',
              ],
              description: 'Type of session being stored',
            },
            key_insights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key insights or findings from this session',
            },
            decisions_made: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  decision: { type: 'string' },
                  reasoning: { type: 'string' },
                  alternatives_considered: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['decision', 'reasoning'],
              },
              description: 'Decisions made during this session',
            },
            code_changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file_path: { type: 'string' },
                  change_type: {
                    type: 'string',
                    enum: ['created', 'modified', 'deleted', 'refactored'],
                  },
                  description: { type: 'string' },
                  impact: { type: 'string' },
                },
                required: ['file_path', 'change_type', 'description'],
              },
              description: 'Code changes made during this session',
            },
            next_steps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recommended next steps or actions',
            },
            context_summary: {
              type: 'string',
              description: 'Brief summary of the session context',
            },
          },
          required: ['project_id', 'session_type', 'context_summary'],
        },
      },
      {
        name: 'retrieve_relevant_context',
        description:
          'Retrieve relevant context and memory for the current task. Use this at the start of sessions to understand previous work and decisions.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            current_task: {
              type: 'string',
              description: 'Description of current task or question',
            },
            session_types: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'analysis',
                  'implementation',
                  'debugging',
                  'planning',
                  'review',
                ],
              },
              description: 'Types of sessions to search (optional)',
            },
            include_code_changes: {
              type: 'boolean',
              default: true,
              description: 'Include code change history',
            },
            include_decisions: {
              type: 'boolean',
              default: true,
              description: 'Include previous decisions',
            },
            max_results: {
              type: 'number',
              default: 10,
              description: 'Maximum number of context entries to return',
            },
          },
          required: ['project_id', 'current_task'],
        },
      },
      {
        name: 'create_knowledge_snapshot',
        description:
          'Create a comprehensive knowledge snapshot of the current project state. Use this to capture complete understanding for complex projects.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            snapshot_name: {
              type: 'string',
              description: 'Name for this knowledge snapshot',
            },
            architecture_overview: {
              type: 'string',
              description: 'High-level architecture description',
            },
            key_components: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  purpose: { type: 'string' },
                  dependencies: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  status: {
                    type: 'string',
                    enum: [
                      'planned',
                      'in-progress',
                      'completed',
                      'needs-review',
                    ],
                  },
                },
                required: ['name', 'purpose', 'status'],
              },
              description: 'Key project components',
            },
            technical_constraints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Technical constraints and limitations',
            },
            design_patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Design patterns being used',
            },
            current_challenges: {
              type: 'array',
              items: { type: 'string' },
              description: 'Current challenges or blockers',
            },
          },
          required: ['project_id', 'snapshot_name', 'architecture_overview'],
        },
      },
      {
        name: 'query_project_knowledge',
        description:
          'Query the project knowledge base with natural language. Use this to find specific information without manual searching.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            query: {
              type: 'string',
              description: 'Natural language query about the project',
            },
            knowledge_types: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'decisions',
                  'architecture',
                  'code_changes',
                  'insights',
                  'challenges',
                  'patterns',
                ],
              },
              description: 'Types of knowledge to search (optional)',
            },
            time_range: {
              type: 'string',
              enum: ['last_day', 'last_week', 'last_month', 'all_time'],
              default: 'all_time',
              description: 'Time range for search',
            },
          },
          required: ['project_id', 'query'],
        },
      },
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'store_session_context':
        return await this.storeSessionContext(args);

      case 'retrieve_relevant_context':
        return await this.retrieveRelevantContext(args);

      case 'create_knowledge_snapshot':
        return await this.createKnowledgeSnapshot(args);

      case 'query_project_knowledge':
        return await this.queryProjectKnowledge(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async storeSessionContext(args: any): Promise<any> {
    const sessionData = {
      session_type: args.session_type,
      key_insights: args.key_insights || [],
      decisions_made: args.decisions_made || [],
      code_changes: args.code_changes || [],
      next_steps: args.next_steps || [],
      context_summary: args.context_summary,
    };

    const memoryId = await this.db.addMemory({
      project_id: args.project_id,
      event_type: 'session_context',
      content: args.context_summary,
      metadata: {
        session_data: sessionData,
        stored_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      memory_id: memoryId,
      stored_items: {
        insights: args.key_insights?.length || 0,
        decisions: args.decisions_made?.length || 0,
        code_changes: args.code_changes?.length || 0,
        next_steps: args.next_steps?.length || 0,
      },
    };
  }

  private async retrieveRelevantContext(args: any): Promise<any> {
    const recentMemory = await this.db.getRecentMemory(
      args.project_id,
      args.max_results || 10
    );

    // Filter by session types if specified
    let filteredMemory = recentMemory;
    if (args.session_types && args.session_types.length > 0) {
      filteredMemory = recentMemory.filter(
        entry =>
          entry.metadata.session_data &&
          args.session_types.includes(entry.metadata.session_data.session_type)
      );
    }

    // Extract relevant information based on current task
    const relevantContext = {
      current_task: args.current_task,
      relevant_sessions: filteredMemory.map(entry => ({
        id: entry.id,
        session_type: entry.metadata.session_data?.session_type,
        summary: entry.content,
        timestamp: entry.timestamp,
        key_insights: entry.metadata.session_data?.key_insights || [],
        decisions: args.include_decisions
          ? entry.metadata.session_data?.decisions_made || []
          : [],
        code_changes: args.include_code_changes
          ? entry.metadata.session_data?.code_changes || []
          : [],
        next_steps: entry.metadata.session_data?.next_steps || [],
      })),
      total_sessions_found: filteredMemory.length,
    };

    return relevantContext;
  }

  private async createKnowledgeSnapshot(args: any): Promise<any> {
    const snapshotData = {
      snapshot_name: args.snapshot_name,
      architecture_overview: args.architecture_overview,
      key_components: args.key_components || [],
      technical_constraints: args.technical_constraints || [],
      design_patterns: args.design_patterns || [],
      current_challenges: args.current_challenges || [],
      created_at: new Date().toISOString(),
    };

    const memoryId = await this.db.addMemory({
      project_id: args.project_id,
      event_type: 'knowledge_snapshot',
      content: `Knowledge Snapshot: ${args.snapshot_name}`,
      metadata: {
        snapshot_data: snapshotData,
        type: 'comprehensive_snapshot',
      },
    });

    return {
      success: true,
      snapshot_id: memoryId,
      snapshot_name: args.snapshot_name,
      components_captured: args.key_components?.length || 0,
      constraints_documented: args.technical_constraints?.length || 0,
      patterns_identified: args.design_patterns?.length || 0,
    };
  }

  private async queryProjectKnowledge(args: any): Promise<any> {
    const queryLower = args.query.toLowerCase();
    const recentMemory = await this.db.getRecentMemory(args.project_id, 100);

    // Simple relevance scoring based on content matching
    const scoredResults = recentMemory
      .map(entry => {
        let score = 0;
        const content = entry.content.toLowerCase();
        const metadata = JSON.stringify(entry.metadata).toLowerCase();

        // Basic keyword matching
        const queryWords = queryLower.split(' ');
        queryWords.forEach((word: string) => {
          if (content.includes(word)) score += 2;
          if (metadata.includes(word)) score += 1;
        });

        return { ...entry, relevance_score: score };
      })
      .filter(entry => entry.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 10);

    return {
      query: args.query,
      results_found: scoredResults.length,
      results: scoredResults.map(entry => ({
        id: entry.id,
        content: entry.content,
        event_type: entry.event_type,
        timestamp: entry.timestamp,
        relevance_score: entry.relevance_score,
        key_data: this.extractKeyData(entry.metadata, args.knowledge_types),
      })),
    };
  }

  private extractKeyData(metadata: any, knowledgeTypes?: string[]): any {
    const extracted: any = {};

    if (!knowledgeTypes || knowledgeTypes.includes('decisions')) {
      extracted.decisions = metadata.session_data?.decisions_made || [];
    }

    if (!knowledgeTypes || knowledgeTypes.includes('architecture')) {
      extracted.architecture = metadata.snapshot_data?.architecture_overview;
    }

    if (!knowledgeTypes || knowledgeTypes.includes('code_changes')) {
      extracted.code_changes = metadata.session_data?.code_changes || [];
    }

    if (!knowledgeTypes || knowledgeTypes.includes('insights')) {
      extracted.insights = metadata.session_data?.key_insights || [];
    }

    if (!knowledgeTypes || knowledgeTypes.includes('challenges')) {
      extracted.challenges = metadata.snapshot_data?.current_challenges || [];
    }

    if (!knowledgeTypes || knowledgeTypes.includes('patterns')) {
      extracted.patterns = metadata.snapshot_data?.design_patterns || [];
    }

    return extracted;
  }
}
