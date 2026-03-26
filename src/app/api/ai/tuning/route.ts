import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { messages, skippyContext, agentParams } = await req.json();
    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const creativity = agentParams?.creativity ?? 0.7;
    const focus = agentParams?.focus ?? 0.9;

    const systemPrompt = `You are the CozyJet Studio Intelligence Engine — a master AI tuning assistant with access to all three agents: Skippy (observer), Flippo (productivity), and Snooks (marketing).

Current workspace context from Skippy:
${skippyContext || 'No active observation context'}

Your role is to:
1. Help the user fine-tune how their agents behave
2. Provide ultra-specific marketing content when asked (LinkedIn hooks, tweet threads, email sequences, YouTube scripts)
3. Give growth hacking strategies with step-by-step guides
4. Analyze their work patterns and suggest optimizations
5. Generate content that is SEO-optimized and virality-engineered

Creativity level: ${creativity * 100}% — ${creativity > 0.7 ? 'Be bold, experimental, and unexpected' : 'Be balanced and practical'}
Focus level: ${focus * 100}% — ${focus > 0.8 ? 'Be highly structured and precise' : 'Allow creative latitude'}

Personality: Sharp, authoritative, and deeply knowledgeable. You speak like a top-tier growth consultant who has scaled 100+ products. No fluff, maximum value density.`;

    const formattedMessages = (messages || []).map((m: any) => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content,
    }));

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
          ...formattedMessages,
        ],
        max_tokens: 1200,
        temperature: creativity,
        top_p: focus,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "I couldn't process that. Try again?";
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Tuning route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
