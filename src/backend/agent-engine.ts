import { AgentConfig, TaskContext, ExecutionResult, ExecutionStep, Tool } from './BACKEND';

// A comprehensive agentic backend system

export class AgentOrchestrator {
  private memoryManager: MemoryManager;
  private taskExecutor: TaskExecutor;

  constructor(memoryManager: MemoryManager, taskExecutor: TaskExecutor) {
    this.memoryManager = memoryManager;
    this.taskExecutor = taskExecutor;
  }

  async orchestrate(agentConfig: AgentConfig, taskContext: TaskContext, contextInput: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Save the context to memory
    await this.memoryManager.saveMemory(`task_start_${taskContext.taskId}`, contextInput);

    // Update status
    taskContext.status = 'running';

    try {
      // Execute the actual LLM sequence
      const resultData = await this.taskExecutor.executeTask(agentConfig, taskContext, contextInput);
      
      const endTime = Date.now();
      const result: ExecutionResult = {
        success: true,
        taskId: taskContext.taskId,
        agentId: taskContext.agentId,
        result: resultData,
        executionTime: endTime - startTime,
        completedAt: new Date(endTime),
        steps: resultData.steps || [],
      };

      await this.memoryManager.saveMemory(`task_end_${taskContext.taskId}`, result);
      taskContext.status = 'completed';

      return result;
    } catch (err: any) {
      taskContext.status = 'failed';
      const endTime = Date.now();
      
      const errorResult: ExecutionResult = {
        success: false,
        taskId: taskContext.taskId,
        agentId: taskContext.agentId,
        error: err.message || 'Unknown execution error',
        executionTime: endTime - startTime,
        completedAt: new Date(endTime),
        steps: [],
      };

      await this.memoryManager.saveMemory(`task_fail_${taskContext.taskId}`, errorResult);
      return errorResult;
    }
  }
}

export class MemoryManager {
  private memoryStore: Map<string, any> = new Map();

  async saveMemory(key: string, value: any): Promise<void> {
    this.memoryStore.set(key, value);
    // In a real production deployment, this would write to Firestore/Redis mapping
    console.log(`[MemoryManager] Saved memory for key: ${key}`);
  }

  async retrieveMemory(key: string): Promise<any> {
    return this.memoryStore.get(key);
  }
}

export class TaskExecutor {
  constructor() {}

  async executeTask(agent: AgentConfig, task: TaskContext, input: string): Promise<any> {
    const startStep = new Date();
    
    // Route to the appropriate API based on the agent type
    let endpoint = 'skippy';
    if (agent.id === 'flippo') endpoint = 'flippo';
    else if (agent.id === 'snooks') endpoint = 'snooks';

    try {
      const payload = this.buildPayload(agent, task, input);
      const host = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
      
      // We route the execution through the existing AI API handlers
      const res = await fetch(`${host}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to execute task: ${res.statusText}`);
      }

      const data = await res.json();
      
      const step: ExecutionStep = {
        stepNumber: 1,
        action: 'call_llm',
        input: payload,
        output: data.response || data,
        duration: Date.now() - startStep.getTime(),
        timestamp: new Date(),
      };

      return {
        output: data.response || data,
        steps: [step]
      };
    } catch (error: any) {
      console.error('[TaskExecutor] Execution failed:', error);
      throw error;
    }
  }

  private buildPayload(agent: AgentConfig, task: TaskContext, input: string): Record<string, any> {
    // Dynamic payload building based on the agent config
    if (agent.id === 'flippo') {
      return { activitySummaries: typeof input === 'string' ? [{ startTime: '09:00', endTime: '10:00', description: input }] : input };
    }
    if (agent.id === 'snooks') {
      return { userPrompt: input, userContext: task.parameters || {} };
    }
    // Default to skippy
    return { userMessage: input, currentView: '/dashboard', observationContext: '' };
  }
}

// Main Agentic Backend System
export class AgenticBackend {
  public orchestrator: AgentOrchestrator;
  public memoryManager: MemoryManager;
  public taskExecutor: TaskExecutor;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.taskExecutor = new TaskExecutor();
    this.orchestrator = new AgentOrchestrator(this.memoryManager, this.taskExecutor);
  }

  async processAgentTask(agentConfig: AgentConfig, taskParams: any, input: string) {
    const taskContext: TaskContext = {
      taskId: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: 'system', // In real app, associate with authenticated user
      agentId: agentConfig.id,
      parameters: taskParams,
      createdAt: new Date(),
      status: 'pending'
    };

    return await this.orchestrator.orchestrate(agentConfig, taskContext, input);
  }
}

export default new AgenticBackend();