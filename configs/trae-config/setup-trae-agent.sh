#!/bin/bash

# Project Agent - Trae IDE Setup Script
# This script helps configure the Project Agent as a custom agent in Trae IDE

set -e

echo "🚀 Setting up Project Agent for Trae IDE..."

# Get the current directory (should be project-agent root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Check if MCP server is built
if [ ! -f "$PROJECT_ROOT/mcp-server/dist/index.js" ]; then
    echo "⚠️  MCP server not built. Building now..."
    cd "$PROJECT_ROOT/mcp-server"
    npm install
    npm run build
    echo "✅ MCP server built successfully"
else
    echo "✅ MCP server already built"
fi

# Create the database directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/mcp-server/data"
echo "✅ Database directory ready"

# Update the configuration file with the correct path
CONFIG_FILE="$PROJECT_ROOT/configs/trae-config/project-agent.json"
TEMP_CONFIG="/tmp/project-agent-config.json"

# Replace ${PROJECT_ROOT} with actual path
sed "s|\${PROJECT_ROOT}|$PROJECT_ROOT|g" "$CONFIG_FILE" > "$TEMP_CONFIG"
echo "✅ Configuration updated with project path"

# Display the configuration
echo ""
echo "📋 Trae IDE Configuration:"
echo "========================="
cat "$TEMP_CONFIG"
echo ""
echo "========================="
echo ""

# Instructions for manual setup
echo "📖 Next Steps:"
echo "1. Open Trae IDE"
echo "2. Navigate to Agents in the sidebar"
echo "3. Click 'Create Agent'"
echo "4. Configure the agent:"
echo "   - Name: Project Agent"
echo "   - Import the configuration from: $TEMP_CONFIG"
echo "   - Or copy the prompt from: $PROJECT_ROOT/configs/trae-config/project-agent-prompt.md"
echo ""
echo "🔧 MCP Server Details:"
echo "   - Command: node"
echo "   - Args: $PROJECT_ROOT/mcp-server/dist/index.js"
echo "   - Database: $PROJECT_ROOT/mcp-server/data/project-agent.db"
echo ""
echo "🧪 Test the setup by asking the agent:"
echo "   'List all available projects and create a new test project'"
echo ""
echo "📚 For detailed instructions, see:"
echo "   $PROJECT_ROOT/configs/trae-config/README.md"
echo ""
echo "✅ Setup complete! The configuration file is ready at: $TEMP_CONFIG"

# Optionally copy to clipboard if pbcopy is available (macOS)
if command -v pbcopy >/dev/null 2>&1; then
    cat "$TEMP_CONFIG" | pbcopy
    echo "📋 Configuration copied to clipboard!"
fi