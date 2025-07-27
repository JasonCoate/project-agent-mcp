# Project Agent for Trae IDE

This directory contains the configuration files needed to set up the Project Agent as a custom agent in Trae IDE.

## Files

- `project-agent.json` - Trae IDE agent configuration with MCP server setup
- `project-agent-prompt.md` - Custom agent prompt defining behavior and capabilities

## Setup Instructions

### 1. Prerequisites

Ensure you have the Project Agent MCP server built and ready:

```bash
cd ~/tools/project-agent/mcp-server
npm install
npm run build
```

### 2. Configure Trae IDE

1. **Open Trae IDE**
2. **Navigate to Agents** (in the sidebar)
3. **Click "Create Agent"**
4. **Import Configuration**:
   - Use the `project-agent.json` file from this directory
   - Or manually configure:
     - **Name**: Project Agent
     - **Prompt**: Copy content from `project-agent-prompt.md`
     - **MCP Servers**: Add `project-agent` server
     - **Tools**: Enable file system, terminal, web search, preview

### 3. MCP Server Configuration

The agent requires the Project Agent MCP server. Configure it with:

```json
{
  "mcpServers": {
    "project-agent": {
      "command": "node",
      "args": ["${PROJECT_ROOT}/mcp-server/dist/src/index.js"],
      "env": {
        "DATABASE_PATH": "${PROJECT_ROOT}/mcp-server/data/project-agent.db"
      }
    }
  }
}
```

**Important**: Replace `${PROJECT_ROOT}` with the actual path to your project-agent installation (e.g., `/Users/yourname/tools/project-agent`).

### 4. Verify Setup

Test the agent by asking it to:

```
List all available projects and create a new test project
```

The agent should:

1. Use the `list_projects` MCP tool
2. Create a new project with `create_project`
3. Show you the project details

## Agent Capabilities

Once configured, your Project Agent will collaborate with you as a patient assistant that:

### 🤝 Collaborative Project Management

- **Suggest** project creation and management approaches
- **Recommend** project status tracking and progress monitoring
- **Propose** comprehensive project reports (with your approval)
- **Maintain** project context across sessions (with permission)

### 📋 Guided Specification Management

- **Suggest** creating requirement, technical, design, and acceptance specs
- **Recommend** specification consistency validation
- **Propose** linking specs to tasks and implementation
- **Guide** specification evolution through collaborative planning

### ✅ Consultative Task Management

- **Suggest** creating tasks linked to specifications
- **Recommend** progress tracking and bottleneck identification
- **Propose** task assignment and priority management
- **Guide** task analysis through collaborative review

### 🧠 Patient Memory & Context Management

- **Ask permission** before storing session context and decisions
- **Suggest** retrieving relevant context for current work
- **Propose** creating knowledge snapshots at appropriate times
- **Offer** to search project history with natural language

### 🔄 Collaborative Feature Workflows

- **Suggest** structured feature development workflows
- **Recommend** tracking feature progress through phases
- **Propose** managing feature-specific tasks
- **Offer** to generate feature summaries (with approval)

## Usage Examples

### Starting a New Project

```
I want to create a new React e-commerce application. Can you help me plan the project structure with proper specifications and initial tasks? Please explain your approach first.
```

### Adding a Feature

```
I need to add user authentication to my project. Can you suggest a feature workflow approach with specifications and tasks? Please outline your plan before proceeding.
```

### Reviewing Progress

```
Can you help me analyze the current project progress? Please explain what you'd like to check and get my approval before proceeding.
```

### Getting Context

```
I'd like to understand the decisions made about database architecture in this project. Can you search the project history for this information?
```

## Best Practices

1. **Collaborate with the agent** - it will ask for your approval before taking actions
2. **Let the agent plan ahead** - it will explain its approach and wait for your feedback
3. **Give explicit approval** - the agent waits patiently for your permission before proceeding
4. **Start sessions** by approving the agent's suggestion to retrieve relevant context
5. **End sessions** by approving the agent's proposal to store important decisions and next steps
6. **Work together** on creating specifications before implementing features
7. **Collaborate** on linking tasks to specifications for better traceability
8. **Partner with the agent's memory** to maintain context across team members

## Troubleshooting

### Agent Not Responding

- Check that the MCP server is running
- Verify the database path is correct
- Ensure Node.js version is 22.5.0+

### MCP Tools Not Available

- Verify the `project-agent` MCP server is configured
- Check the server path in the configuration
- Rebuild the MCP server if needed

### Database Issues

- Check database file permissions
- Verify the database path exists
- Try recreating the database with `npm run reset-db`

## Support

For more information:

- [Project Agent Documentation](../../docs/)
- [MCP Server README](../../mcp-server/README.md)
- [Project Setup Guide](../../docs/PROJECT_SETUP_GUIDE.md)
