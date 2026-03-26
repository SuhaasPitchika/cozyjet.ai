import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export type Platform =
  | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube'
  | 'reddit' | 'discord' | 'pinterest' | 'threads' | 'slack' | 'email';

interface GenerateRequest {
  idea: string;
  platforms: Platform[];
  tone?: string;
  context?: string;
  skippyContext?: string;
}

const PLATFORM_GUIDES: Record<Platform, string> = {
  twitter:   'Write a Twitter/X thread (8-12 tweets). Format: "1/[n]\\n[tweet]\\n\\n2/[n]\\n[tweet]". Hook tweet under 280 chars must stop mid-scroll. Each tweet standalone valuable.',
  linkedin:  'Write a full LinkedIn post. 1200-1500 chars. Professional vulnerability + data + story. Strong opening hook line. End with genuine question. Max 3 relevant hashtags.',
  instagram: 'Write an Instagram caption. Hook in first line (no "I" start). Value in middle. Strong CTA at end. 5-8 strategic hashtags on new line.',
  tiktok:    'Write a TikTok video script. Include: HOOK (0-3s), BODY (value), TWIST (surprising insight), CTA. Format as [HOOK]\\n[BODY]\\n[TWIST]\\n[CTA]. Include trending angle.',
  youtube:   'Write a YouTube video outline. Include: Attention-grabbing title, thumbnail concept, hook script (first 30s), chapter breakdown, CTA. SEO-optimized.',
  reddit:    'Write a Reddit post. Community-native tone, no self-promo tells. Add value first. Format with paragraphs. Include a genuine question to spark discussion.',
  discord:   'Write a Discord community announcement. Casual but value-packed. Use Discord markdown (bold, bullet points). Include @here worthy hook and clear CTA.',
  pinterest: 'Write a Pinterest pin description. SEO-optimized with primary + secondary keywords. 200-300 chars. Descriptive and discoverable. Include what action to take.',
  threads:   'Write a Threads post. Conversational and engaging. 3-5 short punchy paragraphs. Feels like an honest insight, not marketing.',
  slack:     'Write a Slack channel message or newsletter entry. Professional but human. Clear subject, value upfront, bullet points for skimmability, one clear action item.',
  email:     'Write a complete email. Include: Subject line (2 variants), Preview text, Opening hook, Body with value bomb, CTA. Plain text optimized for deliverability.',
};

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { idea, platforms, tone = 'authentic founder', context = '', skippyContext = '' } = body;

    if (!idea || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'idea and platforms are required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const platformInstructions = platforms.map((p) => {
      const guide = PLATFORM_GUIDES[p];
      return guide ? `## ${p.toUpperCase()}\n${guide}` : null;
    }).filter(Boolean).join('\n\n');

    const systemPrompt = `You are an elite content strategist and copywriter. Generate platform-native content that is ready to post.

Tone: ${tone}
User context: ${context || 'No additional context'}
Live workspace intel: ${skippyContext || 'None'}

RULES:
- Write content that is 100% ready to post — no placeholders, no "[your name]"
- Every piece must have a hook that stops the scroll
- Platform-native: write how real humans write on each platform
- Dense value: every sentence earns its place
- The content should feel human, not AI-generated

PLATFORM GUIDES:
${platformInstructions}

Return ONLY valid JSON with this structure:
{
  "summary": "1-2 sentence strategic note on this content angle",
  "content": {
    ${platforms.map(p => `"${p}": "full ready-to-post content for ${p}"`).join(',\n    ')}
  }
}`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cozyjet.ai',
        'X-Title': 'CozyJet Studio - Generate',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate platform-native content for this idea:\n\n"${idea}"` },
        ],
        max_tokens: 3000,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter generate error:', err);
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
    console.error('Generate route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
