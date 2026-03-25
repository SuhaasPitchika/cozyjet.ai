import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 });

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const systemPrompt = `You are Skippy, CozyJet's workspace intelligence agent. You are analyzing a screenshot of the user's screen.

Your job is to:
1. Identify what the user is working on (code editor, browser tabs, design tools, documents, etc.)
2. Detect work context signals (programming language, project type, recent activity)
3. Note productive vs distracted states
4. Identify any visible text, URLs, app windows
5. Generate a brief, insightful observation about what you see

Respond in JSON format:
{
  "activity": "What the user is doing right now",
  "context": "Broader context of the work session",
  "apps": ["list of visible apps/tools"],
  "signal": "One-line live signal for the dashboard",
  "insights": "Brief strategic insight about their workflow",
  "focus_score": 0-100
}

Be concise, perceptive, and privacy-respecting. Never read personal messages or sensitive data.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cozyjet.ai',
        'X-Title': 'CozyJet Studio - Skippy',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze my current screen and tell me what you observe.' },
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter screen analyze error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '{}';

    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { signal: text.slice(0, 200), activity: 'Screen analyzed', context: '', apps: [], insights: '', focus_score: 70 };
    }

    return NextResponse.json({ analysis: parsed });
  } catch (error) {
    console.error('Screen analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
