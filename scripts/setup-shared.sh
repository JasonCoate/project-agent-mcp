#!/bin/bash

# Project Agent - Shared Installation Setup Script
# This script sets up the Project Agent for shared use across multiple projects

set -e  # Exit on any error

echo "🚀 Setting up Project Agent (Shared Installation)..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "mcp-server" ]; then
    echo "❌ Error: Please run this script from the project-agent root directory"
    echo "   Expected structure: ./mcp-server/package.json"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd mcp-server
npm install

# Build the TypeScript code
echo "🔨 Building TypeScript code..."
npm run build

echo ""
echo "✅ Project Agent setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the MCP server:"
echo "      cd $(pwd)"
echo "      npm run build && npm start  # Keep running in background"
echo ""
echo "   2. Configure your AI assistant to use this MCP server:"
echo "      Server path: $(pwd)"
echo "      Command: node dist/src/index.js"
echo ""
echo "   3. Create projects anywhere:"
echo "      mkdir my-awesome-app && cd my-awesome-app"
echo "      # Then in your AI assistant:"
echo "      \"Create a new project called 'my-awesome-app' for a React web application\""
echo ""
echo "📚 For detailed setup instructions:"
echo "   - Quick Start Guide: ../docs/QUICKSTART.md"
echo "   - Project Setup Guide: ../docs/PROJECT_SETUP_GUIDE.md"
echo ""
echo "🎯 Ready to start building amazing projects!"