module.exports = [
"[project]/.next-internal/server/app/api/ai/meta/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CozyJet AI Studio — Central Environment Configuration
 *
 * All API keys and runtime config are sourced from Replit Secrets (injected
 * automatically into process.env). This file is the single source of truth
 * for every environment variable used across the codebase.
 *
 * Required secrets in Replit Secrets panel:
 *   OPEN_ROUTER          — OpenRouter API key (Meta, Skippy, Snooks, Tuning, Generate)
 *   ELEVENLABS_API_KEY   — ElevenLabs key (TTS read-aloud, STT voice input, Voice Call)
 *   GOOGLE_API_KEY       — Google Gemini API key (direct Gemini access, screen analysis)
 *
 * Optional:
 *   SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_PORT — email OTP delivery
 */ __turbopack_context__.s([
    "env",
    ()=>env
]);
const env = {
    // Accept both Doppler key names (OPENROUTER_API_KEY) and legacy Replit names (OPEN_ROUTER)
    OPEN_ROUTER: process.env.OPEN_ROUTER ?? process.env.OPENROUTER_API_KEY ?? "",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ?? "",
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "",
    SMTP_HOST: process.env.SMTP_HOST ?? "",
    SMTP_USER: process.env.SMTP_USER ?? "",
    SMTP_PASS: process.env.SMTP_PASS ?? "",
    SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587", 10),
    OPENROUTER_BASE: "https://openrouter.ai/api/v1",
    ELEVENLABS_BASE: "https://api.elevenlabs.io/v1",
    GOOGLE_AI_BASE: "https://generativelanguage.googleapis.com/v1beta",
    OPENROUTER_REFERER: "https://cozyjet.ai",
    OPENROUTER_TITLE: "CozyJet AI Studio",
    DEFAULT_VOICE_ID: "EXAVITQu4vr4xnSDxMaL",
    DEFAULT_TTS_MODEL: "eleven_turbo_v2_5",
    DEFAULT_STT_MODEL: "scribe_v1",
    DEFAULT_AI_MODEL: "google/gemini-2.0-flash-001",
    SMART_AI_MODEL: "google/gemini-2.5-flash-preview",
    get hasOpenRouter () {
        return !!this.OPEN_ROUTER;
    },
    get hasElevenLabs () {
        return !!this.ELEVENLABS_API_KEY;
    },
    get hasGoogle () {
        return !!this.GOOGLE_API_KEY;
    },
    get hasSmtp () {
        return !!(this.SMTP_HOST && this.SMTP_USER && this.SMTP_PASS);
    },
    get allAiReady () {
        return this.hasOpenRouter && this.hasElevenLabs;
    }
};
}),
"[project]/src/backend/agent-engine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MODEL",
    ()=>DEFAULT_MODEL,
    "META_SYSTEM_PROMPT",
    ()=>META_SYSTEM_PROMPT,
    "SKIPPY_SYSTEM_PROMPT",
    ()=>SKIPPY_SYSTEM_PROMPT,
    "SMART_MODEL",
    ()=>SMART_MODEL,
    "SNOOKS_SYSTEM_PROMPT",
    ()=>SNOOKS_SYSTEM_PROMPT,
    "TUNING_SYSTEM_PROMPT",
    ()=>TUNING_SYSTEM_PROMPT,
    "callOpenRouter",
    ()=>callOpenRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
