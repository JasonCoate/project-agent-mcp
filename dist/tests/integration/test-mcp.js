#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simple test script to verify MCP server functionality
const child_process_1 = require("child_process");
function testMCPServer() {
    console.log('Testing MCP Server...');
    const server = (0, child_process_1.spawn)('node', ['dist/src/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: '../../mcp-server',
    });
    // Test list tools request
    const listToolsRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
    };
    server.stdin?.write(JSON.stringify(listToolsRequest) + '\n');
    server.stdout?.on('data', (data) => {
        try {
            const response = JSON.parse(data.toString());
            console.log('Server Response:', JSON.stringify(response, null, 2));
            if (response.result && response.result.tools) {
                console.log(`\n✅ Success! Found ${response.result.tools.length} tools:`);
                response.result.tools.forEach(tool => {
                    console.log(`  - ${tool.name}: ${tool.description}`);
                });
            }
        }
        catch (e) {
            console.log('Raw output:', data.toString());
        }
    });
    server.stderr?.on('data', (data) => {
        console.log('Server started:', data.toString());
    });
    // Clean up after 3 seconds
    setTimeout(() => {
        server.kill();
        console.log('\n🏁 Test completed!');
        process.exit(0);
    }, 3000);
}
testMCPServer();
