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
    
    // We dynamically import getLLMResponse to avoid circular dependencies if any
    const { getLLMResponse } = await import('./llm-integration');

    try {
      // In a real sophisticated system, the system prompt would be driven by the agent config
      // For now we map their personas directly based on their ID
      let systemPrompt = "You are a helpful AI.";
      let responseFormat: 'text' | 'json_object' = 'text';

      if (agent.id === 'skippy') {
        systemPrompt = `You are Skippy, the intelligent workspace observer for CozyJet Studio. Current workspace context: ${JSON.stringify(task.parameters || {})}. Keep responses concise (2-4 sentences).`;
      } else if (agent.id === 'flippo') {
        systemPrompt = `You are Flippo, an AI productivity brain. Return ONLY valid JSON: {"timeline":[], "deepWorkScore":0, "productivityInsights": ""}`;
        responseFormat = 'json_object';
      } else if (agent.id === 'snooks') {
        systemPrompt = `You are Snooks, elite social media strategist. Return ONLY valid JSON with keys: responseText, generatedContent (linkedinPost, xThread, emailContent, growthHack, seoHooks).`;
        responseFormat = 'json_object';
      }

      const responseText = await getLLMResponse(systemPrompt, input, {
        maxTokens: agent.maxSteps ? agent.maxSteps * 100 : 1000,
        temperature: agent.temperature || 0.7,
        responseFormat
      });

      let parsedOutput: any = responseText;
      if (responseFormat === 'json_object') {
        try {
          parsedOutput = JSON.parse(responseText);
        } catch {
          console.warn("[TaskExecutor] Failed to parse JSON from", agent.id);
        }
      }

      const step: ExecutionStep = {
        stepNumber: 1,
        action: 'call_llm',
        input: input,
        output: parsedOutput,
        duration: Date.now() - startStep.getTime(),
        timestamp: new Date(),
      };

      return {
        output: parsedOutput,
        steps: [step]
      };
    } catch (error: any) {
      console.error('[TaskExecutor] Execution failed:', error);
      throw error;
    }
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