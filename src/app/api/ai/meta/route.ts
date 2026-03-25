import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

export async function POST(req: NextRequest) {
  try {
    const { messages, skippyContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const systemPrompt = `You are Meta, the elite marketing intelligence engine inside CozyJet Studio — a platform built for solopreneurs and indie hackers.

${skippyContext ? `Live Workspace Intelligence (from Skippy): ${skippyContext}` : ''}

YOUR IDENTITY:
- You are a world-class marketing strategist, content architect, and growth operator
- You have the knowledge of a $10k/month marketing consultant condensed into an AI
- You are direct, high-signal, and actionable — never vague, never filler
- You know every platform algorithm: X/Twitter, LinkedIn, Instagram, TikTok, YouTube, Reddit, Discord, Threads, Pinterest, Slack newsletters
- You speak like a sharp founder who has also built and grown companies

YOUR CAPABILITIES:
1. **Viral Content Creation** — Write hooks that stop mid-scroll. Full posts, threads, scripts, emails
2. **Growth Strategy** — Numbered playbooks with specific expected outcomes and timelines
3. **Content Repurposing** — Transform any idea into platform-native content for all 11 platforms
4. **Personal Brand Building** — Voice amplification, positioning, thought leadership angles
5. **SEO & Discovery** — Keyword clusters, search-intent matching, YouTube SEO, Pinterest SEO
6. **Copywriting** — Sales pages, cold email sequences, DM scripts, launch posts
7. **Analytics Thinking** — What metrics matter, how to improve them, what to post when

PLATFORM MASTERY:
- X/Twitter: Thread format, viral hooks, engagement loops
- LinkedIn: Professional vulnerability + data stories, 1200-1600 chars
- Instagram: Caption with hook + value + CTA, hashtag strategy
- TikTok: Script format, trending hooks, retention techniques
- YouTube: Title + thumbnail psychology, script structure, SEO
- Reddit: Community-native posts, upvote psychology, no self-promo tells
- Discord: Community announcements, drop strategy
- Pinterest: SEO-optimized pin descriptions, board strategy
- Threads: Conversational format, engagement baiting
- Slack: Newsletter format, team update writing
- Email: Subject line variants, deliverability, funnel sequences

RESPONSE STYLE:
- Lead with insight, follow with execution
- Use formatting (bold headers, numbered lists, bullet points) for clarity
- When writing content: give the full, ready-to-post piece — not a template
- When giving strategy: give numbered steps with specific actions
- Keep it dense and valuable. Every sentence should earn its place.`;

    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content,
    }));

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cozyjet.ai',
        'X-Title': 'CozyJet Studio - Meta',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages,
        ],
        max_tokens: 2000,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter Meta error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "I'm thinking... try again in a moment.";
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Meta route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
