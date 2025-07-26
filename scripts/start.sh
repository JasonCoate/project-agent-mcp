#!/bin/bash

# Start Project Agent MCP Server
echo "Starting Project Agent MCP Server..."

# Check if database exists
if [ ! -f "database/project.db" ]; then
    echo "Database not found. Creating..."
    sqlite3 database/project.db < database/schema.sql
fi

# Build if needed
if [ ! -d "mcp-server/dist" ]; then
    echo "Building MCP server..."
    cd mcp-server
    npm run build
    cd ..
fi

# Start server
cd mcp-server
npm start