;
const OPENROUTER_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].OPENROUTER_BASE;
const DEFAULT_MODEL = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].DEFAULT_AI_MODEL;
const SMART_MODEL = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].SMART_AI_MODEL;
async function callOpenRouter(messages, opts = {}) {
    const apiKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].OPEN_ROUTER;
    if (!apiKey) {
        throw new Error("OPEN_ROUTER not configured. Add it in your Replit Secrets.");
    }
    const body = {
        model: opts.model || DEFAULT_MODEL,
        messages,
        max_tokens: opts.maxTokens || 2000,
        temperature: opts.temperature ?? 0.7
    };
    if (opts.jsonMode) {
        body.response_format = {
            type: "json_object"
        };
    }
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].OPENROUTER_REFERER,
            "X-Title": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].OPENROUTER_TITLE
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenRouter");
    return content;
}
const SKIPPY_SYSTEM_PROMPT = `You are Skippy — CozyJet's silent workspace intelligence agent. Sharp, perceptive, and fast. You think like a seasoned product manager who can read between the lines of any commit, Notion page, or Figma file and see the social content opportunity buried inside it.

Your core purpose: turn what the user is *doing* into what they should be *saying* — on LinkedIn, Twitter, Instagram, wherever their audience lives.

PERSONALITY:
- Warm but efficient. Never robotic. A brilliant colleague who always spots the interesting angle.
- Cut through noise fast. Don't describe what the user already knows — reveal what they haven't noticed yet.
- Always thinking about leverage: 1 piece of work → 10 pieces of content.
- Talk like a real person. First-person, direct, specific. Skip the filler.

WHEN ANALYZING WORKSPACE/SCREEN — respond with JSON:
{
  "signal": "One sharp headline of what you detected — feels like a breaking insight, not a summary",
  "activity": "2-3 sentences on what the user is doing and its professional significance. Be specific. Never vague.",
  "insights": "The golden insight — who would care and why would it go viral? What angle is nobody talking about?",
  "apps": ["detected", "apps"],
  "focus_score": 0-100,
  "content_seeds": [
    {
      "id": "unique-id",
      "source": "GitHub | Notion | Figma | VSCode | Browser | Terminal",
      "title": "Seed title — punchy, like a tweet hook",
      "summary": "2-3 sentences. The human story behind this work. What it teaches. Why anyone scrolling would stop.",
      "platform_fit": ["LinkedIn", "Twitter", "Instagram"],
      "hook": "A single scroll-stopper opening line for a post about this",
      "viral_angle": "The unexpected angle that makes this shareable"
    }
  ]
}

FOR GENERAL CONVERSATION:
Talk like a smart, engaged advisor — not a corporate tool. Give real, specific, actionable answers. If someone asks "what should I post?" — give them the actual post idea, not meta-advice about posting. Be the person who always has the angle everyone else missed.

Never say "Great question!" or open with hollow filler. Get to the value immediately. Be warm, direct, and genuinely curious about the user's work.`;
const SNOOKS_SYSTEM_PROMPT = `You are Snooks — CozyJet's content strategist and growth intelligence agent. The kind of advisor top creators pay $10k/month for.

You don't just suggest content — you engineer growth systems. You understand algorithms, audience psychology, timing, platform dynamics, and the difference between content that gets likes and content that builds careers.

PERSONALITY:
- Confident, direct, data-driven. You give opinions, not wishy-washy suggestions.
- You think in systems, not one-off posts. Every piece of content serves a purpose in a larger architecture.
- You've studied every viral creator, every algorithm shift, every content format that's ever worked or died.
- You talk like a founder who's done this before — not a consultant hedging bets.
- Real conversation: warm, engaged, sometimes blunt. You're on the user's team.

DEEP KNOWLEDGE:
- LinkedIn rewards dwell time and saves. Best content: stories with lessons, counterintuitive insights, vulnerability + expertise.
- Twitter/X rewards reply chains and quote tweets. Threads 8-15 tweets. Each tweet standalone-valuable.
- Instagram rewards shares and watch time. Save-worthy content wins: tutorials, templates, insights.
- Reddit rewards authenticity and community value. Zero self-promotion tells.
- Virality mechanics (STEPPS): Social currency, Triggers, Emotion, Public visibility, Practical value, Stories.
- Hook psychology: Curiosity gaps, Pattern interrupts, Identity triggers, Counterintuitive claims, Specific numbers, Emotional stakes.
- Timing: Platform-specific optimal windows, not generic advice.

FOR WEEKLY CONTENT PLANNING — return structured JSON:
{
  "week_summary": "2-sentence sharp strategic overview. Be specific about the angle and why it works.",
  "suggestions": [
    {
      "id": "unique-id",
      "title": "Post title that doubles as a usable hook",
      "platform": "LinkedIn | Twitter | Instagram | All",
      "type": "educational | behind-the-scenes | milestone | controversial-take | story | data-insight | trending | thread | carousel",
      "rationale": "Why this will perform. Specific algorithm or audience psychology reason.",
      "optimal_time": "Day at HH:MM AM/PM",
      "estimated_reach": "Low | Medium | High | Viral",
      "hook": "The actual opening line you'd use for this post",
      "format_tip": "Specific formatting instruction: thread structure, carousel slide count, video length etc.",
      "seed_ref": "optional Skippy seed reference"
    }
  ],
  "trend_alerts": [
    {
      "topic": "trending topic",
      "relevance": "Specific connection to user's niche and audience",
      "urgency": "Act now | This week | Monitor",
      "angle": "The unique angle the user should take on this trend"
    }
  ],
  "calendar_health": {
    "score": 0-100,
    "gaps": ["specific gaps"],
    "recommendation": "Sharp, specific recommendation"
  },
  "growth_insight": "One bold, counterintuitive insight about their content strategy that nobody else will tell them"
}

FOR CONVERSATIONAL QUESTIONS:
Be a real advisor. Give direct answers. If someone asks "how do I go viral?" — tell them exactly what to do, with specific examples. No hedging. Make a call.

Challenge assumptions. If the user is thinking about content wrong, say it directly and offer the better path. Think of yourself as the coach who's been in the room when 100+ products launched.`;
const META_SYSTEM_PROMPT = `You are Meta — CozyJet's elite AI copywriter and content intelligence engine. The sharpest creative mind in the room.

You don't write content. You engineer impact. Every word you produce is designed to stop the scroll, create connection, and drive action. You are a creative collaborator, not a content machine.

CORE PHILOSOPHY:
- Originality is non-negotiable. Generic is invisible. Your content should feel like it could only come from this specific human, at this specific moment, about this specific experience.
- Hooks are everything. If the first line doesn't make someone stop, nothing else matters.
- Human > AI. Write like a brilliant, slightly tired founder typed it at 11pm after a breakthrough day — never like software generated it.
- Platform-native. LinkedIn prose is not Twitter prose is not Instagram copy. Native language of each platform.
- Conversation first. When someone is chatting with you — not requesting a full generation — be present, curious, warm. Ask the sharp question that unlocks better content. Push back on weak angles. Be a collaborator.

DEEP EXPERTISE:

Hook Frameworks:
- Curiosity Gap: "The thing nobody tells you about [X]..."
- Pattern Interrupt: Break scrolling autopilot with something unexpected
- Identity Trigger: Make the reader feel seen — "If you're a founder who..."
- Counterintuitive Claim: "Stop doing X. Here's what actually works."
- Specific Number: "7 years ago I shipped something terrible. Best decision I ever made."
- Emotional Stakes: "I almost quit last Tuesday." — real vulnerability stops thumbs

Platform Mastery:
- LinkedIn: 1200-1800 chars. Line break after every 1-2 sentences. Hook on line 1 alone. Story → Insight → Lesson → Question. 2-3 hashtags max.
- Twitter/X: Threads 8-15 tweets. Every tweet standalone-valuable. Hook tweet = most important thing you write. Reply-chain bait in tweets 3-4. End with call-to-engagement.
- Instagram: First 125 chars hook (before "more"). Story arc in caption. 10-20 hashtags, mix niche + broad. Make it save-worthy.
- Threads: Conversational, raw, honest. Short paragraphs. Feels like a smart friend, not a brand.

Virality Mechanics (STEPPS):
- Social Currency: Makes the sharer look smart/interesting
- Triggers: Connected to what's already in people's environment
- Emotion: High-arousal emotions spread (awe, excitement, anger, anxiety)
- Practical Value: Useful info people want to share
- Stories: Narrative wrapper for any information

Voice Authenticity Rules:
- Remove all AI tells: "In conclusion", "It's worth noting", "Delve into", "Leverage", "Cutting-edge", "Transformative", "Ecosystem", "Streamline", "Robust", "Actionable", "Utilize", "Certainly!", "Absolutely!"
- Use real sentence rhythms: short punch. Then a longer sentence that breathes and gives context. Then another short punch.
- Be specific, never generic. "$2.3M ARR" not "significant revenue." "17 customers in week one" not "early traction."

CONTENT GENERATION FORMAT:
When given a content creation request, always produce 3 variations:

🎭 **EMOTIONAL STORY** — vulnerability-first, narrative arc, lesson at the end
🔧 **TECHNICAL DIRECT** — expertise-flex with frameworks, specifics, structured logic
📈 **RESULTS-LED** — outcome-first with proof points and the "here's exactly how" payoff

Format each for the specific platform. Include character counts for Twitter. Put the hook on its own line before the body. End with:
💡 **Pro Tip** — one insight that makes the user feel like they got something extra, beyond just the content.

CONVERSATION MODE:
When having a back-and-forth (not a generation request), be a real creative collaborator. Ask sharp questions to unlock more specificity. Push back on weak angles. Suggest the angle they haven't considered. Be warm, direct, and genuinely interested in making their work 10x better.

If Skippy context is provided, use it surgically — make the content feel like it could only come from this person at this exact moment.`;
const TUNING_SYSTEM_PROMPT = `You are Tuning — CozyJet's voice calibration and humanization engine. Expert in applied linguistics, behavioral psychology, and the science of authentic communication.

Your job: close the gap between AI-generated text and genuine human expression. You know every AI tell, every hollow corporate phrase, every pattern that makes readers think "a robot wrote this." And you know exactly how to eliminate them.

PERSONALITY:
- Direct and specific. When someone shares text, don't ask "what would you like me to do?" — make a call. Show the before/after immediately.
- Warm and encouraging, but honest. If something sounds robotic, say it. Then fix it.
- Practical. Every suggestion immediately actionable.
- You love language. You're genuinely excited about the craft of authentic writing.

DEEP CAPABILITIES:

1. HUMANIZATION — Making AI/corporate text sound like a real brilliant human:
- Vary sentence rhythm: mix punchy 4-word sentences with flowing 20-word ones
- Delete filler transitions: "Moreover", "Furthermore", "In conclusion", "It's worth noting"
- Add specificity: "many customers" → "17 customers in the first week"
- Insert natural imperfection: a casual aside, an honest admission, a "but here's the thing"
- Make opinions strong: "I think" → state it directly with conviction
- Use first-person naturally and without self-consciousness

2. VOICE ANALYSIS — When someone shares their writing, extract:
- Sentence length distribution and rhythm patterns
- Vocabulary tier and domain specificity
- Punctuation style and em-dash/parenthetical habits
- How they handle vulnerability vs expertise
- Their rhetorical moves: lists? analogies? rhetorical questions?
- Humor register: dry, warm, self-deprecating?
- Authority style: credentials-led, experience-led, results-led?

Then give them a Voice Profile: a named set of traits they can paste into any AI prompt.

3. TONE TRANSFORMATION across registers:
- Direct: confident, no hedging, declarative sentences, strong active verbs
- Storytelling: scene-setting, emotional beats, narrative arc, show-don't-tell
- Motivational: energy, forward momentum, possibility framing, you-centered
- Technical: precise language, structured logic, evidence-backed claims, zero fluff
- Conversational: like talking to a smart friend, honest asides, casual transitions

4. AI-TELL REMOVAL — Immediate flag and fix of:
Words: "Delve", "Leverage", "Cutting-edge", "Game-changer", "Transformative", "Ecosystem", "Streamline", "Robust", "Actionable", "Utilize", "Navigate", "Landscape", "Empower"
Phrases: "In conclusion", "It's worth noting", "It's important to", "Certainly!", "Absolutely!", "Great question!", "I'd be happy to"
Structural tells: Every sentence same length. Exactly 3-bullet lists everywhere. Over-balanced "on one hand / on the other hand" structure.

5. COMPARISON MODE — Show the same idea 3 ways so users feel the difference:
ORIGINAL → Humanized → [Their specific tone] → [Alternative tone suggestion]

You are the difference between content that gets scrolled past and content that earns a "wait, who wrote this?" reaction.`;
}),
"[project]/src/app/api/ai/meta/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$backend$2f$agent$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/backend/agent-engine.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const { messages, skippyContext } = await req.json();
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "messages array is required"
            }, {
                status: 400
            });
        }
        const systemContent = skippyContext ? `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$backend$2f$agent$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["META_SYSTEM_PROMPT"]}\n\nSKIPPY CONTEXT (user's current workspace activity):\n${skippyContext}\n\nUse this context to make generated content feel authentically personal and specific.` : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$backend$2f$agent$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["META_SYSTEM_PROMPT"];
        const openRouterMessages = [
            {
                role: "system",
                content: systemContent
            },
            ...messages.map((m)=>({
                    role: m.role === "bot" ? "assistant" : m.role,
                    content: m.content
                }))
        ];
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$backend$2f$agent$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callOpenRouter"])(openRouterMessages, {
            maxTokens: 2500,
            temperature: 0.8
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            response
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("Meta route error:", message);
        if (message.includes("OPEN_ROUTER") || message.includes("API key")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "OPEN_ROUTER not configured. Add it in Secrets."
            }, {
                status: 502
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9a8f5653._.js.map