# Quick Start Guide

Get Project Agent running in 5 minutes.

## Prerequisites

- Node.js 20.19+ 
- Git
- SQLite3

## Installation

### Recommended Setup
**Best for most users:** One installation, use for all projects

**Install Project Agent:**

```bash
git clone <this-repo> ~/tools/project-agent
cd ~/tools/project-agent
./scripts/setup-shared.sh  # Installs dependencies
```

**Start the MCP server:**

```bash
cd ~/tools/project-agent/mcp-server
npm run build
npm start  # Keep running in background
```

**Configure your AI assistant** to use `~/tools/project-agent/mcp-server`

**Create projects anywhere:**

```bash
mkdir my-awesome-app && cd my-awesome-app
# Then in your AI assistant:
"Create a new project called 'my-awesome-app' for a React web application"
```

The agent automatically creates:
- `.specs/<project-name>/` folder with sequentially numbered feature-based subdirectories
- Directory format: `1-feat-create-app-footer`, `2-fix-login-bug`, `3-docs-update-readme`, `4-refactor-auth-module`, etc.
- Uses standard conventional commit prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Organized specifications by workflow type and feature name within each project
- Task lists and workflow phases within each numbered feature directory
- Progress tracking and checkpoints for individual features

### Alternative: Local Setup

```bash
git clone <this-repo>
cd project-agent

# Configure environment (optional)
cp .env.example .env
# Edit .env and set PROJECT_ROOT to your project path if needed

# Install dependencies
npm install
cd mcp-server && npm install

# Build and start MCP server
npm run build
npm start
```

The server runs on stdio and is ready for MCP connections.

### 5. Test Integration

```bash
# In a new terminal, from project root
npm run test:integration
```

**Expected Output:**
```
🚀 N8N Integration Demo Starting...
📊 Found 3 active projects to analyze
✅ Project Analysis Complete
🔗 N8N Progress Tracker Webhook Simulation
📈 Project: AI-Powered Task Manager
   Tasks: 4 | Progress: 38.75%
💾 Memory logged: Project progress analyzed
✅ Integration Demo Complete!
```

## N8N Setup (Optional)

### 1. Install N8N

```bash
npm install -g n8n
```

### 2. Install SQLite Node

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-sqlite3
```

### 3. Start N8N

```bash
n8n start
# Access at http://localhost:5678
```

### 4. Import Workflows

1. Open N8N at http://localhost:5678
2. Import all 4 workflows from `n8n-workflows/` directory:
   - `mcp-integration.json`
   - `progress-tracker.json`
   - `project-monitor.json`
   - `spec-validator.json`
3. Configure database path: `./mcp-server/data/project-agent.db`
4. Activate all workflows

## Using with AI Assistants

### Cursor AI

1. Add to your Cursor settings:
```json
{
  "mcp": {
    "servers": {
      "project-agent": {
        "command": "node",
        "args": ["/path/to/project-agent/mcp-server/dist/index.js"]
      }
    }
  }
}
```

### Claude Desktop

1. Add to `~/.claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "project-agent": {
      "command": "node",
      "args": ["/path/to/project-agent/mcp-server/dist/index.js"]
    }
  }
}
```

### Trae IDE

1. Add to your Trae configuration:
```json
{
  "mcpServers": {
    "project-agent": {
      "command": "node",
      "args": ["/path/to/project-agent/mcp-server/dist/index.js"]
    }
  }
}
```

### Universal CLI Client

```bash
npm run test:clients

> create-project "My Awesome App"
> get-context <project-id>
> help
```

## Available MCP Tools

### Project Management
- `create_project`: Initialize new project
- `get_project`: Retrieve project details
- `update_project`: Modify project info
- `list_projects`: Show all projects
- `get_project_context`: Get comprehensive project context
- `add_context_note`: Add contextual notes
- `search_context`: Search project context

### Feature-Based Workflow Management
- `create_feature_directory`: Create feature directory structure
- `create_feature_workflow`: Create a new feature workflow
- `update_feature_task`: Update tasks within a specific feature
- `get_feature_progress`: Get progress summary for a feature
- `list_project_features`: List all features with progress
- `create_feature_checkpoint`: Create checkpoint for completed feature

### Specification Management
- `create_spec`: Add new specification
- `get_specs`: Retrieve project specs
- `update_spec`: Modify specifications
- `validate_specs`: Check consistency

### Task Tracking
- `create_task`: Add new task
- `get_tasks`: List project tasks
- `analyze_progress`: Generate reports

## Verification

Verify everything is working:

- [ ] MCP Server responds to tool calls
- [ ] N8N workflows execute successfully (if installed)
- [ ] Database contains sample project data
- [ ] Demo script runs without errors
- [ ] AI assistant can access project tools
- [ ] Feature-based tools create proper directory structures
- [ ] Feature workflows and checkpoints work correctly

## Troubleshooting

### MCP Server Won't Start

```bash
# Check Node.js version
node --version  # Should be 20.19+

# Rebuild TypeScript
cd mcp-server
npm run build
npm start
```

### Database Issues

```bash
# Check if database exists
ls -la mcp-server/data/

# If missing, run demo to create sample data
npm run test:integration
```

### N8N Workflows Failing

1. Ensure SQLite node is installed: `npm list n8n-nodes-sqlite3`
2. Check database path in workflow settings
3. Verify workflows are activated

## Next Steps

- Read the [Project Agent PRD](docs/project-agent-prd.md) for detailed implementation
- Check [N8N Setup Guide](docs/N8N_SETUP_GUIDE.md) for advanced N8N configuration
- Review [N8N Integration Guide](docs/N8N_INTEGRATION_GUIDE.md) for workflow customization