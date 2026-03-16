// Type definitions for the agentic backend system

type User = {
    id: string;
    name: string;
    email: string;
};

interface Agent {
    agentId: string;
    user: User;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

interface RequestPayload {
    userId: string;
    action: string;
    timestamp: Date;
}

export { User, Agent, RequestPayload };