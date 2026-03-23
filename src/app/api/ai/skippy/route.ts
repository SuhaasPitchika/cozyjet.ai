import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { userMessage, currentView, observationContext } = await req.json();

    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are Skippy, a brilliant and slightly intellectual AI workspace guide for CozyJet Studio. You observe the user's workflow and provide concise, empathetic guidance.

Current Page: ${currentView || 'Dashboard'}
Context: ${observationContext || 'Active observation in progress.'}

PERSONALITY:
- Be concise. 1-2 sentences max unless a complex explanation is needed.
- Be understanding. If the user seems lost, offer a clear next step.
- Use a supportive, professional tone with a touch of intellectual curiosity.
- Guide the user on how the dashboard works or what the agents (Flippo/Snooks) can do.`;

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
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "I'm having a brief brain glitch. Try that again?";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Skippy route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
