#!/bin/bash

echo "Setting up Project Agent..."

# Create directories
mkdir -p database logs

# Install MCP server dependencies
cd mcp-server
npm install
npm run build
cd ..

# Initialize database
sqlite3 database/project.db < database/schema.sql

# Set permissions
chmod +x scripts/*.sh
chmod +x clients/universal-mcp-client.ts

# Create systemd service (optional)
if command -v systemctl &> /dev/null; then
    cat > project-agent.service << EOF
[Unit]
Description=Project Agent MCP Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node mcp-server/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    echo "Systemd service file created: project-agent.service"
    echo "To install: sudo mv project-agent.service /etc/systemd/system/"
fi

echo "Setup complete!"
echo "Start the MCP server with: cd mcp-server && npm run build && npm start"
echo "Or use the universal client: npm run test:clients"