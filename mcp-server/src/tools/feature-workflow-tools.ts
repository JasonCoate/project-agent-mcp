import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from '../database.js';
import { FeatureWorkflowManager } from './feature-workflow-manager.js';
import { ConversationalWrapper } from './conversational-wrapper.js';
import { TaskListManager } from './task-list-manager.js';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  project_id: z.string(),
  feature_name: z.string(),
  description: z.string().optional(),
});

const workflowIdSchema = z.object({
  workflow_id: z.string(),
});

const projectIdSchema = z.object({
  project_id: z.string(),
});

const taskIdSchema = z.object({
  task_id: z.string(),
  notes: z.string().optional(),
});

const addTaskSchema = z.object({
  workflow_id: z.string(),
  phase: z.string(),
  description: z.string(),
});

const getTasksSchema = z.object({
  workflow_id: z.string(),
  phase: z.string().optional(),
  completed: z.boolean().optional(),
});

export class FeatureWorkflowTools {
  private manager: FeatureWorkflowManager;
  private conversational: ConversationalWrapper;
  private taskManager: TaskListManager;
  private projectRoot: string;

  constructor(db: DatabaseManager, projectRoot: string) {
    this.manager = new FeatureWorkflowManager(db, projectRoot);
    this.conversational = new ConversationalWrapper(db);
    this.taskManager = new TaskListManager(db, projectRoot);
    this.projectRoot = projectRoot;
  }

