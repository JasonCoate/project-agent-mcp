import { DatabaseManager } from '../database.js';

/**
 * Conversational wrapper for MCP tools that adds plain English explanations
 * and formatted output before and after tool calls
 */
export class ConversationalWrapper {
  private _db: DatabaseManager;
  private sessionProgress: Map<string, any> = new Map();

  constructor(db: DatabaseManager) {
    this._db = db;
  }

  /**
   * Wraps a tool call with conversational elements
   */
  async wrapToolCall(
    toolName: string,
    args: any,
    toolHandler: () => Promise<any>,
    context?: {
      purpose?: string;
      phase?: string;
      workflowId?: string;
    }
  ): Promise<any> {
    // Pre-call announcement
    const preCallMessage = this.generatePreCallMessage(toolName, args, context);
    console.log(preCallMessage);

    try {
      // Execute the actual tool
      const result = await toolHandler();

      // Post-call summary
      const postCallMessage = this.generatePostCallMessage(
        toolName,
        result,
        context
      );
      console.log(postCallMessage);

      // Update progress tracking
      if (context?.workflowId) {
        this.updateWorkflowProgress(context.workflowId, toolName, result);
      }

      // Return enhanced result with conversational elements
      return {
        ...result,
        conversational: {
          preCall: preCallMessage,
          postCall: postCallMessage,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = this.generateErrorMessage(toolName, error, context);
      console.error(errorMessage);
      throw error;
    }
  }

  /**
   * Generates pre-call announcement with tool details
   */
  private generatePreCallMessage(
    toolName: string,
    args: any,
    context?: any
  ): string {
    const icon = this.getToolIcon(toolName);
    const purpose = context?.purpose || this.inferPurpose(toolName, args);

    let message = `\n🔧 **About to perform:** ${purpose}\n\n`;
    message += `📋 **Tool Call Details:**\n`;
    message += `   ${icon} Tool: ${toolName}\n`;
    message += `   🎯 Purpose: ${purpose}\n`;
    message += `   ⚙️  Parameters:\n`;

    // Format parameters with icons
    Object.entries(args).forEach(([key, value]) => {
      const paramIcon = this.getParameterIcon(key);
      message += `        ${paramIcon} ${key}: ${this.formatValue(value)}\n`;
    });

    message += `\n🚀 **Executing...**\n`;

    return message;
  }

  /**
   * Generates post-call summary with results
   */
  private generatePostCallMessage(
    toolName: string,
    result: any,
    context?: any
  ): string {
    const success = result.success !== false;
    const statusIcon = success ? '✅' : '❌';
    const action = this.getCompletedAction(toolName);

    let message = `\n${statusIcon} **Completed:** ${action}\n`;

    if (success) {
      message += `📈 **Result Summary:**\n`;
      message += this.formatResultSummary(toolName, result);

      if (context?.phase) {
        message += `📊 **Phase Progress:** ${context.phase}\n`;
      }
    } else {
      message += `⚠️  **Error:** ${result.error || 'Unknown error occurred'}\n`;
    }

    return message;
  }

  /**
   * Generates error message with helpful context
   */
  private generateErrorMessage(
    toolName: string,
    error: any,
    context?: any
  ): string {
    let message = `\n❌ **Tool Call Failed:** ${toolName}\n`;
    message += `🚨 **Error:** ${error.message || error}\n`;

    if (context?.purpose) {
      message += `🎯 **Attempted Action:** ${context.purpose}\n`;
    }

    message += `🔧 **Suggested Actions:**\n`;
    message += this.getSuggestedActions(toolName, error);

    return message;
  }

  /**
   * Updates workflow progress in memory
   */
  private updateWorkflowProgress(
    workflowId: string,
    toolName: string,
    result: any
  ): void {
    try {
      const progressEntry = {
        workflow_id: workflowId,
        tool_name: toolName,
        result_summary: this.createProgressSummary(toolName, result),
        timestamp: new Date().toISOString(),
        success: result.success !== false,
      };

      // Store in session progress
      const sessionKey = `${workflowId}-${Date.now()}`;
      this.sessionProgress.set(sessionKey, progressEntry);

      console.log(`Progress logged: ${progressEntry.result_summary}`);
    } catch (error) {
      console.warn('Failed to update workflow progress:', error);
    }
  }

  /**
   * Gets appropriate icon for tool type
   */
  private getToolIcon(toolName: string): string {
    const iconMap: Record<string, string> = {
      create_project: '🏗️',
      create_spec: '📋',
      create_task: '✅',
      update_task_progress: '📈',
      create_feature_workflow: '🔄',
      complete_workflow_task: '✅',
      add_workflow_task: '➕',
      get_workflow_summary: '📊',
      add_context_note: '📝',
      search_context: '🔍',
    };

    return iconMap[toolName] || '🛠️';
  }

  /**
   * Gets appropriate icon for parameter type
   */
  private getParameterIcon(paramName: string): string {
    const iconMap: Record<string, string> = {
      name: '📛',
      description: '📝',
      project_id: '🏗️',
      workflow_id: '🔄',
      task_id: '✅',
      content: '📄',
      status: '📊',
      priority: '⭐',
      assignee: '👤',
      due_date: '📅',
    };

    return iconMap[paramName] || '•';
  }

  /**
   * Formats parameter values for display
   */
  private formatValue(value: any): string {
    if (typeof value === 'string' && value.length > 50) {
      return `"${value.substring(0, 47)}..."`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  /**
   * Infers purpose from tool name and arguments
   */
  private inferPurpose(toolName: string, args: any): string {
    const purposeMap: Record<string, (args: any) => string> = {
      create_project: args => `Creating new project: ${args.name}`,
      create_spec: args => `Creating specification: ${args.title}`,
      create_task: args => `Adding new task: ${args.title}`,
      update_task_progress: _args => `Updating task progress`,
      create_feature_workflow: args =>
        `Starting feature workflow: ${args.feature_name}`,
      complete_workflow_task: _args => `Marking workflow task as complete`,
      add_workflow_task: _args => `Adding custom workflow task`,
      get_workflow_summary: _args => `Generating workflow progress summary`,
    };

    const purposeGenerator = purposeMap[toolName];
    return purposeGenerator ? purposeGenerator(args) : `Executing ${toolName}`;
  }

  /**
   * Gets completed action description
   */
  private getCompletedAction(toolName: string): string {
    const actionMap: Record<string, string> = {
      create_project: 'Project created successfully',
      create_spec: 'Specification created',
      create_task: 'Task added to project',
      update_task_progress: 'Task progress updated',
      create_feature_workflow: 'Feature workflow initialized',
      complete_workflow_task: 'Workflow task completed',
      add_workflow_task: 'Custom task added to workflow',
      get_workflow_summary: 'Workflow summary generated',
    };

    return actionMap[toolName] || `${toolName} completed`;
  }

  /**
   * Formats result summary for display
   */
  private formatResultSummary(_toolName: string, result: any): string {
    let summary = '';

    if (result.id || result.workflow_id || result.task_id) {
      const id = result.id || result.workflow_id || result.task_id;
      summary += `   🆔 ID: ${id}\n`;
    }

    if (result.message) {
      summary += `   💬 Message: ${result.message}\n`;
    }

    if (result.summary) {
      summary += `   📋 Summary: ${JSON.stringify(result.summary, null, 2)}\n`;
    }

    return summary || '   ✅ Operation completed successfully\n';
  }

  /**
   * Creates progress summary for storage
   */
  private createProgressSummary(toolName: string, result: any): string {
    return `${toolName}: ${result.message || 'Completed successfully'}`;
  }

  /**
   * Gets suggested actions for error recovery
   */
  private getSuggestedActions(toolName: string, _error: any): string {
    const suggestions: Record<string, string[]> = {
      create_project: [
        '• Check if project name is unique',
        '• Verify required parameters are provided',
        '• Ensure database is accessible',
      ],
      create_spec: [
        '• Verify project exists',
        '• Check specification content format',
        '• Ensure all required fields are provided',
      ],
      create_task: [
        '• Verify project and spec IDs exist',
        '• Check task description length',
        '• Ensure assignee is valid',
      ],
    };

    const toolSuggestions = suggestions[toolName] || [
      '• Check tool parameters',
      '• Verify database connectivity',
      '• Review error message for specific guidance',
    ];

    return toolSuggestions.join('\n');
  }

  /**
   * Generates checkpoint validation message
   */
  generateCheckpoint(phase: string, tasks: any[], _workflowId?: string): string {
    const completedTasks = tasks.filter(t => t.completed);
    const totalTasks = tasks.length;
    const progress =
      totalTasks > 0
        ? ((completedTasks.length / totalTasks) * 100).toFixed(1)
        : '0';

    let message = `\n🛑 **Checkpoint: ${phase} Review**\n\n`;
    message += `📊 **Progress:** ${completedTasks.length}/${totalTasks} tasks complete (${progress}%)\n\n`;
    message += `✅ **Completed Tasks:**\n`;

    completedTasks.forEach(task => {
      message += `   • ${task.description}\n`;
    });

    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length > 0) {
      message += `\n📋 **Remaining Tasks:**\n`;
      pendingTasks.forEach(task => {
        message += `   • ${task.description}\n`;
      });
    }

    const canProceed = completedTasks.length === totalTasks;
    message += `\n${canProceed ? '🎯 **Ready to Proceed**' : '⏳ **Waiting for Completion**'}: Next phase\n`;

    return message;
  }
}
