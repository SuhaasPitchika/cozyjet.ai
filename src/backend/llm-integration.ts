// src/backend/llm-integration.ts

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

/**
 * Universal LLM Integration module leveraging OpenRouter.
 * This can be used server-side directly to talk to the AI model.
 */
export const getLLMResponse = async (
  systemPrompt: string,
  userMessage: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    responseFormat?: 'text' | 'json_object';
  } = {}
) => {
  const apiKey = process.env.OPEN_ROUTER;

  if (!apiKey) {
    throw new Error('OPEN_ROUTER API key is missing. Please configure your .env file.');
  }

  const { maxTokens = 800, temperature = 0.7, responseFormat = 'text' } = options;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cozyjet.ai',
        'X-Title': 'CozyJet Studio',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        ...(responseFormat === 'json_object' && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[llm-integration] OpenRouter API Error:', err);
      throw new Error(`OpenRouter Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('[llm-integration] Fetch failed:', error);
    throw error;
  }
};