  getTools(): Tool[] {
    return [
      {
        name: 'create_feature_workflow',
        description: 'Create a new feature workflow for development',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            feature_name: {
              type: 'string',
              description: 'Name of the feature',
            },
            description: {
              type: 'string',
              description: 'Optional description',
            },
          },
          required: ['project_id', 'feature_name'],
        },
      },
      {
        name: 'get_feature_workflow',
        description: 'Get details of a specification workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['workflow_id'],
        },
      },
      {
        name: 'list_feature_workflows',
        description: 'List all specification workflows for a project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'complete_workflow_task',
        description: 'Mark a workflow task as completed',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: { type: 'string', description: 'Task ID' },
            notes: { type: 'string', description: 'Optional completion notes' },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'uncomplete_workflow_task',
        description: 'Mark a workflow task as incomplete',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: { type: 'string', description: 'Task ID' },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'add_workflow_task',
        description: 'Add a custom task to a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'Workflow ID' },
            phase: { type: 'string', description: 'Workflow phase' },
            description: { type: 'string', description: 'Task description' },
          },
          required: ['workflow_id', 'phase', 'description'],
        },
      },
      {
        name: 'get_workflow_tasks',
        description: 'Get tasks for a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'Workflow ID' },
            phase: { type: 'string', description: 'Optional phase filter' },
            completed: {
              type: 'boolean',
              description: 'Optional completion filter',
            },
          },
          required: ['workflow_id'],
        },
      },
      {
        name: 'delete_feature_workflow',
        description: 'Delete a specification workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['workflow_id'],
        },
      },
      {
        name: 'get_workflow_summary',
        description: 'Get a summary of workflow progress and next actions',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['workflow_id'],
        },
      },
      {
        name: 'update_task_with_sync',
        description:
          'Update a task status with markdown and database synchronization',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'The workflow ID' },
            task_id: { type: 'string', description: 'The task ID to update' },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the task update',
            },
          },
          required: ['workflow_id', 'task_id', 'completed'],
        },
      },
      {
        name: 'add_task_with_sync',
        description:
          'Add a new task with markdown and database synchronization',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'The workflow ID' },
            phase: {
              type: 'string',
              description: 'The phase this task belongs to',
            },
            description: { type: 'string', description: 'Task description' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Task priority',
            },
          },
          required: ['workflow_id', 'phase', 'description'],
        },
      },
      {
        name: 'generate_progress_summary',
        description: 'Generate a progress summary for a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'The workflow ID' },
          },
          required: ['workflow_id'],
        },
      },
      {
        name: 'create_checkpoint',
        description: 'Create a checkpoint validation for a workflow phase',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_id: { type: 'string', description: 'The workflow ID' },
            phase: {
              type: 'string',
              description: 'The phase to create a checkpoint for',
            },
          },
          required: ['workflow_id', 'phase'],
        },
      },
      {
        name: 'create_feature_directory',
        description:
          'Create a feature directory structure with specs, tasks, and documentation',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'The project ID' },
            feature_name: {
              type: 'string',
              description: 'The feature name (will be used as directory name)',
            },
            description: { type: 'string', description: 'Feature description' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  phase: { type: 'string', description: 'Task phase/category' },
                  description: {
                    type: 'string',
                    description: 'Task description',
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                    description: 'Task priority',
                  },
                },
                required: ['phase', 'description'],
              },
              description: 'Array of tasks for this feature',
            },
          },
          required: ['project_id', 'feature_name', 'description'],
        },
      },
      {
        name: 'update_feature_task',
        description: 'Update a task within a specific feature',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'The project ID' },
            feature_name: { type: 'string', description: 'The feature name' },
            task_description: {
              type: 'string',
              description: 'The task description to find and update',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the task update',
            },
          },
          required: [
            'project_id',
            'feature_name',
            'task_description',
            'completed',
          ],
        },
      },
      {
        name: 'get_feature_progress',
        description: 'Get progress summary for a specific feature',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'The project ID' },
            feature_name: { type: 'string', description: 'The feature name' },
          },
          required: ['project_id', 'feature_name'],
        },
      },
      {
        name: 'list_project_features',
        description: 'List all features for a project with their progress',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'The project ID' },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'create_feature_checkpoint',
        description: 'Create a checkpoint for a completed feature',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'The project ID' },
            feature_name: { type: 'string', description: 'The feature name' },
            validation_notes: {
              type: 'string',
              description: 'Notes about feature validation and completion',
            },
          },
          required: ['project_id', 'feature_name'],
        },
      },
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'create_feature_workflow':
        return await this.createFeatureWorkflow(args);
      case 'get_feature_workflow':
        return await this.getFeatureWorkflow(args);
      case 'list_feature_workflows':
        return await this.listFeatureWorkflows(args);
      case 'complete_workflow_task':
        return await this.completeWorkflowTask(args);
      case 'uncomplete_workflow_task':
        return await this.uncompleteWorkflowTask(args);
      case 'add_workflow_task':
        return await this.addWorkflowTask(args);
      case 'get_workflow_tasks':
        return await this.getWorkflowTasks(args);
      case 'delete_feature_workflow':
        return await this.deleteFeatureWorkflow(args);
      case 'get_workflow_summary':
        return await this.handleGetWorkflowSummary(args);
      case 'update_task_with_sync':
        return await this.handleUpdateTaskWithSync(args);
      case 'add_task_with_sync':
        return await this.handleAddTaskWithSync(args);
      case 'generate_progress_summary':
        return await this.handleGenerateProgressSummary(args);
      case 'create_checkpoint':
        return await this.handleCreateCheckpoint(args);
      case 'create_feature_directory':
        return await this.createFeatureDirectory(args);
      case 'update_feature_task':
        return await this.updateFeatureTask(args);
      case 'get_feature_progress':
        return await this.getFeatureProgress(args);
      case 'list_project_features':
        return await this.listProjectFeatures(args);
      case 'create_feature_checkpoint':
        return await this.createFeatureCheckpoint(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async createFeatureWorkflow(args: any) {
    return await this.conversational.wrapToolCall(
      'create_feature_workflow',
      args,
      async () => {
        try {
          const data = createWorkflowSchema.parse(args);
          const workflow = await this.manager.createFeatureWorkflow(
            data.project_id,
            data.feature_name
          );
          return {
            success: true,
            workflow_id: workflow.id,
            message: `Feature workflow created successfully: ${data.feature_name}`,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
      {
        purpose: `Creating feature workflow for: ${args.feature_name}`,
        phase: 'workflow_setup',
        workflowId: undefined, // Will be set after creation
      }
    );
  }

  async getFeatureWorkflow(args: any) {
    try {
      const data = workflowIdSchema.parse(args);
      const workflow = await this.manager.getWorkflow(data.workflow_id);
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow not found',
        };
      }
      return {
        success: true,
        workflow,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async listFeatureWorkflows(args: any) {
    try {
      const data = projectIdSchema.parse(args);
      const workflows = await this.manager.getWorkflowsByProject(
        data.project_id
      );
      return {
        success: true,
        workflows,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async completeWorkflowTask(args: any) {
    try {
      const data = taskIdSchema.parse(args);
      await this.manager.completeTask(data.task_id, data.notes);
      return {
        success: true,
        message: 'Task marked as completed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uncompleteWorkflowTask(args: any) {
    try {
      const data = taskIdSchema.parse(args);
      await this.manager.uncompleteTask(data.task_id);
      return {
        success: true,
        message: 'Task marked as incomplete',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async addWorkflowTask(args: any) {
    try {
      const data = addTaskSchema.parse(args);
      const taskId = await this.manager.addCustomTask(
        data.workflow_id,
        data.phase,
        data.description
      );
      return {
        success: true,
        task_id: taskId,
        message: 'Custom task added to workflow',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getWorkflowTasks(args: any) {
    try {
      const data = getTasksSchema.parse(args);
      let tasks = await this.manager.getWorkflowTasks(data.workflow_id);

      if (data.phase) {
        tasks = tasks.filter(task => task.phase === data.phase);
      }

      if (data.completed !== undefined) {
        tasks = tasks.filter(task => task.completed === data.completed);
      }

      return {
        success: true,
        tasks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteFeatureWorkflow(args: any) {
    try {
      const data = workflowIdSchema.parse(args);
      await this.manager.deleteWorkflow(data.workflow_id);
      return {
        success: true,
        message: 'Workflow deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getWorkflowSummary(args: any) {
    try {
      const data = workflowIdSchema.parse(args);
      const summary = await this.manager.getWorkflowSummary(data.workflow_id);
      return {
        success: true,
        summary: {
          workflow_id: data.workflow_id,
          total_tasks: summary.totalTasks,
          completed_tasks: summary.completedTasks,
          progress_percentage: summary.progressPercentage,
          current_phase: summary.currentPhase,
          next_actions: summary.nextActions,
          recent_activity: summary.recentActivity,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update task with markdown and database synchronization
   */
  private async handleUpdateTaskWithSync(args: any) {
    try {
      const result = await this.taskManager.updateTask(
        args.workflow_id,
        args.task_id,
        args.completed,
        args.notes
      );

      return {
        success: true,
        data: {
          markdownUpdated: result.markdownUpdated,
          databaseUpdated: result.databaseUpdated,
          message: result.chatMessage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add task with markdown and database synchronization
   */
  private async handleAddTaskWithSync(args: any) {
    try {
      const result = await this.taskManager.addTask(
        args.workflow_id,
        args.phase,
        args.description,
        args.priority || 'medium'
      );

      return {
        success: true,
        data: {
          taskId: result.taskId,
          markdownUpdated: result.markdownUpdated,
          databaseUpdated: result.databaseUpdated,
          message: result.chatMessage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate progress summary for a workflow
   */
  private async handleGenerateProgressSummary(args: any) {
    try {
      const summary = await this.taskManager.generateProgressSummary(
        args.workflow_id
      );

      return {
        success: true,
        data: {
          summary,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create checkpoint for a workflow phase
   */
  private async handleCreateCheckpoint(args: any) {
    try {
      const checkpoint = await this.taskManager.createCheckpoint(
        args.workflow_id,
        args.phase
      );

      return {
        success: true,
        data: {
          checkpoint,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle get workflow summary (renamed for consistency)
   */
  private async handleGetWorkflowSummary(args: any) {
    return await this.getWorkflowSummary(args);
  }

  /**
   * Create a feature directory structure with specs, tasks, and documentation
   */
  async createFeatureDirectory(args: any) {
    try {
      const {
        project_id,
        feature_name,
        description,
        tasks = [],
        workflow_type = 'feat',
      } = args;
      const fs = require('fs').promises;
      const path = require('path');

      // Get next sequential number for this project
      const projectSpecsDir = path.join(this.projectRoot, '.specs', project_id);
      await fs.mkdir(projectSpecsDir, { recursive: true });

      const existingDirs = await fs.readdir(projectSpecsDir).catch(() => []);
      const numbers = existingDirs
        .filter((dir: string) => /^\d+-/.test(dir))
        .map((dir: string) => parseInt(dir.split('-')[0]))
        .filter((num: number) => !isNaN(num));
      const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

      // Create numbered directory with conventional commit prefix
      const dirName = `${nextNumber}-${workflow_type}-${feature_name.toLowerCase().replace(/\s+/g, '-')}`;
      const featureDir = path.join(projectSpecsDir, dirName);
      await fs.mkdir(featureDir, { recursive: true });

      // Create README.md
      const readmeContent = `# ${feature_name.charAt(0).toUpperCase() + feature_name.slice(1)} Feature\n\n${description}\n\n## Overview\n\nThis feature handles ${description.toLowerCase()}.\n\n## Dependencies\n\n- [ ] List any dependencies here\n\n## Implementation Notes\n\n- Add implementation notes as development progresses\n`;
      await fs.writeFile(path.join(featureDir, 'README.md'), readmeContent);

      // Create specs.md
      const specsContent = `# ${feature_name.charAt(0).toUpperCase() + feature_name.slice(1)} Specifications\n\n## Functional Requirements\n\n- [ ] Define functional requirements\n\n## Technical Requirements\n\n- [ ] Define technical requirements\n\n## Acceptance Criteria\n\n- [ ] Define acceptance criteria\n\n## API Specifications\n\n- [ ] Define API endpoints if applicable\n`;
      await fs.writeFile(path.join(featureDir, 'specs.md'), specsContent);

      // Create tasks.md with provided tasks
      let tasksContent = `# ${feature_name.charAt(0).toUpperCase() + feature_name.slice(1)} Tasks\n\n`;

      if (tasks.length > 0) {
        const tasksByPhase = tasks.reduce((acc: any, task: any) => {
          if (!acc[task.phase]) acc[task.phase] = [];
          acc[task.phase].push(task);
          return acc;
        }, {});

        for (const [phase, phaseTasks] of Object.entries(tasksByPhase)) {
          tasksContent += `## ${phase}\n\n`;
          for (const task of phaseTasks as any[]) {
            const priority = task.priority ? ` (${task.priority})` : '';
            tasksContent += `- [ ] ${task.description}${priority}\n`;
          }
          tasksContent += '\n';
        }
      } else {
        tasksContent +=
          '## Setup\n\n- [ ] Initialize feature structure\n\n## Development\n\n- [ ] Implement core functionality\n\n## Testing\n\n- [ ] Write unit tests\n- [ ] Write integration tests\n\n## Documentation\n\n- [ ] Update documentation\n';
      }

      await fs.writeFile(path.join(featureDir, 'tasks.md'), tasksContent);

      // Create tests.md
      const testsContent = `# ${feature_name.charAt(0).toUpperCase() + feature_name.slice(1)} Tests\n\n## Unit Tests\n\n- [ ] Test core functionality\n\n## Integration Tests\n\n- [ ] Test feature integration\n\n## End-to-End Tests\n\n- [ ] Test complete user workflows\n\n## Test Coverage\n\n- [ ] Ensure adequate test coverage\n`;
      await fs.writeFile(path.join(featureDir, 'tests.md'), testsContent);

      return {
        success: true,
        message: `Feature directory created for '${feature_name}' as '${dirName}'`,
        feature_path: featureDir,
        directory_name: dirName,
        files_created: ['README.md', 'specs.md', 'tasks.md', 'tests.md'],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update a task within a specific feature
   */
  async updateFeatureTask(args: any) {
    try {
      const {
        project_id,
        feature_directory,
        task_description,
        completed,
        notes,
      } = args;
      const fs = require('fs').promises;
      const path = require('path');

      const tasksFile = path.join(
        this.projectRoot,
        '.specs',
        project_id,
        feature_directory,
        'tasks.md'
      );

      // Read current tasks file
      const content = await fs.readFile(tasksFile, 'utf8');

      // Update the specific task
      const checkbox = completed ? '[x]' : '[ ]';
      const updatedContent = content.replace(
        new RegExp(
          `- \\[[ x]\\] ${task_description.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`,
          'g'
        ),
        `- ${checkbox} ${task_description}`
      );

      await fs.writeFile(tasksFile, updatedContent);

      return {
        success: true,
        message: `Task '${task_description}' updated in feature '${feature_directory}'`,
        completed,
        notes: notes || '',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get progress summary for a specific feature
   */
  async getFeatureProgress(args: any) {
    try {
      const { project_id, feature_directory } = args;
      const fs = require('fs').promises;
      const path = require('path');

      const tasksFile = path.join(
        this.projectRoot,
        '.specs',
        project_id,
        feature_directory,
        'tasks.md'
      );
      const content = await fs.readFile(tasksFile, 'utf8');

      // Count completed and total tasks
      const completedTasks = (content.match(/- \[x\]/g) || []).length;
      const totalTasks = (content.match(/- \[[x ]\]/g) || []).length;
      const progressPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        success: true,
        feature_directory,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        progress_percentage: progressPercentage,
        status:
          progressPercentage === 100
            ? 'completed'
            : progressPercentage > 0
              ? 'in_progress'
              : 'not_started',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List all features for a project with their progress
   */
  async listProjectFeatures(args: any) {
    try {
      const { project_id } = args;
      const fs = require('fs').promises;
      const path = require('path');

      const projectSpecsDir = path.join(this.projectRoot, '.specs', project_id);

      try {
        const featureDirectories = await fs.readdir(projectSpecsDir);
        const features = [];

        for (const featureDir of featureDirectories) {
          const featurePath = path.join(projectSpecsDir, featureDir);
          const stat = await fs.stat(featurePath);

          if (stat.isDirectory() && /^\d+-/.test(featureDir)) {
            // Get progress for this feature
            const progress = await this.getFeatureProgress({
              project_id,
              feature_directory: featureDir,
            });

            // Read description from README if available
            let description = '';
            try {
              const readmePath = path.join(featurePath, 'README.md');
              const readmeContent = await fs.readFile(readmePath, 'utf8');
              const descMatch = readmeContent.match(/# .+\n\n(.+)\n/);
              description = descMatch ? descMatch[1] : '';
            } catch {
              // README not found or unreadable
            }

            // Extract feature info from directory name
            const parts = featureDir.split('-');
            const number = parts[0];
            const type = parts[1];
            const name = parts.slice(2).join('-');

            features.push({
              directory: featureDir,
              number: parseInt(number),
              type,
              name,
              description,
              ...progress,
            });
          }
        }

        // Sort by number
        features.sort((a, b) => a.number - b.number);

        return {
          success: true,
          project_id,
          features,
        };
      } catch {
        // Project specs directory doesn't exist yet
        return {
          success: true,
          project_id,
          features: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a checkpoint for a completed feature
   */
  async createFeatureCheckpoint(args: any) {
    try {
      const { project_id, feature_directory, validation_notes } = args;
      const fs = require('fs').promises;
      const path = require('path');

      // Get feature progress
      const progress = await this.getFeatureProgress({
        project_id,
        feature_directory,
      });

      if (!progress.success) {
        throw new Error(
          `Failed to get progress for feature '${feature_directory}'`
        );
      }

      const timestamp = new Date().toISOString();
      const checkpointContent = `# Feature Checkpoint: ${feature_directory}\n\n**Date:** ${timestamp}\n**Progress:** ${progress.completed_tasks}/${progress.total_tasks} tasks completed (${progress.progress_percentage}%)\n**Status:** ${progress.status}\n\n## Validation Notes\n\n${validation_notes}\n\n## Summary\n\n${progress.progress_percentage === 100 ? 'Feature completed successfully!' : 'Feature checkpoint created for tracking progress.'}\n`;

      const checkpointFile = path.join(
        this.projectRoot,
        '.specs',
        project_id,
        feature_directory,
        `checkpoint-${Date.now()}.md`
      );
      await fs.writeFile(checkpointFile, checkpointContent);

      return {
        success: true,
        message: `Checkpoint created for feature '${feature_directory}'`,
        checkpoint_file: checkpointFile,
        progress: progress.progress_percentage,
        status: progress.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export function createFeatureWorkflowTools(
  db: DatabaseManager,
  projectRoot: string
) {
  return new FeatureWorkflowTools(db, projectRoot);
}
