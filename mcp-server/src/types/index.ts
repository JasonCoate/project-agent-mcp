export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Spec {
  id: string;
  project_id: string;
  type: 'requirement' | 'technical' | 'design' | 'acceptance';
  title: string;
  content: string;
  status: 'draft' | 'active' | 'deprecated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  spec_id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  progress: number;
  assignee?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntry {
  id: string;
  project_id: string;
  event_type: 'spec_change' | 'task_update' | 'milestone' | 'decision' | 'issue' | 'session_context' | 'knowledge_snapshot' | 'note';
  content: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ProjectContext {
  project: Project;
  specs: Spec[];
  tasks: Task[];
  recent_memory: MemoryEntry[];
  progress_summary: {
    total_tasks: number;
    completed_tasks: number;
    blocked_tasks: number;
    overall_progress: number;
  };
}