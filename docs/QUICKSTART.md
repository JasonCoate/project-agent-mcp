# Quick Start Guide

Get Project Agent running in 5 minutes.

## Prerequisites

- Node.js 20.19+ 
- Git
- SQLite3

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/JasonCoate/project-agent-mcp.git
cd project-agent
```

### 2. Configure Environment (Optional)

```bash
cp .env.example .env
# Edit .env and set PROJECT_ROOT to your project path if needed
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd mcp-server && npm install
```

### 4. Start MCP Server

```bash
# From mcp-server directory
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

### Universal CLI Client

```bash
npm run test:clients

> create-project "My Awesome App"
> get-context <project-id>
> help
```

## Verification

Verify everything is working:

- [ ] MCP Server responds to tool calls
- [ ] N8N workflows execute successfully (if installed)
- [ ] Database contains sample project data
- [ ] Demo script runs without errors
- [ ] AI assistant can access project tools

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