import { config } from 'dotenv';
import path from 'path';

// Load variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

import { getLLMResponse } from './src/backend/llm-integration.js';

async function testIntegration() {
  try {
    console.log("Testing AgenticBackend Integration...");
    console.log("Using API Key starting with:", process.env.OPEN_ROUTER ? process.env.OPEN_ROUTER.substring(0, 10) + '...' : 'NONE');
    
    // We will simulate a simple Skippy observation to verify connectivity
    const systemPrompt = "You are a helpful test assistant. Respond with 'Integration Successful' and nothing else.";
    const userPrompt = "Test.";
    
    console.log("Sending test payload to OpenRouter...");
    const response = await getLLMResponse(systemPrompt, userPrompt, { maxTokens: 50 });
    
    console.log("---------------------------------");
    console.log("LLM Response received:", response);
    console.log("---------------------------------");
    console.log("✅ API Connection is working perfectly!");
  } catch (error) {
    console.error("❌ API Connection Failed!");
    console.error(error);
  }
}

testIntegration();
