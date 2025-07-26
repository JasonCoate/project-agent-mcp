#!/usr/bin/env node

// Test script to create a project and verify functionality
import { spawn } from 'child_process';

function testCreateProject() {
  console.log('Testing MCP Server - Create Project...');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let step = 0;
  const tests = [
    // Step 1: Create a project
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'create_project',
        arguments: {
          name: 'Test Project',
          description: 'A test project for MCP server validation'
        }
      }
    },
    // Step 2: List projects
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_projects',
        arguments: {}
      }
    }
  ];

  function runNextTest() {
    if (step < tests.length) {
      console.log(`\n📝 Running test ${step + 1}/${tests.length}...`);
      server.stdin.write(JSON.stringify(tests[step]) + '\n');
      step++;
    } else {
      console.log('\n🏁 All tests completed!');
      server.kill();
      process.exit(0);
    }
  }

  server.stdout.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString());
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      // Wait a bit before next test
      setTimeout(runNextTest, 1000);
    } catch (e) {
      console.log('Raw output:', data.toString());
      setTimeout(runNextTest, 1000);
    }
  });

  server.stderr.on('data', (data) => {
    console.log('Server info:', data.toString());
    // Start first test after server is ready
    if (step === 0) {
      setTimeout(runNextTest, 1000);
    }
  });

  // Safety timeout
  setTimeout(() => {
    console.log('\n⏰ Test timeout reached');
    server.kill();
    process.exit(1);
  }, 10000);
}

testCreateProject();