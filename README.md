# Project Agent

**AI-powered project management with MCP server integration and N8N automation**

A self-hosted project management system that integrates with AI assistants through the Model Context Protocol (MCP). Manage specifications, track progress, and automate workflows locally.  

## Quick Start

### 🚀 Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup-shared.sh
```

That's it! The script will:
- Install dependencies
- Show you next steps
- Provide configuration details

### Manual Setup

**Best for most users**: One installation, use for all projects

1. **Install Project Agent**:
   ```bash
   git clone <this-repo> ~/tools/project-agent
   cd ~/tools/project-agent/mcp-server
   npm install
   npm start  # Keep running in background
   ```

2. **Configure your AI assistant** to use `~/tools/project-agent/mcp-server`
   - See [Quick Start Guide](docs/QUICKSTART.md) for detailed setup

3. **Create projects anywhere**:
   ```bash
   mkdir my-awesome-app && cd my-awesome-app
   # Then in your AI assistant:
   "Create a new project called 'my-awesome-app' for a React web application"
   ```

4. **The agent automatically creates**:
   - `.specs/` folder with project specifications
   - Feature directories with conventional commit prefixes (e.g., `1-feat-authentication/`)
   - Project-specific organization under `.specs/project-name/`
   - Task lists and workflow phases
   - Progress tracking and checkpoints

### 📚 Documentation

- 🚀 [**Quick Start Guide**](docs/QUICKSTART.md) - Get running in 5 minutes
- 📋 [**Project Setup Guide**](docs/PROJECT_SETUP_GUIDE.md) - Complete setup options and workflows
- 💡 [**Example: New Project**](docs/EXAMPLE_NEW_PROJECT.md) - Step-by-step walkthrough
- 🧠 [**Memory Management Guide**](docs/MEMORY_MANAGEMENT_GUIDE.md) - Context storage for LLMs
- 📝 [**Memory Tools Reference**](docs/MEMORY_TOOLS_REFERENCE.md) - Quick reference for memory tools
- 🔗 [**N8N Integration Guide**](docs/N8N_INTEGRATION_GUIDE.md) - Workflow automation

## Features

- **Project Management** - Create and manage projects with specifications and tasks
- **Progress Tracking** - Real-time monitoring and intelligent steering recommendations
- **Memory Management** - Persistent context storage for LLMs with session continuity and knowledge snapshots
- **MCP Integration** - Works with Cursor, Claude Desktop, Continue.dev, and other MCP-compatible tools
- **N8N Automation** - Automated workflows for monitoring and notifications
- **Local Deployment** - Self-hosted with SQLite database

## Documentation

- [QUICKSTART.md](docs/QUICKSTART.md) - Detailed setup guide
- [Project Agent PRD](docs/project-agent-prd.md) - Complete implementation guide
- [Memory Management Guide](docs/MEMORY_MANAGEMENT_GUIDE.md) - Context storage for LLMs
- [Memory Tools Reference](docs/MEMORY_TOOLS_REFERENCE.md) - Quick reference for memory tools
- [N8N Setup Guide](docs/N8N_SETUP_GUIDE.md) - Installation and configuration
- [N8N Integration Guide](docs/N8N_INTEGRATION_GUIDE.md) - Workflows and examples

## Testing

```bash
# Test the integration
npm run test:integration
```

## How It Works

The system provides project context to AI assistants through MCP, enabling them to:
- Track project specifications and requirements
- Monitor task progress and suggest next steps
- Maintain project history and decisions
- Store session context and retrieve relevant information
- Create knowledge snapshots for complex projects
- Query project knowledge with natural language
- Validate specification consistency

## Compatible Tools

- **Cursor AI** - MCP integration with project context
- **Claude Desktop** - Native MCP server support
- **Continue.dev** - VS Code extension with MCP tools
- **Trae IDE** - Built-in MCP server integration
- **Gemini CLI** - Command-line AI with MCP support
- **Universal CLI Client** - Included interface (`clients/universal-mcp-client.ts`)

## N8N Workflows

- **Project Monitor** - Automated project health monitoring
- **Progress Tracker** - Real-time task progress tracking via webhooks
- **Spec Validator** - Specification consistency validation
- **MCP Integration** - Direct MCP server tool integration

## Architecture

```text
[AI Assistants] ↔ [MCP Server] ↔ [SQLite Database]
                      ↕              ↕
              [N8N Workflows] → [Intelligent Steering]
```

**Components:**
- **MCP Server** (`mcp-server/`) - Core project management engine
- **SQLite Database** - Project data persistence
- **N8N Workflows** (`n8n-workflows/`) - Automation and monitoring
- **Universal Client** (`clients/`) - Command-line interface

## Usage

```bash
# Start MCP server
cd mcp-server && npm start

# Test with Universal CLI (new terminal)
npm run test:clients

# Or run the integration demo
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes with `npm run test:integration`
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
