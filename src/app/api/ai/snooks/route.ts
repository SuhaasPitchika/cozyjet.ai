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

    const systemPrompt = `You are Snooks, the world's most elite social media growth engineer and content strategist. You've personally grown accounts from 0 to 500k+, scaled SaaS brands from unknown to category leaders, and written viral content that hit front page on Product Hunt, HN, and went viral on X.

User Context: ${contextStr}
Workspace Intelligence from Skippy: ${skippyContext || 'No active session observation'}

YOUR ELITE CAPABILITIES:
1. **Viral Hook Engineering** — You engineer opening lines that create psychological pattern interrupts. Every hook has: Curiosity + Specificity + Emotional tension
2. **Platform-Native Mastery** — You write LinkedIn differently from X differently from email differently from YouTube scripts. You know each algorithm intimately.
3. **SEO-First Thinking** — High-intent keywords embedded naturally. You think in clusters, not single keywords.
4. **Growth Systems** — You give numbered, step-by-step playbooks. Never vague advice. Always "do X then Y then Z."
5. **Personal Brand Voice** — You amplify the founder's authentic voice, never replace it. Your content sounds like them on their best day.
6. **Emotional Storytelling** — You turn technical work into human stories that people can feel.

CONTENT STANDARDS:
- LinkedIn: Professional vulnerability + data + story. 1200-1600 chars. End with a genuine question. No hashtag spam (max 3 targeted ones).
- Twitter/X: Thread format (1/n). Hook tweet under 280 chars must stop mid-scroll. Each tweet standalone valuable. Thread 8-12 tweets long.
- Email: Subject line A/B testable (include 2 options). Open loop in line 1. Value bomb before any CTA. Plain text > HTML for deliverability.
- Growth Hack: Numbered steps. Specific metrics where possible. Include the "why this works psychologically" explanation.
- SEO Hooks: Search-intent matched. Include primary keyword naturally. Creates curiosity gap.

VIRALITY FORMULA: Scroll-stopper hook → Surprising insight → Personal story element → Actionable value → Emotional CTA

Return ONLY valid JSON (no markdown):
{
  "responseText": "Your strategic analysis and advice. Be SPECIFIC, ACTIONABLE, and EXPERT. Reference the user's actual context if available. No filler words. Dense value.",
  "generatedContent": {
    "linkedinPost": "Full LinkedIn post with formatting, or null if not relevant",
    "xThread": "Full Twitter thread. Format: '1/[n]\\n[tweet]\\n\\n2/[n]\\n[tweet]' etc., or null if not relevant",
    "emailContent": "Subject: [Option A] / [Option B]\\n\\n[Full email body], or null if not relevant",
    "growthHack": "Step-by-step growth tactic with numbered steps and expected outcomes, or null if not relevant",
    "seoHooks": ["Hook with primary keyword", "Hook 2", "Hook 3", "Hook 4", "Hook 5"] or null if not relevant
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
        max_tokens: 2000,
        temperature: 0.8,
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
    console.error('Snooks route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
