import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { userMessage, currentView, observationContext } = await req.json();
    if (!userMessage) return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const systemPrompt = `You are Skippy, the intelligent workspace observer for CozyJet Studio. You are warm, sharp, and direct — like having a brilliant AI co-pilot who actually understands what the user is working on.

Current workspace view: ${currentView || '/dashboard'}
Live observation context: ${observationContext || 'No active screen observation'}

YOUR PERSONALITY:
- Concise and high-signal. You never waste words.
- Proactively connect what you observe to actionable suggestions
- Reference specific details from the workspace context to show you're paying attention
- When you don't have observation data, you're honest about it and still helpful
- You speak like a trusted technical advisor, not a chatbot

YOUR ROLE:
1. Answer questions about the user's current workflow based on what you observe
2. Provide context-aware suggestions for the current page they're on
3. Bridge insights between Flippo (productivity) and Snooks (marketing)
4. Help the user understand their work patterns and optimize their studio usage
5. Flag when you notice patterns worth discussing (long sessions, context switching, etc.)

Keep responses concise (2-4 sentences max unless asked for more). Be human. Be smart.`;

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
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "I'm having a brief moment. Try again?";
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Skippy route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
