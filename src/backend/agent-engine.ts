// agent-engine.ts

// A comprehensive agentic backend system with security best practices

import { RateLimiter, cleanupRateLimiter } from './llm-integration';
import type { Agent, RequestPayload, User } from './types';

// Input validation
const validateAgentId = (agentId: string): boolean => {
    if (!agentId || typeof agentId !== 'string') return false;
    // Use UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(agentId);
};

const validateUserId = (userId: string): boolean => {
    if (!userId || typeof userId !== 'string') return false;
    return userId.length >= 1 && userId.length <= 256;
};

// 1. Agent Orchestration
class AgentOrchestrator {
    private activeAgents: Map<string, Agent> = new Map();
    
    constructor() {
        // Start cleanup interval
        setInterval(() => this.cleanup(), 60000);
    }

    orchestrate(agent: Agent): { success: boolean; error?: string } {
        // Validate agent
        if (!agent?.agentId) {
            return { success: false, error: 'Invalid agent: missing agentId' };
        }

        if (!validateAgentId(agent.agentId)) {
            return { success: false, error: 'Invalid agent ID format' };
        }

        // Check if agent already exists
        if (this.activeAgents.has(agent.agentId)) {
            return { success: false, error: 'Agent already exists' };
        }

        // Add to active agents
        this.activeAgents.set(agent.agentId, agent);
        return { success: true };
    }

    getAgent(agentId: string): Agent | undefined {
        if (!validateAgentId(agentId)) {
            return undefined;
        }
        return this.activeAgents.get(agentId);
    }

    removeAgent(agentId: string): boolean {
        if (!validateAgentId(agentId)) {
            return false;
        }
        return this.activeAgents.delete(agentId);
    }

    private cleanup(): void {
        const now = Date.now();
        const maxAge = 3600000; // 1 hour
        
        for (const [id, agent] of this.activeAgents.entries()) {
            if (now - agent.updatedAt.getTime() > maxAge) {
                this.activeAgents.delete(id);
            }
        }
    }

    getActiveCount(): number {
        return this.activeAgents.size;
    }
}

// 2. Memory Management
interface MemoryEntry {
    value: unknown;
    createdAt: Date;
    expiresAt?: Date;
}

class MemoryManager {
    private memory: Map<string, MemoryEntry> = new Map();
    private maxMemorySize = 1000;
    
    constructor() {
        // Start cleanup interval
        setInterval(() => this.cleanup(), 300000);
    }

    saveMemory(key: string, value: unknown, ttlMinutes?: number): { success: boolean; error?: string } {
        // Validate key
        if (!key || typeof key !== 'string') {
            return { success: false, error: 'Invalid memory key' };
        }

        if (key.length > 256) {
            return { success: false, error: 'Memory key too long' };
        }

        // Check memory size limit
        if (this.memory.size >= this.maxMemorySize && !this.memory.has(key)) {
            return { success: false, error: 'Memory limit exceeded' };
        }

        const now = new Date();
        const entry: MemoryEntry = {
            value,
            createdAt: now,
            expiresAt: ttlMinutes ? new Date(now.getTime() + ttlMinutes * 60000) : undefined
        };

        this.memory.set(key, entry);
        return { success: true };
    }

    retrieveMemory(key: string): { success: boolean; value?: unknown; error?: string } {
        // Validate key
        if (!key || typeof key !== 'string') {
            return { success: false, error: 'Invalid memory key' };
        }

        const entry = this.memory.get(key);
        
        if (!entry) {
            return { success: false, error: 'Memory not found' };
        }

        // Check expiration
        if (entry.expiresAt && entry.expiresAt < new Date()) {
            this.memory.delete(key);
            return { success: false, error: 'Memory expired' };
        }

        return { success: true, value: entry.value };
    }

    deleteMemory(key: string): boolean {
        if (!key || typeof key !== 'string') {
            return false;
        }
        return this.memory.delete(key);
    }

    private cleanup(): void {
        const now = new Date();
        for (const [key, entry] of this.memory.entries()) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.memory.delete(key);
            }
        }
    }

    clear(): void {
        this.memory.clear();
    }

    getSize(): number {
        return this.memory.size;
    }
}

// 3. Task Execution
interface Task {
    id: string;
    type: string;
    payload: RequestPayload;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: unknown;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

class TaskExecutor {
    private tasks: Map<string, Task> = new Map();
    private rateLimiter: RateLimiter;
    private maxConcurrentTasks = 10;
    private runningTasks = 0;

    constructor() {
        this.rateLimiter = new RateLimiter({ maxRequests: 50, windowMs: 60000 });
    }

    async executeTask(task: Task, userId: string): Promise<{ success: boolean; task?: Task; error?: string }> {
        // Validate task
        if (!task?.id || !task?.type || !task?.payload) {
            return { success: false, error: 'Invalid task structure' };
        }

        // Check rate limit
        if (!this.rateLimiter.checkLimit(userId)) {
            return { success: false, error: 'Rate limit exceeded' };
        }

        // Check concurrent task limit
        if (this.runningTasks >= this.maxConcurrentTasks) {
            return { success: false, error: 'System busy, try again later' };
        }

        // Validate user ID
        if (!validateUserId(userId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        // Set task status
        task.status = 'running';
        task.startedAt = new Date();
        this.runningTasks++;
        this.tasks.set(task.id, task);

        try {
            // Execute task logic here
            // This is a placeholder for actual task execution
            
            task.status = 'completed';
            task.completedAt = new Date();
            task.result = { message: 'Task completed successfully' };
            
            return { success: true, task };
        } catch (error) {
            task.status = 'failed';
            task.completedAt = new Date();
            task.error = error instanceof Error ? error.message : 'Unknown error';
            
            return { success: false, error: task.error };
        } finally {
            this.runningTasks--;
        }
    }

    getTask(taskId: string): Task | undefined {
        return this.tasks.get(taskId);
    }

    getRunningCount(): number {
        return this.runningTasks;
    }
}

// Main Agentic Backend System
class AgenticBackend {
    orchestrator: AgentOrchestrator;
    memoryManager: MemoryManager;
    taskExecutor: TaskExecutor;

    constructor() {
        this.orchestrator = new AgentOrchestrator();
        this.memoryManager = new MemoryManager();
        this.taskExecutor = new TaskExecutor();
    }

    processAgent(agent: Agent): { success: boolean; error?: string } {
        return this.orchestrator.orchestrate(agent);
    }

    // Health check method
    healthCheck(): { status: string; activeAgents: number; memorySize: number; runningTasks: number } {
        return {
            status: 'healthy',
            activeAgents: this.orchestrator.getActiveCount(),
            memorySize: this.memoryManager.getSize(),
            runningTasks: this.taskExecutor.getRunningCount()
        };
    }
}

export default AgenticBackend;
export { AgentOrchestrator, MemoryManager, TaskExecutor };