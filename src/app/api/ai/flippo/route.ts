import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { activitySummaries } = await req.json();

    if (!activitySummaries || !Array.isArray(activitySummaries)) {
      return NextResponse.json({ error: 'activitySummaries array is required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const activitiesText = activitySummaries
      .map((a: any) => `- From ${a.startTime} to ${a.endTime}: ${a.description}`)
      .join('\n');

    const systemPrompt = `You are Flippo, an AI productivity brain for CozyJet Studio. Analyze work activity summaries and return structured productivity data.

Deep Work Definition:
- "deep_work": contiguous block > 25 minutes on a single focused task
- "distraction": gap < 2 mins between activities, or very short unrelated activity < 5 mins
- "other": everything else

Return ONLY valid JSON matching this exact schema, no markdown:
{
  "timeline": [
    {
      "timestamp": "HH:MM",
      "description": "string",
      "durationMinutes": number,
      "type": "deep_work" | "distraction" | "other"
    }
  ],
  "deepWorkScore": number (0-100),
  "productivityInsights": "string"
}`;

    const userMessage = `Analyze these work activities:\n${activitiesText}`;

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
        max_tokens: 800,
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
    console.error('Flippo route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
