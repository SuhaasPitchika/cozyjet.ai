import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { rawActivities, skippyContext } = await req.json();
    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const systemPrompt = `You are Flippo, an expert productivity analyst for CozyJet Studio. Transform raw activity data into a beautiful, structured productivity timeline.

CRITICAL RULE: Never say "spent X hours on GitHub" — instead say things like:
- "Spent 90 min refactoring authentication logic in the CozyJet repo — shipped the JWT refresh flow"
- "2h deep work session debugging Firestore rules — resolved 3 critical query bottlenecks"
- "45 min pair-programming session — merged the dashboard redesign PR with 8 file changes"

Make accomplishments SPECIFIC and ACHIEVEMENT-FOCUSED. Focus on what was built, shipped, fixed, or learned.

Return ONLY valid JSON:
{
  "sessions": [
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "durationMinutes": 90,
      "type": "deep_work" | "shallow_work" | "break" | "distraction",
      "title": "Short punchy title (5 words max)",
      "accomplishment": "What was actually built/shipped/fixed (1-2 sentences, specific and achievement-focused)",
      "tool": "VSCode" | "Browser" | "Terminal" | "Figma" | "GitHub" | "Notion" | "Meeting",
      "energyLevel": "high" | "medium" | "low",
      "tags": ["coding", "design", "writing", "research", "communication"]
    }
  ],
  "deepWorkScore": 82,
  "totalFocusMinutes": 245,
  "topAchievement": "Single best thing accomplished today (1 sentence)",
  "momentumInsight": "Flippo's analysis of your work pattern today (2-3 sentences, specific and encouraging)",
  "tomorrowSuggestion": "One specific action to improve tomorrow's deep work session"
}`;

    const userMsg = `Raw activities:\n${JSON.stringify(rawActivities)}\n\nSkippy context:\n${skippyContext || 'No context available'}`;

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
          { role: 'user', content: userMsg },
        ],
        max_tokens: 1500,
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
      return NextResponse.json(JSON.parse(rawText));
    } catch {
      return NextResponse.json({ error: 'Parse error' }, { status: 502 });
    }
  } catch (error) {
    console.error('Timeline route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
