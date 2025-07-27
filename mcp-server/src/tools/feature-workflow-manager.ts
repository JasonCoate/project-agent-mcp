import { DatabaseManager } from '../database.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FeatureWorkflow {
  id: string;
  project_id: string;
  feature_name: string;
  status: 'draft' | 'user-stories' | 'architecture' | 'implementation' | 'testing' | 'completed';
  current_phase: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTask {
  id: string;
  workflow_id: string;
  phase: string;
  task_description: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

export class FeatureWorkflowManager {
  private db: DatabaseManager;
  private featuresDir: string;

  constructor(db: DatabaseManager, projectRoot: string) {
    this.db = db;
    this.featuresDir = path.join(projectRoot, '.features');
  }

  async initializeDatabase(): Promise<void> {
    const createWorkflowTable = `
      CREATE TABLE IF NOT EXISTS spec_workflows (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        feature_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        current_phase TEXT NOT NULL DEFAULT 'user-stories',
        progress INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `;

    const createWorkflowTasksTable = `
      CREATE TABLE IF NOT EXISTS workflow_tasks (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        task_description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_id) REFERENCES spec_workflows (id)
      )
    `;

    await this.runQuery(createWorkflowTable);
    await this.runQuery(createWorkflowTasksTable);
  }

  private async runQuery(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      (this.db as any).db.run(sql, params, function(err: any) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async getQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      (this.db as any).db.get(sql, params, (err: any, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  private async allQuery(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      (this.db as any).db.all(sql, params, (err: any, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async createFeatureWorkflow(projectId: string, featureName: string): Promise<FeatureWorkflow> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: FeatureWorkflow = {
      id: workflowId,
      project_id: projectId,
      feature_name: featureName,
      status: 'draft',
      current_phase: 'user-stories',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.runQuery(
      `INSERT INTO spec_workflows (id, project_id, feature_name, status, current_phase, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [workflow.id, workflow.project_id, workflow.feature_name, workflow.status, workflow.current_phase, workflow.progress, workflow.created_at, workflow.updated_at]
    );

    // Create directory structure
    await this.createWorkflowDirectory(workflow);
    
    // Initialize workflow tasks
    await this.initializeWorkflowTasks(workflowId);

    return workflow;
  }

  private async createWorkflowDirectory(workflow: FeatureWorkflow): Promise<void> {
    // Get next sequential number for this project
    const projectFeaturesDir = path.join(this.featuresDir, workflow.project_id);
    await fs.mkdir(projectFeaturesDir, { recursive: true });
    
    const existingDirs = await fs.readdir(projectFeaturesDir).catch(() => []);
    const numbers = existingDirs
      .filter((dir: string) => /^\d+-/.test(dir))
      .map((dir: string) => parseInt(dir.split('-')[0]))
      .filter((num: number) => !isNaN(num));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    
    // Create numbered directory with conventional commit prefix (default to 'feat')
    const dirName = `${nextNumber}-feat-${workflow.feature_name.toLowerCase().replace(/\s+/g, '-')}`;
    const featureDir = path.join(projectFeaturesDir, dirName);
    
    try {
      await fs.mkdir(featureDir, { recursive: true });
      
      // Copy templates to feature directory
      const templatesDir = path.join(this.featuresDir, 'templates');
      const templates = ['user-stories.md', 'architecture.md', 'implementation.md', 'testing-strategy.md'];
      
      for (const template of templates) {
        const templatePath = path.join(templatesDir, template);
        const targetPath = path.join(featureDir, template);
        
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const customizedContent = templateContent.replace(/\[Feature Name\]/g, workflow.feature_name);
          await fs.writeFile(targetPath, customizedContent);
        } catch (error) {
          console.warn(`Could not copy template ${template}:`, error);
        }
      }
      
      // Create context.md file
      const contextContent = `# ${workflow.feature_name} - Context\n\n## Workflow Information\n- **Workflow ID**: ${workflow.id}\n- **Project ID**: ${workflow.project_id}\n- **Created**: ${workflow.created_at}\n- **Status**: ${workflow.status}\n\n## Decision Log\n[Record important decisions and context here]\n\n## Notes\n[Additional notes and considerations]\n`;
      await fs.writeFile(path.join(featureDir, 'context.md'), contextContent);
      
    } catch (error) {
      console.error('Error creating workflow directory:', error);
      throw error;
    }
  }

  private async initializeWorkflowTasks(workflowId: string): Promise<void> {
    const defaultTasks = [
      // User Stories Phase
      { phase: 'user-stories', description: 'Define problem statement and business value' },
      { phase: 'user-stories', description: 'Write primary user stories with acceptance criteria' },
      { phase: 'user-stories', description: 'Define functional specifications' },
      { phase: 'user-stories', description: 'Specify quality requirements (performance, security, reliability)' },
      { phase: 'user-stories', description: 'Identify constraints and dependencies' },
      { phase: 'user-stories', description: 'Define success metrics and exclusions' },
      
      // Architecture Phase
      { phase: 'architecture', description: 'Design high-level system architecture' },
      { phase: 'architecture', description: 'Define component architecture (frontend/backend)' },
      { phase: 'architecture', description: 'Design data architecture and database schema' },
      { phase: 'architecture', description: 'Specify API endpoints and data flow' },
      { phase: 'architecture', description: 'Define security and performance architecture' },
      { phase: 'architecture', description: 'Plan deployment and integration strategy' },
      
      // Implementation Phase
      { phase: 'implementation', description: 'Set up basic project structure' },
      { phase: 'implementation', description: 'Implement core backend functionality' },
      { phase: 'implementation', description: 'Create frontend components and UI' },
      { phase: 'implementation', description: 'Integrate frontend with backend APIs' },
      { phase: 'implementation', description: 'Implement error handling and validation' },
      { phase: 'implementation', description: 'Add logging and monitoring' },
      
      // Testing Phase
      { phase: 'testing', description: 'Write and execute unit tests' },
      { phase: 'testing', description: 'Implement integration tests' },
      { phase: 'testing', description: 'Perform end-to-end testing' },
      { phase: 'testing', description: 'Conduct performance and security testing' },
      { phase: 'testing', description: 'User acceptance testing' },
      { phase: 'testing', description: 'Final validation and documentation' }
    ];

    for (const task of defaultTasks) {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.runQuery(
        `INSERT INTO workflow_tasks (id, workflow_id, phase, task_description, completed)
         VALUES (?, ?, ?, ?, ?)`,
        [taskId, workflowId, task.phase, task.description, false]
      );
    }
  }

  async getWorkflow(workflowId: string): Promise<FeatureWorkflow | null> {
    const result = await this.getQuery(
      'SELECT * FROM spec_workflows WHERE id = ?',
      [workflowId]
    );
    return result as FeatureWorkflow | null;
  }

  async getWorkflowsByProject(projectId: string): Promise<FeatureWorkflow[]> {
    const results = await this.allQuery(
      'SELECT * FROM spec_workflows WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return results as FeatureWorkflow[];
  }

  async getWorkflowTasks(workflowId: string, phase?: string): Promise<WorkflowTask[]> {
    let query = 'SELECT * FROM workflow_tasks WHERE workflow_id = ?';
    const params = [workflowId];
    
    if (phase) {
      query += ' AND phase = ?';
      params.push(phase);
    }
    
    query += ' ORDER BY created_at ASC';
    
    const results = await this.allQuery(query, params);
    return results as WorkflowTask[];
  }

  async completeTask(taskId: string, notes?: string): Promise<void> {
    await this.runQuery(
      `UPDATE workflow_tasks 
       SET completed = TRUE, completed_at = ?, notes = ?
       WHERE id = ?`,
      [new Date().toISOString(), notes || null, taskId]
    );

    // Update workflow progress
    const task = await this.getQuery('SELECT workflow_id FROM workflow_tasks WHERE id = ?', [taskId]);
    if (task) {
      await this.updateWorkflowProgress(task.workflow_id);
    }
  }

  async uncompleteTask(taskId: string): Promise<void> {
    await this.runQuery(
      `UPDATE workflow_tasks 
       SET completed = FALSE, completed_at = NULL, notes = NULL
       WHERE id = ?`,
      [taskId]
    );

    // Update workflow progress
    const task = await this.getQuery('SELECT workflow_id FROM workflow_tasks WHERE id = ?', [taskId]);
    if (task) {
      await this.updateWorkflowProgress(task.workflow_id);
    }
  }

  private async updateWorkflowProgress(workflowId: string): Promise<void> {
    const totalTasks = await this.getQuery(
      'SELECT COUNT(*) as total FROM workflow_tasks WHERE workflow_id = ?',
      [workflowId]
    );
    
    const completedTasks = await this.getQuery(
      'SELECT COUNT(*) as completed FROM workflow_tasks WHERE workflow_id = ? AND completed = TRUE',
      [workflowId]
    );

    const progress = Math.round((completedTasks.completed / totalTasks.total) * 100);
    
    // Determine current phase and status
    const currentPhaseResult = await this.getQuery(
      `SELECT phase FROM workflow_tasks 
       WHERE workflow_id = ? AND completed = FALSE 
       ORDER BY created_at ASC LIMIT 1`,
      [workflowId]
    );
    
    let status = 'draft';
    let currentPhase = 'user-stories';
    
    if (currentPhaseResult) {
      currentPhase = currentPhaseResult.phase;
      status = currentPhase;
    } else if (progress === 100) {
      status = 'completed';
      currentPhase = 'completed';
    }

    await this.runQuery(
      `UPDATE spec_workflows 
       SET progress = ?, status = ?, current_phase = ?, updated_at = ?
       WHERE id = ?`,
      [progress, status, currentPhase, new Date().toISOString(), workflowId]
    );
  }

  async addCustomTask(workflowId: string, phase: string, description: string): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.runQuery(
      `INSERT INTO workflow_tasks (id, workflow_id, phase, task_description, completed)
       VALUES (?, ?, ?, ?, ?)`,
      [taskId, workflowId, phase, description, false]
    );

    await this.updateWorkflowProgress(workflowId);
    return taskId;
  }

  async getWorkflowSummary(workflowId: string): Promise<any> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const tasks = await this.getWorkflowTasks(workflowId);
    const tasksByPhase = tasks.reduce((acc, task) => {
      if (!acc[task.phase]) {
        acc[task.phase] = { total: 0, completed: 0, tasks: [] };
      }
      acc[task.phase].total++;
      if (task.completed) {
        acc[task.phase].completed++;
      }
      acc[task.phase].tasks.push(task);
      return acc;
    }, {} as any);

    return {
      workflow,
      tasksByPhase,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      progress: workflow.progress
    };
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    // Delete tasks first (foreign key constraint)
    await this.runQuery('DELETE FROM workflow_tasks WHERE workflow_id = ?', [workflowId]);
    
    // Delete workflow
    await this.runQuery('DELETE FROM spec_workflows WHERE id = ?', [workflowId]);
    
    // Optionally delete directory (be careful with this)
    // const workflow = await this.getWorkflow(workflowId);
    // if (workflow) {
    //   const featureDir = path.join(this.specsDir, workflow.feature_name.toLowerCase().replace(/\s+/g, '-'));
    //   await fs.rmdir(featureDir, { recursive: true });
    // }
  }
}