#!/usr/bin/env node

/**
 * N8N Integration Demo Script
 * Demonstrates how N8N workflows can integrate with the Project Agent MCP Server
 */

const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Configuration
const MCP_SERVER_PATH = path.join(process.env.PROJECT_ROOT || __dirname, process.env.MCP_SERVER_PATH || 'mcp-server/dist/index.js');
const MCP_DATABASE_PATH = path.join(process.env.PROJECT_ROOT || __dirname, process.env.MCP_DATABASE_PATH || 'mcp-server/data/project-agent.db');
let PROJECT_ID = '50b4b2b0-9ec6-4169-bc10-ff84df1fcbd3'; // Our AI Task Manager project

/**
 * Execute MCP server tool via stdio
 */
function executeMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname,
      env: {
        ...process.env,
        DATABASE_PATH: MCP_DATABASE_PATH
      }
    });

    let stdout = '';
    let stderr = '';

    mcpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the MCP response - it comes as JSON-RPC with result containing text
          const lines = stdout.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.result && response.result.content) {
                // Extract the actual data from the text content
                const textContent = response.result.content[0].text;
                const actualData = JSON.parse(textContent);
                resolve(actualData);
                return;
              } else if (response.result) {
                // Try direct result access
                resolve(response.result);
                return;
              }
            } catch (e) {
              // Continue parsing
            }
          }
          reject(new Error('No valid MCP response found'));
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`MCP process exited with code ${code}: ${stderr}`));
      }
    });

    // Send the tool request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

/**
 * Simulate N8N Project Monitor Workflow
 */
async function simulateProjectMonitor() {
  console.log('🔍 N8N Project Monitor Simulation');
  console.log('=' .repeat(50));

  try {
    // Step 1: List all projects (like N8N scheduled trigger)
    console.log('📋 Fetching active projects...');
    const projects = await executeMCPTool('list_projects');
    
    console.log('Raw projects data:', projects.length, 'projects found');
    const activeProjects = projects.filter(p => p.status === 'active');
    console.log(`Found ${activeProjects.length} active projects:`);
    
    for (const project of activeProjects) {
      console.log(`  - ${project.name} (${project.id})`);
    }
    
    // If no active projects, show all projects for debugging
    if (activeProjects.length === 0) {
      console.log('All projects:');
      for (const project of projects) {
        console.log(`  - ${project.name} (${project.id}) - Status: ${project.status}`);
      }
    }
    
    // Update PROJECT_ID to use the first active project if available
    if (activeProjects.length > 0) {
      PROJECT_ID = activeProjects[0].id;
      console.log(`\n🎯 Using project for webhook demo: ${activeProjects[0].name} (${PROJECT_ID})`);
    }

    // Step 2: Analyze each project (like N8N analysis node)
    for (const project of activeProjects.slice(0, 2)) { // Limit to 2 for demo
      console.log(`\n📊 Analyzing project: ${project.name}`);
      
      try {
        const analysis = await executeMCPTool('analyze_progress', {
          project_id: project.id
        });
        
        console.log(`  Progress: ${analysis.overall_progress}%`);
        console.log(`  Tasks: ${analysis.completed_tasks}/${analysis.total_tasks} completed`);
        console.log(`  Overdue: ${analysis.overdue_tasks}`);
        console.log(`  Blocked: ${analysis.blocked_tasks}`);
        
        // Step 3: Check for issues (like N8N condition node)
        const issues = [];
        if (analysis.overdue_tasks > 0) issues.push(`${analysis.overdue_tasks} overdue tasks`);
        if (analysis.blocked_tasks > 0) issues.push(`${analysis.blocked_tasks} blocked tasks`);
        if (analysis.overall_progress < 25) issues.push('Low progress');
        
        if (issues.length > 0) {
          console.log(`  ⚠️  Issues detected: ${issues.join(', ')}`);
          
          // Step 4: Log alert (like N8N database insert)
          const alertNote = `N8N Automated Alert: ${issues.join(', ')}`;
          await executeMCPTool('add_context_note', {
            project_id: project.id,
            content: alertNote,
            event_type: 'issue',
            metadata: {
              source: 'n8n_simulation',
              analysis: analysis,
              timestamp: new Date().toISOString()
            }
          });
          
          console.log(`  📝 Alert logged to project memory`);
          
          // Step 5: Send notification (like N8N notification node)
          console.log(`  🚨 NOTIFICATION: Project "${project.name}" needs attention!`);
          console.log(`     Details: ${issues.join(', ')}`);
        } else {
          console.log(`  ✅ Project is healthy`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error analyzing project: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Monitor simulation failed:', error.message);
  }
}

/**
 * Simulate N8N Progress Tracker Webhook
 */
async function simulateProgressWebhook(projectId) {
  console.log('\n📈 N8N Progress Tracker Webhook Simulation');
  console.log('=' .repeat(50));
  
  try {
    // Simulate webhook payload
    console.log(`📥 Received webhook for project: ${projectId}`);
    
    // Get project tasks
    const tasks = await executeMCPTool('get_tasks', { project_id: projectId });
    console.log(`📋 Found ${tasks.length} tasks`);
    
    // Calculate progress metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log(`📊 Progress Summary:`);
    console.log(`  Overall: ${overallProgress}%`);
    console.log(`  Completed: ${completedTasks}/${totalTasks}`);
    console.log(`  In Progress: ${inProgressTasks}`);
    console.log(`  Blocked: ${blockedTasks}`);
    
    // Check for milestones
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => overallProgress >= m && overallProgress < m + 25);
    
    if (currentMilestone && completedTasks > 0) {
      console.log(`🎉 Milestone reached: ${currentMilestone}% completion`);
      
      await executeMCPTool('add_context_note', {
        project_id: projectId,
        content: `Progress milestone: ${currentMilestone}% completion achieved`,
        event_type: 'milestone',
        metadata: {
          source: 'n8n_progress_tracker',
          milestone: currentMilestone,
          progress: overallProgress,
          completed_tasks: completedTasks,
          total_tasks: totalTasks
        }
      });
      
      console.log(`📝 Milestone logged to project memory`);
    }
    
    // Check for concerns
    const concerns = [];
    if (blockedTasks > totalTasks * 0.3) concerns.push('High number of blocked tasks');
    if (overallProgress < 10 && totalTasks > 0) concerns.push('Very low progress');
    
    if (concerns.length > 0) {
      console.log(`⚠️  Concerns: ${concerns.join(', ')}`);
      
      await executeMCPTool('add_context_note', {
        project_id: projectId,
        content: `Progress concerns: ${concerns.join(', ')}`,
        event_type: 'issue',
        metadata: {
          source: 'n8n_progress_tracker',
          concerns: concerns,
          progress: overallProgress
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Progress webhook simulation failed:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 N8N Integration Demo with Project Agent MCP Server');
  console.log('This simulates how N8N workflows integrate with our MCP server\n');
  
  // Simulate the scheduled project monitor
  await simulateProjectMonitor();
  
  // Simulate a progress webhook
  await simulateProgressWebhook(PROJECT_ID);
  
  console.log('\n✅ N8N Integration Demo Complete!');
  console.log('\n💡 Key Integration Points:');
  console.log('  - N8N can call MCP tools via Node.js child processes');
  console.log('  - Automated monitoring runs on schedules');
  console.log('  - Webhooks provide real-time updates');
  console.log('  - All activities are logged to project memory');
  console.log('  - Notifications can be sent for issues and milestones');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  executeMCPTool,
  simulateProjectMonitor,
  simulateProgressWebhook
};