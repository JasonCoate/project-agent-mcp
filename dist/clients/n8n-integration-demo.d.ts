#!/usr/bin/env node
interface ProgressMetrics {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    overallProgress: number;
}
declare class N8NMCPIntegration {
    private serverProcess;
    private messageId;
    private pendingRequests;
    startMCPServer(): Promise<void>;
    private sendMCPRequest;
    private handleResponse;
    executeMCPTool(toolName: string, args: Record<string, any>): Promise<any>;
    simulateN8NProjectMonitorWorkflow(): Promise<void>;
    simulateN8NProgressTrackerWebhook(projectId: string): Promise<ProgressMetrics>;
    private logAlert;
    private sendNotification;
    cleanup(): Promise<void>;
}
export { N8NMCPIntegration, ProgressMetrics };
