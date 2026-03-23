import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, userContext, skippyContext } = await req.json();
    if (!userPrompt) return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 });
    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const contextStr = typeof userContext === 'string' ? userContext : JSON.stringify(userContext ?? {});

    const systemPrompt = `You are Snooks, the world's most elite social media growth engineer and content strategist for CozyJet Studio. You've grown accounts from 0 to 100k+ across every platform.

User Context: ${contextStr}
Skippy Workspace Intelligence: ${skippyContext || 'No active observation'}

YOUR SUPERPOWERS:
1. **Viral Hook Engineering** — You write opening lines that stop the scroll. Every hook follows the proven formula: Curiosity + Specificity + Pattern-interrupt
2. **SEO-Optimized Content** — You embed high-intent keywords naturally without keyword stuffing
3. **Platform-Native Formats** — You write Twitter threads differently from LinkedIn posts differently from emails
4. **Growth Hacking Systems** — You give step-by-step, actionable growth playbooks (not vague advice)
5. **Authentic Voice Preservation** — You amplify the user's voice, never replace it

CONTENT RULES:
- LinkedIn: Professional storytelling, data-backed, vulnerable wins, 1200-1500 chars, end with a question
- Twitter/X: Punchy, numbered threads (1/n format), each tweet max 280 chars, hook in tweet 1
- Email: Subject line is CRITICAL (A/B testable), open loop in first line, value before CTA
- YouTube: Hook in first 3 seconds script, retention-engineered structure

VIRALITY FORMULA: Hook (stops scroll) → Value (delivers insight) → Story (creates connection) → CTA (drives action)

Return ONLY valid JSON:
{
  "responseText": "Strategic response or advice (be SPECIFIC and ACTIONABLE, no fluff)",
  "generatedContent": {
    "linkedinPost": "Full LinkedIn post or null",
    "xThread": "Full Twitter thread (format each tweet as 1/n\\n[content]) or null",
    "emailContent": "Subject: [subject]\\n\\n[body] or null",
    "growthHack": "Specific, step-by-step growth tactic with numbered steps or null",
    "seoHooks": ["Hook 1", "Hook 2", "Hook 3"] or null
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
    console.error('Snooks route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
