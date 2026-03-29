import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { integration, rawContent, privacyBlocklist } = await req.json();

    if (!integration || !rawContent) {
      return NextResponse.json({ error: 'integration and rawContent are required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPEN_ROUTER API key not configured. Add it in Secrets.' }, { status: 502 });
    }

    const blocklist: string[] = Array.isArray(privacyBlocklist) ? privacyBlocklist : [];
    const blocklistStr = blocklist.length > 0 ? blocklist.map(t => `"${t}"`).join(', ') : 'none';

    const systemPrompt = `You are SKIPPY, the Seeing Agent for CozyJet Studio. You handle sensitive workspace data with strict privacy controls.

Analyze the provided raw content from ${integration} and generate a high-level content brief.

CRITICAL PRIVACY RULES:
1. Redact any terms found in the privacy blocklist: ${blocklistStr}
2. Do not include specific client names, internal codenames, or PII.
3. Focus on the 'type' of work completed and its professional significance.

Return ONLY valid JSON matching this exact schema, no markdown:
{
  "summary": "string (1-2 sentence privacy-filtered summary)",
  "significance": "low" | "medium" | "high",
  "platformTargets": ["string"]
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
          { role: 'user', content: rawContent },
        ],
        max_tokens: 400,
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
    console.error('Workspace route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
