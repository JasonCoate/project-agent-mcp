# Project Setup Guide

## How to Use the Project Agent for New Projects

This guide explains how to set up and use the Project Agent MCP server for managing new software projects.

## Setup Options

### Option 1: Shared Installation (Recommended)

**Best for**: Multiple projects, team environments, consistent tooling

1. **One-time setup**: Keep this repo in a central location (e.g., `~/tools/project-agent`)
2. **Configure MCP clients** to point to this installation
3. **Create projects anywhere** using the MCP tools
4. **Reuse** the same agent across all your projects

```bash
# One-time setup
git clone <this-repo> ~/tools/project-agent
cd ~/tools/project-agent
./scripts/setup-shared.sh  # Installs dependencies

# Start the server
cd ~/tools/project-agent/mcp-server
npm run build
npm start  # Keep running in background

# Configure your AI assistants to use:
# Server: ~/tools/project-agent/mcp-server
```

### Option 2: Per-Project Installation

**Best for**: Project-specific customizations, isolated environments

1. **Clone** this repo into each new project
2. **Customize** specs and workflows per project
3. **Run** the MCP server from within each project

```bash
# For each new project
git clone <this-repo> my-new-project
cd my-new-project
# Customize .specs/ folder for your project
cd mcp-server && npm install && npm run build && npm start
```

### Option 3: NPM Package (Future)

**Status**: Not yet implemented, but planned

```bash
# Future capability
npx @project-agent/mcp-server init my-project
cd my-project
project-agent start
```

## Recommended Workflow

### 🎯 **Option 1 (Shared) - Recommended**

This is the most efficient approach for most developers:

#### Initial Setup (Once)

1. **Install the Project Agent**:

   ```bash
   git clone <this-repo> ~/tools/project-agent
   cd ~/tools/project-agent
   ./scripts/setup-shared.sh  # Installs dependencies
   ```

2. **Configure your AI assistants**:
   - **Cursor**: Add to `.cursor/mcp_servers.json`
   - **Claude Desktop**: Add to `claude_desktop_config.json`
   - **Trae**: Add to MCP settings

   ```json
   {
     "mcpServers": {
       "project-agent": {
         "command": "node",
         "args": [
           "/Users/yourname/tools/project-agent/mcp-server/dist/src/index.js"
         ]
       }
     }
   }
   ```

3. **Start the MCP server**:
   ```bash
   cd ~/tools/project-agent/mcp-server
   npm run build
   npm start  # Keep this running
   ```

#### For Each New Project

1. **Create your project directory**:

   ```bash
   mkdir my-awesome-app
   cd my-awesome-app
   ```

2. **Initialize with Project Agent** (via AI assistant):

   ```
   # In your AI assistant chat:
   "Create a new project called 'my-awesome-app' for a React web application"
   ```

3. **The agent will**:
   - Create project in database
   - Generate `.specs/` folder with templates
   - Set up initial task lists
   - Create workflow phases

4. **Continue development**:
   - Use MCP tools to track progress
   - Update specifications as needed
   - Mark tasks complete
   - Generate progress reports

## Understanding the .specs Folder Structure

### What Gets Created

When you start a new project, the Project Agent creates a project-based structure that supports multiple features:

```
my-project/
├── .specs/
│   ├── README.md              # Workflow overview
│   ├── user-stories.md        # User requirements
│   ├── architecture.md        # Technical design
│   ├── implementation.md      # Development plan
│   ├── testing-strategy.md    # QA approach
│   ├── tasks.md              # Main project task breakdown
│   └── project-name/         # Project-specific feature directories
│       ├── 1-feat-authentication/
│       │   ├── README.md     # Feature overview
│       │   ├── tasks.md      # Feature-specific tasks
│       │   ├── specs.md      # Detailed specifications
│       │   └── tests.md      # Feature testing plan
│       ├── 2-feat-user-dashboard/
│       │   ├── README.md
│       │   ├── tasks.md
│       │   ├── specs.md
│       │   └── tests.md
│       └── 3-feat-payment-system/
│           ├── README.md
│           ├── tasks.md
│           ├── specs.md
│           └── tests.md
└── [your actual project files]
```

### Project-Based Organization

**Each project gets its own unique .specs folder** containing:

- **Project-level specs** - Overall architecture, user stories, main tasks
- **Feature subdirectories** - Each major feature has its own folder
- **Feature-specific tasks** - Separate task.md files per feature
- **Isolated workflows** - Features can be developed independently

### Benefits of This Structure

- **Separation of Concerns**: Each feature has its own specifications and tasks
- **Parallel Development**: Multiple features can be worked on simultaneously
- **Clear Organization**: Easy to find feature-specific documentation
- **Scalable**: Add new features without cluttering the main specs
- **Team Collaboration**: Different team members can own different features

### Template vs. Project-Specific

