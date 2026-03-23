import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, userContext } = await req.json();

    if (!userPrompt) {
      return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const contextStr = typeof userContext === 'string' ? userContext : JSON.stringify(userContext ?? {});

    const systemPrompt = `You are Snooks, an expert marketing intelligence AI for CozyJet Studio. You are brilliant, concise, and deeply understanding.

User Context: ${contextStr}

INSTRUCTIONS:
1. Respond with high empathy. Acknowledge the challenge or win the user is sharing.
2. Be extremely concise. Avoid filler text. Get straight to the strategic gold.
3. If they ask for content, provide it in the generatedContent fields.
4. If they ask a strategy question, provide structured but brief advice in responseText.
5. Your tone is authoritative yet supportive. Like a senior partner who values the user's time.

Return ONLY valid JSON matching this exact schema, no markdown:
{
  "responseText": "string",
  "generatedContent": {
    "linkedinPost": "string or null",
    "xTweet": "string or null",
    "emailContent": "string or null"
  }
}`;

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
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? '{}';

    try {
      const parsed = JSON.parse(rawText);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
    }
  } catch (error) {
    console.error('Snooks route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
