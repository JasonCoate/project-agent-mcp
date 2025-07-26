#!/usr/bin/env node

// Comprehensive test suite for Project Agent MCP Server
// Tests all tools according to the PRD requirements

import { spawn } from 'child_process';

class MCPTester {
  constructor() {
    this.server = null;
    this.testResults = [];
    this.currentTest = 0;
    this.projectId = null;
    this.specId = null;
    this.taskId = null;
  }

  async runTests() {
    console.log('🚀 Starting Comprehensive MCP Server Test Suite...');
    console.log('Testing all tools according to PRD requirements\n');

    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.server.stderr.on('data', (data) => {
      console.log('📡 Server:', data.toString().trim());
      // Start tests after server is ready
      if (data.toString().includes('running on stdio')) {
        setTimeout(() => this.runNextTest(), 1000);
      }
    });

    this.server.stdout.on('data', (data) => {
      this.handleResponse(data);
    });

    // Safety timeout
    setTimeout(() => {
      console.log('\n⏰ Test timeout reached');
      this.cleanup();
    }, 30000);
  }

  handleResponse(data) {
    try {
      const response = JSON.parse(data.toString());
      const test = this.tests[this.currentTest - 1];
      
      console.log(`✅ ${test.name}:`);
      
      if (response.result && !response.result.isError) {
        const content = JSON.parse(response.result.content[0].text);
        console.log(`   Result: ${JSON.stringify(content, null, 2).substring(0, 200)}...`);
        
        // Store IDs for subsequent tests
        if (content.project_id) this.projectId = content.project_id;
        if (content.spec_id) this.specId = content.spec_id;
        if (content.task_id) this.taskId = content.task_id;
        
        this.testResults.push({ name: test.name, status: 'PASS', result: content });
      } else {
        console.log(`   ❌ Error: ${response.result?.content[0]?.text || 'Unknown error'}`);
        this.testResults.push({ name: test.name, status: 'FAIL', error: response.result?.content[0]?.text });
      }
    } catch (e) {
      console.log(`   ❌ Parse Error: ${e.message}`);
      this.testResults.push({ name: this.tests[this.currentTest - 1]?.name, status: 'FAIL', error: e.message });
    }

    // Wait before next test
    setTimeout(() => this.runNextTest(), 1500);
  }

  runNextTest() {
    if (this.currentTest < this.tests.length) {
      const test = this.tests[this.currentTest];
      console.log(`\n📝 Test ${this.currentTest + 1}/${this.tests.length}: ${test.name}`);
      
      // Replace placeholders with actual IDs
      let request = JSON.stringify(test.request);
      if (this.projectId) request = request.replace('{{PROJECT_ID}}', this.projectId);
      if (this.specId) request = request.replace('{{SPEC_ID}}', this.specId);
      if (this.taskId) request = request.replace('{{TASK_ID}}', this.taskId);
      
      this.server.stdin.write(request + '\n');
      this.currentTest++;
    } else {
      this.showResults();
    }
  }

  showResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
    }
    
    console.log('\n🏁 Test suite completed!');
    this.cleanup();
  }

  cleanup() {
    if (this.server) {
      this.server.kill();
    }
    process.exit(0);
  }

  get tests() {
    return [
      // Project Management Tests
      {
        name: 'Create Project',
        request: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'create_project',
            arguments: {
              name: 'Comprehensive Test Project',
              description: 'A project created during comprehensive testing',
              status: 'planning'
            }
          }
        }
      },
      {
        name: 'Get Project',
        request: {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'get_project',
            arguments: {
              id: '{{PROJECT_ID}}'
            }
          }
        }
      },
      {
        name: 'Update Project',
        request: {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'update_project',
            arguments: {
              id: '{{PROJECT_ID}}',
              status: 'active',
              description: 'Updated project description'
            }
          }
        }
      },
      {
        name: 'List Projects',
        request: {
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'list_projects',
            arguments: {}
          }
        }
      },
      
      // Specification Management Tests
      {
        name: 'Create Requirement Spec',
        request: {
          jsonrpc: '2.0',
          id: 5,
          method: 'tools/call',
          params: {
            name: 'create_spec',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              type: 'requirement',
              title: 'User Authentication Requirements',
              content: 'The system must support user login with email and password. Users should be able to reset passwords via email.',
              priority: 'high'
            }
          }
        }
      },
      {
        name: 'Create Technical Spec',
        request: {
          jsonrpc: '2.0',
          id: 6,
          method: 'tools/call',
          params: {
            name: 'create_spec',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              type: 'technical',
              title: 'Authentication API Design',
              content: 'Use JWT tokens for authentication. Implement OAuth2 flow. Store user data in PostgreSQL.',
              priority: 'medium'
            }
          }
        }
      },
      {
        name: 'Get Specs',
        request: {
          jsonrpc: '2.0',
          id: 7,
          method: 'tools/call',
          params: {
            name: 'get_specs',
            arguments: {
              project_id: '{{PROJECT_ID}}'
            }
          }
        }
      },
      {
        name: 'Update Spec',
        request: {
          jsonrpc: '2.0',
          id: 8,
          method: 'tools/call',
          params: {
            name: 'update_spec',
            arguments: {
              id: '{{SPEC_ID}}',
              status: 'active',
              priority: 'critical'
            }
          }
        }
      },
      {
        name: 'Validate Specs',
        request: {
          jsonrpc: '2.0',
          id: 9,
          method: 'tools/call',
          params: {
            name: 'validate_specs',
            arguments: {
              project_id: '{{PROJECT_ID}}'
            }
          }
        }
      },
      
      // Task Management Tests
      {
        name: 'Create Task',
        request: {
          jsonrpc: '2.0',
          id: 10,
          method: 'tools/call',
          params: {
            name: 'create_task',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              spec_id: '{{SPEC_ID}}',
              title: 'Implement User Login API',
              description: 'Create REST API endpoints for user authentication',
              assignee: 'developer@example.com'
            }
          }
        }
      },
      {
        name: 'Update Task Progress',
        request: {
          jsonrpc: '2.0',
          id: 11,
          method: 'tools/call',
          params: {
            name: 'update_task_progress',
            arguments: {
              id: '{{TASK_ID}}',
              status: 'in-progress',
              progress: 50,
              notes: 'API endpoints created, working on authentication logic'
            }
          }
        }
      },
      {
        name: 'Get Tasks',
        request: {
          jsonrpc: '2.0',
          id: 12,
          method: 'tools/call',
          params: {
            name: 'get_tasks',
            arguments: {
              project_id: '{{PROJECT_ID}}'
            }
          }
        }
      },
      {
        name: 'Analyze Progress',
        request: {
          jsonrpc: '2.0',
          id: 13,
          method: 'tools/call',
          params: {
            name: 'analyze_progress',
            arguments: {
              project_id: '{{PROJECT_ID}}'
            }
          }
        }
      },
      
      // Context Management Tests
      {
        name: 'Add Context Note',
        request: {
          jsonrpc: '2.0',
          id: 14,
          method: 'tools/call',
          params: {
            name: 'add_context_note',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              content: 'Decision made to use JWT tokens instead of session cookies for better scalability',
              event_type: 'decision',
              metadata: {
                decision_maker: 'tech_lead',
                alternatives_considered: ['session_cookies', 'oauth_only']
              }
            }
          }
        }
      },
      {
        name: 'Get Project Context',
        request: {
          jsonrpc: '2.0',
          id: 15,
          method: 'tools/call',
          params: {
            name: 'get_project_context',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              include_memory: true,
              memory_limit: 10
            }
          }
        }
      },
      {
        name: 'Search Context',
        request: {
          jsonrpc: '2.0',
          id: 16,
          method: 'tools/call',
          params: {
            name: 'search_context',
            arguments: {
              project_id: '{{PROJECT_ID}}',
              query: 'authentication JWT',
              event_types: ['decision', 'spec_change']
            }
          }
        }
      }
    ];
  }
}

// Run the tests
const tester = new MCPTester();
tester.runTests().catch(console.error);