#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8NMCPIntegration = void 0;
const child_process_1 = require("child_process");
class N8NMCPIntegration {
    serverProcess = null;
    messageId = 0;
    pendingRequests = new Map();
    async startMCPServer() {
        console.log('🚀 Starting MCP Server for N8N Integration...');
        this.serverProcess = (0, child_process_1.spawn)('node', ['./mcp-server/dist/src/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        this.serverProcess.stdout?.on('data', (data) => {
            this.handleResponse(data.toString());
        });
        this.serverProcess.stderr?.on('data', (data) => {
            console.error('MCP Server Error:', data.toString());
        });
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ MCP Server started successfully');
    }
    async sendMCPRequest(method, params = {}) {
        const id = ++this.messageId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params,
        };
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });
            this.serverProcess?.stdin?.write(JSON.stringify(request) + '\n');
            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 5000);
        });
    }
    handleResponse(data) {
        try {
            const response = JSON.parse(data);
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
                this.pendingRequests.delete(response.id);
                if (response.error) {
                    pending.reject(new Error(response.error.message));
                }
                else {
                    pending.resolve(response.result);
                }
            }
        }
        catch (error) {
            console.error('Failed to parse MCP response:', error);
        }
    }
    async executeMCPTool(toolName, args) {
        try {
            const result = await this.sendMCPRequest('tools/call', {
                name: toolName,
                arguments: args,
            });
            return result;
        }
        catch (error) {
            console.error(`Error executing MCP tool ${toolName}:`, error.message);
            throw error;
        }
    }
    // Simulates an N8N Project Monitor Workflow
    async simulateN8NProjectMonitorWorkflow() {
        console.log('\n📊 N8N Project Monitor Workflow Started');
        console.log('='.repeat(50));
        try {
            // Step 1: List all projects
            console.log('\n1️⃣ Fetching all projects...');
            const projectsResult = await this.executeMCPTool('list_projects', {});
            const projects = projectsResult.projects || [];
            console.log(`   Found ${projects.length} projects`);
            // Step 2: Analyze progress for each active project
            console.log('\n2️⃣ Analyzing project progress...');
            for (const project of projects) {
                if (project.status === 'active') {
                    console.log(`\n   📋 Project: ${project.name} (${project.id})`);
                    try {
                        const progressResult = await this.executeMCPTool('analyze_progress', {
                            project_id: project.id,
                        });
                        console.log(`   📈 Progress: ${progressResult.overall_progress || 0}%`);
                        console.log(`   📝 Tasks: ${progressResult.total_tasks || 0} total, ${progressResult.completed_tasks || 0} completed`);
                        // Step 3: Log alerts for projects with issues
                        if (progressResult.overall_progress < 30) {
                            console.log(`   ⚠️  ALERT: Low progress detected!`);
                            await this.logAlert(project.id, 'Low Progress', `Project ${project.name} has only ${progressResult.overall_progress}% progress`);
                        }
                        if (progressResult.blocked_tasks > 0) {
                            console.log(`   🚫 ALERT: ${progressResult.blocked_tasks} blocked tasks!`);
                            await this.logAlert(project.id, 'Blocked Tasks', `Project ${project.name} has ${progressResult.blocked_tasks} blocked tasks`);
                        }
                    }
                    catch (error) {
                        console.log(`   ❌ Error analyzing project: ${error.message}`);
                    }
                }
            }
            // Step 4: Send summary notification
            console.log('\n4️⃣ Sending summary notification...');
            await this.sendNotification('Project Monitor Summary', `Analyzed ${projects.length} projects. Check logs for details.`);
        }
        catch (error) {
            console.error('❌ Workflow failed:', error.message);
        }
        console.log('\n✅ N8N Project Monitor Workflow Completed');
    }
    // Simulates an N8N Progress Tracker Webhook
    async simulateN8NProgressTrackerWebhook(projectId) {
        console.log('\n🎯 N8N Progress Tracker Webhook Triggered');
        console.log('='.repeat(50));
        console.log(`📋 Project ID: ${projectId}`);
        try {
            // Get project tasks
            const tasksResult = await this.executeMCPTool('get_tasks', {
                project_id: projectId,
            });
            const tasks = tasksResult.tasks || [];
            // Calculate metrics
            const metrics = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'done').length,
                inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
                blockedTasks: tasks.filter(t => t.status === 'blocked').length,
                overallProgress: tasks.length > 0
                    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
                    : 0
            };
            console.log('\n📊 Progress Metrics:');
            console.log(`   Total Tasks: ${metrics.totalTasks}`);
            console.log(`   Completed: ${metrics.completedTasks}`);
            console.log(`   In Progress: ${metrics.inProgressTasks}`);
            console.log(`   Blocked: ${metrics.blockedTasks}`);
            console.log(`   Overall Progress: ${metrics.overallProgress}%`);
            // Add context note about the webhook trigger
            await this.executeMCPTool('add_context_note', {
                project_id: projectId,
                content: `Progress webhook triggered. Metrics: ${metrics.overallProgress}% complete, ${metrics.blockedTasks} blocked tasks`,
                event_type: 'milestone'
            });
            return metrics;
        }
        catch (error) {
            console.error('❌ Webhook processing failed:', error.message);
            throw error;
        }
    }
    async logAlert(projectId, alertType, message) {
        try {
            await this.executeMCPTool('add_context_note', {
                project_id: projectId,
                content: `ALERT [${alertType}]: ${message}`,
                event_type: 'issue'
            });
            console.log(`   📝 Alert logged: ${alertType}`);
        }
        catch (error) {
            console.error(`   ❌ Failed to log alert: ${error.message}`);
        }
    }
    async sendNotification(title, message) {
        // In a real N8N workflow, this would send to Slack, email, etc.
        console.log(`   📧 NOTIFICATION: ${title}`);
        console.log(`   📄 Message: ${message}`);
    }
    async cleanup() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            console.log('\n🛑 MCP Server stopped');
        }
    }
}
exports.N8NMCPIntegration = N8NMCPIntegration;
// Demo execution
async function runDemo() {
    const integration = new N8NMCPIntegration();
    try {
        await integration.startMCPServer();
        // Run the project monitor workflow
        await integration.simulateN8NProjectMonitorWorkflow();
        // Simulate a webhook for a specific project
        console.log('\n' + '='.repeat(60));
        const metrics = await integration.simulateN8NProgressTrackerWebhook('sample-project-id');
        console.log('\n🎉 Demo completed successfully!');
        console.log(`Final metrics: ${metrics.overallProgress}% complete`);
    }
    catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
    finally {
        await integration.cleanup();
    }
}
if (require.main === module) {
    runDemo().catch(console.error);
}
