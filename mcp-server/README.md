# Project Agent MCP Server

A Model Context Protocol (MCP) server for project management, providing AI assistants with tools to manage projects, specifications, tasks, and context.

## Features

### 🚀 Core Tools

**Project Management:**

- `create_project` - Create new projects
- `get_project` - Retrieve project details
- `update_project` - Update project information
- `list_projects` - List all projects

**Specification Management:**

- `create_spec` - Create project specifications
- `get_specs` - Get specifications for a project
- `update_spec` - Update existing specifications
- `validate_specs` - Validate specification consistency

**Task Management:**

- `create_task` - Create new tasks
- `update_task_progress` - Update task status and progress
- `get_tasks` - Get tasks for a project
- `analyze_progress` - Analyze project progress and bottlenecks

**Context Management:**

- `get_project_context` - Get comprehensive project context
- `add_context_note` - Add contextual notes and decisions
- `search_context` - Search through project context and memory

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the TypeScript project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

## Database

The server uses SQLite with the following schema:

- **projects** - Project information
- **specs** - Project specifications
- **tasks** - Project tasks
- **memory_log** - Project activity and context

Database file: `./data/project-agent.db`

## Testing

Run the test scripts to verify functionality:

```bash
# Test tool listing
npm run test

# Test project creation
npm run test:create
```

## Trae IDE Integration

The server is configured for Trae IDE integration via `../configs/trae-config/project-agent.json`:

- **Shortcuts:**
  - `Ctrl+Shift+P` - Get project context
  - `Ctrl+Shift+T` - Create task
  - `Ctrl+Shift+S` - Create specification

- **Auto-completion triggers:** `@project`, `@task`, `@spec`

## Usage Examples

### Create a Project

```json
{
  "name": "create_project",
  "arguments": {
    "name": "My New Project",
    "description": "A sample project for demonstration"
  }
}
```

### Create a Specification

```json
{
  "name": "create_spec",
  "arguments": {
    "project_id": "project-uuid",
    "type": "requirement",
    "title": "User Authentication",
    "content": "Users must be able to log in with email and password",
    "priority": "high"
  }
}
```

### Create a Task

```json
{
  "name": "create_task",
  "arguments": {
    "project_id": "project-uuid",
    "title": "Implement login form",
    "description": "Create a responsive login form component",
    "assignee": "developer@example.com"
  }
}
```

## Architecture

- **DatabaseManager** - SQLite database operations
- **ProjectManagerTool** - Project CRUD operations
- **SpecManagerTool** - Specification management
- **TaskManagerTool** - Task management and progress tracking
- **ContextManagerTool** - Context and memory management

## Development

### File Structure

```
src/
├── database.ts          # Database manager
├── index.ts            # MCP server entry point
├── types/
│   └── index.ts        # Type definitions
└── tools/
    ├── project-manager.ts
    ├── spec-manager.ts
    ├── task-manager.ts
    └── context-manager.ts
```

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.
