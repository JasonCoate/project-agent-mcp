#!/usr/bin/env node

// Simple test script to verify MCP server functionality
import { spawn, ChildProcess } from 'child_process';

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: {
    tools?: Array<{
      name: string;
      description: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

function testMCPServer(): void {
  console.log('Testing MCP Server...');
  
  const server: ChildProcess = spawn('node', ['dist/src/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test list tools request
  const listToolsRequest: MCPRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  };

  server.stdin?.write(JSON.stringify(listToolsRequest) + '\n');

  server.stdout?.on('data', (data: Buffer) => {
    try {
      const response: MCPResponse = JSON.parse(data.toString());
      console.log('Server Response:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.tools) {
        console.log(`\n✅ Success! Found ${response.result.tools.length} tools:`);
        response.result.tools.forEach(tool => {
          console.log(`  - ${tool.name}: ${tool.description}`);
        });
      }
    } catch (e) {
      console.log('Raw output:', data.toString());
    }
  });

  server.stderr?.on('data', (data: Buffer) => {
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