- **Templates** (in this repo): Generic starting points
- **Project specs**: Customized for your specific project
- **Auto-generated**: Created by MCP tools based on your project details

### Customization

You can:

- ✅ Edit generated specs for your project
- ✅ Add custom phases or tasks
- ✅ Create new feature folders as needed
- ✅ Modify templates in the central installation
- ✅ Organize features based on your project structure
- ❌ Don't manually edit task IDs or database-synced content

## MCP Tools Available

### Project Management

- `create_project`: Initialize new project
- `get_project`: Retrieve project details
- `update_project`: Modify project info
- `list_projects`: Show all projects
- `get_project_context`: Get comprehensive project context
- `add_context_note`: Add contextual notes
- `search_context`: Search project context

### Specification Management

- `create_spec`: Add new specification
- `get_specs`: Retrieve project specs
- `update_spec`: Modify specifications
- `validate_specs`: Check consistency

### Task Tracking

- `create_task`: Add new task
- `update_task_progress`: Mark progress
- `get_tasks`: List project tasks
- `analyze_progress`: Generate reports

### Feature-Based Workflow Management

- `create_feature_directory`: Create feature directory structure with conventional commit prefixes (feat, fix, docs, etc.)
- `update_feature_task`: Update a task within a specific feature
- `get_feature_progress`: Get progress summary for a specific feature
- `list_project_features`: List all features for a project with their progress
- `create_feature_checkpoint`: Create a checkpoint for a completed feature
- `create_feature_workflow`: Create a new feature workflow for development
- `get_feature_workflow`: Get details of a specification workflow
- `list_feature_workflows`: List all specification workflows for a project
- `complete_workflow_task`: Mark a workflow task as completed
- `uncomplete_workflow_task`: Mark a workflow task as incomplete
- `add_workflow_task`: Add a custom task to a workflow
- `get_workflow_tasks`: Get tasks for a workflow
- `delete_feature_workflow`: Delete a specification workflow
- `get_workflow_summary`: Get a summary of workflow progress and next actions
- `update_task_with_sync`: Update a task status with markdown and database synchronization
- `add_task_with_sync`: Add a new task with markdown and database synchronization
- `generate_progress_summary`: Generate a progress summary for a workflow
- `create_checkpoint`: Create a checkpoint validation for a workflow phase

## Example: Starting a New React App

### 1. Chat with AI Assistant

```
User: "I want to create a new React application for an e-commerce store.
It should have user authentication, product catalog, shopping cart, and payment processing."

AI: 🚀 I'll help you set up this project with the Project Agent!

[Creates project with MCP tools]

✅ Project created: "ecommerce-react-app"
📁 Specifications generated in .specs/
📋 32 tasks created across 5 phases
🎯 Ready to start development!
```

### 2. Generated Structure

```
ecommerce-react-app/
├── .specs/
│   ├── user-stories.md        # "As a customer, I want to..."
│   ├── architecture.md        # React + Node.js + Stripe
│   ├── implementation.md      # Component structure, API design
│   ├── testing-strategy.md    # Jest, Cypress, unit tests
│   └── tasks.md              # Phase-by-phase task list
└── [you create your React app here]
```

### 3. Development Workflow

```
# As you work:
User: "I've completed the user authentication component"

AI: 🎉 Great! Let me update your progress.

[Updates task status with MCP tools]

✅ Task completed: "Implement user login/signup"
📊 Progress: 8/32 tasks complete (25%)
🔄 Next: "Set up product catalog API"
```

## Best Practices

### ✅ Do

- Keep the MCP server running in background
- Use AI assistant to interact with Project Agent
- Let the agent manage task IDs and database sync
- Customize generated specs for your needs
- Use checkpoints to validate phase completion

### ❌ Don't

- Manually edit task IDs in markdown files
- Run multiple MCP servers simultaneously
- Modify the database directly
- Delete .specs folder after generation

## Troubleshooting

### MCP Server Not Responding

```bash
cd ~/tools/project-agent/mcp-server
npm run build
npm start
# Check logs for errors
```

### AI Assistant Can't Find Tools

- Verify MCP server configuration
- Check server is running on correct port
- Restart AI assistant

### Database Issues

```bash
# Reset database (loses all projects!)
rm ~/tools/project-agent/mcp-server/data/projects.db
npm run build
npm start  # Will recreate tables
```

## Migration Path

If you want to convert this to an NPM package later:

1. **Current state**: Manual setup, local installation
2. **Future state**: `npm install -g @project-agent/cli`
3. **Migration**: Export your projects, reinstall, import

## Summary

**For most users**: Use Option 1 (Shared Installation)

- One central Project Agent installation
- Create projects anywhere
- Consistent tooling across all projects
- Easy to maintain and update

The `.specs` folder is **generated per project** and **customized for your specific needs** - you don't create it from scratch each time!
