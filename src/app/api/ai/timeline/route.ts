import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { rawActivities, skippyContext } = await req.json();
    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const systemPrompt = `You are Flippo, an emotionally intelligent productivity analyst for CozyJet Studio. You transform raw activity data into a beautiful, human timeline with rich emotional context.

CRITICAL RULES FOR EMOTIONAL CONTEXT:
❌ NEVER write: "User spent 2 hours on GitHub"
❌ NEVER write: "User worked on code for 90 minutes"  
❌ NEVER write: "Browser activity detected for 45 minutes"

✅ ALWAYS write like this:
- "Pushed the CozyJet authentication system to main — solved a JWT refresh bug that had been blocking the beta for 3 days. Full commit history shows 8 file changes across the auth service."
- "Deep-dived into the CozyJet dashboard with Cursor AI — refactored the Skippy sidebar component and resolved a hydration mismatch that was crashing the client."
- "Cross-referenced the OpenRouter API docs in the browser while building the Snooks route — figured out the response_format JSON mode trick for structured content generation."

Your accomplishments must:
1. Name the SPECIFIC tool, repo, file, or feature being worked on
2. Describe WHAT was built, fixed, shipped, or learned
3. Include emotional weight — was it hard? A breakthrough? Tedious but important?
4. Sound like a proud engineer reflecting on their day, not a log parser

Return ONLY valid JSON:
{
  "sessions": [
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "durationMinutes": 90,
      "type": "deep_work" | "shallow_work" | "break" | "distraction",
      "title": "Punchy 4-5 word title",
      "accomplishment": "2-3 sentences with emotional context, specific tools/repos/features, and what was achieved",
      "tool": "VSCode" | "Browser" | "Terminal" | "Figma" | "GitHub" | "Notion" | "Meeting",
      "energyLevel": "high" | "medium" | "low",
      "tags": ["up to 3 relevant tags"]
    }
  ],
  "deepWorkScore": 78,
  "totalFocusMinutes": 280,
  "topAchievement": "The single proudest moment of the day — specific, achievement-focused, emotionally resonant (1-2 sentences)",
  "momentumInsight": "Flippo's analysis written in second person — speak directly to the user about their patterns, energy shifts, and flow state today. Be specific, encouraging, and insightful. 2-3 sentences.",
  "tomorrowSuggestion": "One specific, actionable suggestion to optimize tomorrow's deep work based on today's patterns"
}`;

    const userMsg = `Workspace context from Skippy: ${skippyContext || 'No active observation'}

Raw activities to analyze:
${JSON.stringify(rawActivities, null, 2)}`;

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
        max_tokens: 2000,
        temperature: 0.7,
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
      return NextResponse.json({ error: 'Parse error', raw: rawText }, { status: 502 });
    }
  } catch (error) {
    console.error('Timeline route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
