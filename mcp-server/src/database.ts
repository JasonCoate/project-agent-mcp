import sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { Project, Spec, Task, MemoryEntry } from './types/index.js';

export class DatabaseManager {
  private db: sqlite3.Database;

  constructor(
    dbPath: string = process.env.DATABASE_PATH || './data/project-agent.db'
  ) {
    // Ensure the directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private async init() {
    const run = (sql: string) =>
      new Promise<void>((resolve, reject) => {
        this.db.run(sql, function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

    // Create tables
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planning',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS specs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        spec_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        progress INTEGER DEFAULT 0,
        assignee TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (spec_id) REFERENCES specs(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS memory_log (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);
  }

  // Project methods
  async createProject(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<string> {
    const id = randomUUID();

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO projects (id, name, description, status) VALUES (?, ?, ?, ?)',
        [id, project.name, project.description, project.status],
        function (err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async getProject(id: string): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve((row as Project) || null);
      });
    });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getAllProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM projects ORDER BY updated_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Project[]);
        }
      );
    });
  }

  // Spec methods
  async createSpec(
    spec: Omit<Spec, 'id' | 'created_at' | 'updated_at'>
  ): Promise<string> {
    const id = randomUUID();

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO specs (id, project_id, type, title, content, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          spec.project_id,
          spec.type,
          spec.title,
          spec.content,
          spec.status,
          spec.priority,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async getSpecsByProject(projectId: string): Promise<Spec[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM specs WHERE project_id = ? ORDER BY priority DESC, created_at DESC',
        [projectId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Spec[]);
        }
      );
    });
  }

  async updateSpec(id: string, updates: Partial<Spec>): Promise<void> {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE specs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Task methods
  async createTask(
    task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
  ): Promise<string> {
    const id = randomUUID();

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO tasks (id, project_id, spec_id, title, description, status, progress, assignee, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          task.project_id,
          task.spec_id,
          task.title,
          task.description,
          task.status,
          task.progress,
          task.assignee,
          task.due_date,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY status, created_at DESC',
        [projectId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Task[]);
        }
      );
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Memory methods
  async addMemory(
    memory: Omit<MemoryEntry, 'id' | 'timestamp'>
  ): Promise<string> {
    const id = randomUUID();

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO memory_log (id, project_id, event_type, content, metadata) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          memory.project_id,
          memory.event_type,
          memory.content,
          JSON.stringify(memory.metadata),
        ],
        function (err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  async getRecentMemory(
    projectId: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM memory_log WHERE project_id = ? ORDER BY timestamp DESC LIMIT ?',
        [projectId, limit],
        (err, rows) => {
          if (err) reject(err);
          else {
            const results = (rows as any[]).map(row => ({
              ...row,
              metadata: JSON.parse(row.metadata),
            }));
            resolve(results);
          }
        }
      );
    });
  }
}
