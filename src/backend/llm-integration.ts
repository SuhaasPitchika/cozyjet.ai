// Secure LLM Integration Module
// Uses environment variables for API keys and implements proper validation

import axios, { AxiosError } from 'axios';

// Input validation helper
const validateInput = (input: string): { valid: boolean; error?: string } => {
    if (!input || typeof input !== 'string') {
        return { valid: false, error: 'Input must be a non-empty string' };
    }
    
    // Check minimum length
    if (input.length < 1) {
        return { valid: false, error: 'Input is too short' };
    }
    
    // Check maximum length to prevent abuse
    if (input.length > 10000) {
        return { valid: false, error: 'Input exceeds maximum allowed length' };
    }
    
    // Check for potentially dangerous patterns
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            return { valid: false, error: 'Input contains potentially dangerous content' };
        }
    }
    
    return { valid: true };
};

// Rate limiting configuration
interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
        this.config = config;
    }

    checkLimit(identifier: string): boolean {
        const now = Date.now();
        const timestamps = this.requests.get(identifier) || [];
        
        // Filter out old timestamps
        const validTimestamps = timestamps.filter(ts => now - ts < this.config.windowMs);
        
        if (validTimestamps.length >= this.config.maxRequests) {
            return false;
        }
        
        validTimestamps.push(now);
        this.requests.set(identifier, validTimestamps);
        return true;
    }

    // Cleanup old entries periodically
    cleanup(): void {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(ts => now - ts < this.config.windowMs);
            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
    }
}

// Initialize rate limiter
const rateLimiter = new RateLimiter();

// Error handling
export class LLMError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'LLMError';
    }
}

export class RateLimitError extends LLMError {
    constructor(message: string = 'Rate limit exceeded') {
        super(message, 'RATE_LIMIT', 429);
        this.name = 'RateLimitError';
    }
}

export class ValidationError extends LLMError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends LLMError {
    constructor(message: string = 'Authentication failed') {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

// Get API key from environment - fail securely if not configured
const getApiKey = (): string => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new AuthenticationError('Gemini API key not configured');
    }
    return apiKey;
};

// Sanitize output to prevent injection
const sanitizeOutput = (output: unknown): string => {
    if (typeof output !== 'string') {
        return JSON.stringify(output);
    }
    
    // Remove potentially dangerous patterns from output
    return output
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};

// Google Gemini API integration for LLM responses
export const getGeminiResponse = async (
    inputText: string,
    options: {
        temperature?: number;
        maxTokens?: number;
        userId?: string;
    } = {}
): Promise<{ response: string; id: string }> => {
    // Validate input
    const validation = validateInput(inputText);
    if (!validation.valid) {
        throw new ValidationError(validation.error || 'Invalid input');
    }

    // Check rate limit if userId provided
    if (options.userId) {
        if (!rateLimiter.checkLimit(options.userId)) {
            throw new RateLimitError();
        }
    }

    try {
        const apiKey = getApiKey();
        
        // Construct safe request payload
        const payload = {
            contents: [{
                parts: [{ text: inputText }]
            }],
            generationConfig: {
                temperature: Math.min(Math.max(options.temperature ?? 0.7, 0), 1),
                maxOutputTokens: Math.min(options.maxTokens ?? 2048, 8192),
                topP: 0.9,
                topK: 40,
            }
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // Validate response structure
        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new LLMError('Invalid response from Gemini API', 'INVALID_RESPONSE', 502);
        }

        const generatedText = sanitizeOutput(response.data.candidates[0].content.parts[0].text);
        
        return {
            response: generatedText,
            id: response.data?.promptFeedback?.selectionMetrics?.logprobs ? 
                crypto.randomUUID() : 
                Date.now().toString()
        };

    } catch (error) {
        // Handle specific error types
        if (error instanceof AxiosError) {
            if (error.response?.status === 429) {
                throw new RateLimitError('API rate limit exceeded');
            }
            if (error.response?.status === 401) {
                throw new AuthenticationError('Invalid API key');
            }
            if (error.code === 'ECONNABORTED') {
                throw new LLMError('Request timeout', 'TIMEOUT', 504);
            }
        }
        
        // Re-throw our custom errors
        if (error instanceof LLMError) {
            throw error;
        }
        
        // Log error securely (don't expose sensitive details)
        console.error('LLM Service Error: Request failed');
        throw new LLMError('Failed to generate response', 'SERVICE_ERROR', 500);
    }
};

// Export rate limiter for external management
export { RateLimiter };

// Cleanup function to prevent memory leaks
export const cleanupRateLimiter = (): void => {
    rateLimiter.cleanup();
};
