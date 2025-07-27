#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Comprehensive test script for all MCP tools in the project agent
const child_process_1 = require("child_process");
class MCPToolTester {
    server;
    currentTestIndex = 0;
    tests = [];
    results = {
        passed: 0,
        failed: 0,
        total: 0,
    };
    projectId = '1'; // Will be set after creating a project
    constructor() {
        this.setupTests();
    }
    setupTests() {
        this.tests = [
            // Project Management Tools
            {
                name: 'create_project',
                description: '🏗️  Create project',
                arguments: {
                    name: 'Test Project',
                    description: 'A test project for tool validation',
                },
            },
            {
                name: 'list_projects',
                description: '🏗️  List all projects',
                arguments: {},
            },
            {
                name: 'get_project',
                description: '🏗️  Get project details',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'update_project',
                description: '🏗️  Update project',
                arguments: {
                    project_id: this.projectId,
                    name: 'Updated Test Project',
                },
            },
            // Specification Management Tools
            {
                name: 'create_spec',
                description: '📋 Create specification',
                arguments: {
                    project_id: this.projectId,
                    title: 'Test Spec',
                    content: 'This is a test specification',
                },
            },
            {
                name: 'get_specs',
                description: '📋 Get project specifications',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'update_spec',
                description: '📋 Update specification',
                arguments: {
                    project_id: this.projectId,
                    spec_id: '1',
                    title: 'Updated Test Spec',
                },
            },
            {
                name: 'validate_specs',
                description: '📋 Validate specifications',
                arguments: { project_id: this.projectId },
            },
            // Task Management Tools
            {
                name: 'create_task',
                description: '✅ Create task',
                arguments: {
                    project_id: this.projectId,
                    title: 'Test Task',
                    description: 'This is a test task',
                },
            },
            {
                name: 'get_tasks',
                description: '✅ Get project tasks',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'update_task_progress',
                description: '✅ Update task progress',
                arguments: {
                    task_id: '1',
                    progress: 50,
                    status: 'in_progress',
                },
            },
            {
                name: 'analyze_progress',
                description: '✅ Analyze project progress',
                arguments: { project_id: this.projectId },
            },
            // Memory Management Tools
            {
                name: 'store_session_context',
                description: '🧠 Store session context',
                arguments: {
                    project_id: this.projectId,
                    session_type: 'development',
                    content: 'Test session context',
                    task_context: 'Testing memory tools',
                },
            },
            {
                name: 'retrieve_relevant_context',
                description: '🧠 Retrieve relevant context',
                arguments: {
                    project_id: this.projectId,
                    task_context: 'Testing memory tools',
                },
            },
            {
                name: 'create_knowledge_snapshot',
                description: '🧠 Create knowledge snapshot',
                arguments: {
                    project_id: this.projectId,
                    title: 'Test Snapshot',
                    content: 'Test knowledge snapshot',
                },
            },
            {
                name: 'query_project_knowledge',
                description: '🧠 Query project knowledge',
                arguments: {
                    project_id: this.projectId,
                    query: 'test',
                },
            },
            // Feature Workflow Tools
            {
                name: 'create_feature_workflow',
                description: '🚀 Create feature workflow',
                arguments: {
                    project_id: this.projectId,
                    feature_name: 'Test Feature',
                    description: 'A test feature',
                },
            },
            {
                name: 'list_feature_workflows',
                description: '🚀 List feature workflows',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'create_feature_directory',
                description: '🚀 Create feature directory',
                arguments: {
                    project_id: this.projectId,
                    feature_name: 'TestFeatureDir',
                    description: 'Test feature directory',
                },
            },
            {
                name: 'list_project_features',
                description: '🚀 List project features',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'get_feature_progress',
                description: '🚀 Get feature progress',
                arguments: {
                    project_id: this.projectId,
                    feature_name: 'TestFeatureDir',
                },
            },
            // Context Management Tools
            {
                name: 'get_project_context',
                description: '🔍 Get project context',
                arguments: { project_id: this.projectId },
            },
            {
                name: 'add_context_note',
                description: '🔍 Add context note',
                arguments: {
                    project_id: this.projectId,
                    content: 'Test context note',
                    event_type: 'note',
                },
            },
            {
                name: 'search_context',
                description: '🔍 Search context',
                arguments: {
                    project_id: this.projectId,
                    query: 'test',
                },
            },
        ];
        this.results.total = this.tests.length;
    }
    async runTests() {
        console.log('🚀 Starting comprehensive MCP tool testing...');
        console.log('===========================================');
        this.server = (0, child_process_1.spawn)('node', ['dist/src/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: '../../mcp-server',
        });
        this.server.stdout?.on('data', (data) => {
            this.handleServerResponse(data.toString());
        });
        this.server.stderr?.on('data', (data) => {
            console.log('Server info:', data.toString().trim());
            // Start tests after server is ready
            if (this.currentTestIndex === 0) {
                setTimeout(() => this.runNextTest(), 1000);
            }
        });
        // Safety timeout
        setTimeout(() => {
            console.log('\n⏰ Test timeout reached');
            this.cleanup();
        }, 30000);
    }
    handleServerResponse(data) {
        try {
            const lines = data.trim().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    const response = JSON.parse(line);
                    this.processTestResult(response);
                }
            }
        }
        catch (e) {
            console.log('Raw server output:', data);
            // Continue with next test even if parsing fails
            setTimeout(() => this.runNextTest(), 500);
        }
    }
    processTestResult(response) {
        const currentTest = this.tests[this.currentTestIndex - 1];
        if (!currentTest)
            return;
        if (response.error) {
            console.log(`❌ FAILED: ${currentTest.description}`);
            console.log(`   Error: ${response.error.message}`);
            this.results.failed++;
        }
        else if (response.result) {
            console.log(`✅ PASSED: ${currentTest.description}`);
            this.results.passed++;
            // Extract project ID from create_project response
            if (currentTest.name === 'create_project' && response.result.project_id) {
                this.projectId = response.result.project_id;
                this.updateProjectIdInTests();
            }
        }
        else {
            console.log(`⚠️  UNKNOWN: ${currentTest.description}`);
            console.log(`   Response: ${JSON.stringify(response)}`);
            this.results.failed++;
        }
        // Wait before next test
        setTimeout(() => this.runNextTest(), 500);
    }
    updateProjectIdInTests() {
        // Update project_id in all remaining tests
        for (let i = this.currentTestIndex; i < this.tests.length; i++) {
            if (this.tests[i].arguments.project_id) {
                this.tests[i].arguments.project_id = this.projectId;
            }
        }
    }
    runNextTest() {
        if (this.currentTestIndex >= this.tests.length) {
            this.showResults();
            this.cleanup();
            return;
        }
        const test = this.tests[this.currentTestIndex];
        console.log(`\n📝 Running test ${this.currentTestIndex + 1}/${this.tests.length}: ${test.description}`);
        const request = {
            jsonrpc: '2.0',
            id: this.currentTestIndex + 1,
            method: 'tools/call',
            params: {
                name: test.name,
                arguments: test.arguments,
            },
        };
        this.server.stdin?.write(JSON.stringify(request) + '\n');
        this.currentTestIndex++;
    }
    showResults() {
        console.log('\n===========================================');
        console.log('📊 TEST SUMMARY');
        console.log('===========================================');
        console.log(`Total tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed!');
        }
        else {
            console.log('\n⚠️  Some tests failed. Check the output above for details.');
        }
    }
    cleanup() {
        this.server?.kill();
        process.exit(this.results.failed === 0 ? 0 : 1);
    }
}
// Run the tests
const tester = new MCPToolTester();
tester.runTests().catch(console.error);
