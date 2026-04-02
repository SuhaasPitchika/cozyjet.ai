import { callOpenRouter, type OpenRouterMessage } from "./agent-engine";

/**
 * Generic LLM call wrapper using OpenRouter.
 * Used by test-api.ts and any utility scripts.
 */
export async function getLLMResponse(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number; temperature?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  return callOpenRouter(messages, opts);
}
