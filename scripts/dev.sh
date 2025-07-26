#!/bin/bash

# Development mode with auto-reload
echo "Starting Project Agent in development mode..."

# Start MCP server in watch mode
cd mcp-server
npm run dev &
MCP_PID=$!

# Start N8N if not running
if ! pgrep -x "n8n" > /dev/null; then
    echo "Starting N8N..."
    n8n start &
    N8N_PID=$!
fi

# Handle shutdown
trap 'kill $MCP_PID $N8N_PID 2>/dev/null' EXIT

echo "Development environment started"
echo "MCP Server: http://localhost:3000"
echo "N8N: http://localhost:5678"
echo "Press Ctrl+C to stop"

wait