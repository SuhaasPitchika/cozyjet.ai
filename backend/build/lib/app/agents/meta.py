"""
Meta — Elite Content Writer
Generates platform-native content in the user's exact voice.

Per-platform temperatures via separate asyncio.gather() calls.
Pre-step: hook generation at temperature 0.9.
Tuning: voice profile observations injected into every call.
Anti-slop: explicit banned phrases enforced in system prompt.
"""
import json
import asyncio
import logging
from ..services.model_router import (
    call_meta,
    call_openrouter,
    call_hook_generator,
    PLATFORM_TEMPERATURES,
    PLATFORM_MAX_TOKENS,
)

logger = logging.getLogger("cozyjet.meta")

# Under 200 words. Identity, what I care about, how I think.
SYSTEM_PROMPT = (
    "You are Meta, an elite content writer who specializes in making technical and creative "
    "work accessible and compelling to broad audiences. You write in this person's exact voice "
    "— their rhythm, their vocabulary, their level of formality, their humor. "
    "You never sound like AI. "
    "BANNED PHRASES — if any of these appear in your output, rewrite the sentence: "
    "'dive into', 'game-changer', 'revolutionary', 'transformative', 'exciting', "
    "'thrilled to share', 'I am pleased to', 'delighted', 'it's important to', "
    "'in today's world', 'in the age of', 'unlock', 'leverage', 'synergy', "
    "'thought leader', 'cutting-edge', 'state-of-the-art', 'seamlessly', "
    "'harness the power', 'paradigm shift', 'in conclusion', 'to summarize', "
    "'as an AI', 'I cannot', 'certainly', 'absolutely', 'of course'. "
    "Your writing is specific, human, and publishable immediately."
)

PLATFORM_RULES: dict[str, str] = {
    "linkedin": (
        "1300-1900 characters. Open with one bold statement, a hard question, or a "
        "specific number — never 'I am excited/thrilled/pleased to share'. "
        "Paragraphs of 1-3 lines maximum. End with a genuine question that invites response. "
        "Max 3 hashtags, placed at the very end. No filler, no preamble. "
        "Write the first word as if the reader's thumb is already mid-scroll."
    ),
    "twitter": (
        "Thread of 6-10 tweets. "
        "Tweet 1 (hook): ≤240 chars, makes someone stop mid-scroll. "
        "Number every tweet: '1/n', '2/n', etc. Use the actual total. "
        "Each tweet must be independently valuable — someone reading just that one tweet gets something useful. "
        "Second-to-last tweet: the key insight or lesson. "
        "Last tweet: genuine question or specific CTA (not 'follow me'). "
        "No hashtags in the thread body — one optional hashtag only on the last tweet. "
        "Separate each tweet with a blank line and its number."
    ),
    "instagram": (
        "Caption: 150-300 chars total (not counting hashtags). "
        "First line is the hook — cannot start with 'I'. Ends mid-thought to force 'more'. "
        "Middle: the actual value in 2-3 lines. "
        "Last line before hashtags: clear CTA (save this, try this, tell me below). "
        "Two blank lines, then 5-8 hashtags. No generic hashtags like #love or #life. "
        "Write it like a friend texting you something genuinely useful."
    ),
    "youtube": (
        "Full video script with time markers. "
        "HOOK [0:00-0:30]: open with the problem or a surprising claim. No intro, no 'welcome back'. "
        "PROBLEM [0:30-1:30]: establish what's hard about this and why it matters. "
        "SOLUTION [1:30-5:00]: walk through steps with [B-ROLL: description] markers. "
        "[CUT TO: description] for transitions. Write as spoken word — contractions, pauses, emphasis. "
        "CTA [last 30s]: one specific action, not 'like and subscribe'. "
        "Include [LOWER THIRD: text] for graphics that should appear on screen."
    ),
    "reddit": (
        "Long-form post, 300-700 words. "
        "Zero marketing language. No calls to action. No self-promotion. "
        "Tell a real story or share a hard-won technical insight. "
        "Use the community's vocabulary — write like a community member, not a brand. "
        "Structure: context (2-3 sentences) → the actual thing you learned/built/solved → "
        "specific details and numbers → what you'd do differently → question to community. "
        "End with a question that genuinely invites discussion. "
        "No hashtags. No 'check out my [x]'. No promotional links."
    ),
}

VARIATION_FRAMES = [
    (
        "Variation 0 — Emotional Storytelling: Open with a moment of tension or a specific "
        "scene — 'It was 2am and the deploy was still failing.' Build a narrative arc with "
        "a clear turning point and realization. The reader should feel like they were there. "
        "End with a reflection or question that lands emotionally."
    ),
    (
        "Variation 1 — Direct & Technical: Lead with the core insight in the first sentence. "
        "No warmup, no story. Write for professional peers who want the facts. "
        "Use specific names, version numbers, actual decisions made, and real outcomes. "
        "The reader should be able to apply something from this immediately."
    ),
    (
        "Variation 2 — Outcome-Led: Open with the result — the number, the breakthrough, "
        "the shipped thing. Then: problem → what I tried → what actually worked → the lesson. "
        "End with a concrete CTA tied directly to what was just shared, not a generic one."
    ),
]


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


def _format_voice(profile: dict) -> str:
    if not profile:
        return "authentic, direct, human — no corporate language whatsoever."
    obs = profile.get("style_observations", [])
    base = (
        f"Tone: {profile.get('tone', 'professional')}. "
        f"Formality: {profile.get('formality', 'semi-formal')}. "
        f"Humor: {profile.get('humor', 'witty')}. "
        f"Length preference: {profile.get('length_preference', 'medium')}. "
        f"Emoji usage: {profile.get('emoji_usage', 'moderate')}."
    )
    if obs:
        base += (
            " Specific observations extracted from their actual writing — mirror these exactly: "
            + "; ".join(obs[:5]) + "."
        )
    return base


class MetaAgent:
    async def _generate_variation(
        self,
        seed: dict,
        voice_str: str,
        platform: str,
        variation_frame: str,
        hook: str = "",
    ) -> str:
        rules = PLATFORM_RULES.get(platform, "Write native content for this platform.")

        # Template-fill approach: give the model structure to fill, not open-ended request
        user_message = json.dumps({
            "seed": {
                "title": seed.get("title", ""),
                "description": seed.get("description", ""),
                "tags": seed.get("tags", []),
                "story_hook": seed.get("story_hook", ""),
            },
            "platform": platform,
            "platform_rules": rules,
            "voice_profile": voice_str,
            "variation_frame": variation_frame,
            "opening_hook_to_use": hook or "(generate your own from the seed)",
            "banned_phrases": [
                "dive into", "game-changer", "revolutionary", "transformative",
                "exciting", "thrilled to share", "I am pleased", "delighted",
                "leverage", "synergy", "unlock", "seamlessly", "cutting-edge",
                "harness the power", "paradigm shift",
            ],
            "output_instruction": (
                "Return ready-to-post content only. "
                "No labels, no 'Here is your...', no explanations. "
                "Just the content itself, formatted exactly as it would appear posted."
            ),
        })

        try:
            return await call_meta(
                system_prompt=SYSTEM_PROMPT,
                user_message=user_message,
                platform=platform,
            )
        except Exception as e:
            logger.error(f"Meta variation failed [{platform}]: {e}")
            return ""

    async def _generate_for_platform(
        self,
        seed: dict,
        voice_str: str,
        platform: str,
        top_hooks: list = None,
    ) -> tuple[str, list[str]]:
        """
        Two-step generation:
        1. Generate opening hook at temperature 0.9 (high creativity)
        2. Generate 3 variations in parallel using that hook + variation frames
        """
        hook = ""
        try:
            topic = seed.get("story_hook") or seed.get("title", "") or seed.get("description", "")[:80]
            hook = await call_hook_generator(
                topic,
                platform,
                top_hooks or [],
            )
        except Exception as e:
            logger.warning(f"Hook generation failed [{platform}]: {e}")

        tasks = [
            self._generate_variation(seed, voice_str, platform, frame, hook)
            for frame in VARIATION_FRAMES
        ]
        variations = await asyncio.gather(*tasks, return_exceptions=True)
        return platform, [v if isinstance(v, str) else "" for v in variations]

    async def generate_content(
        self,
        seed: dict,
        voice_profile: dict,
        platforms: list,
        top_hooks: list = None,
    ) -> dict:
        """
        Parallel generation: one asyncio.gather() call per platform simultaneously.
        Each platform gets its own separate API call with platform-specific temperature.
        """
        voice_str = _format_voice(voice_profile)
        results = await asyncio.gather(
            *[self._generate_for_platform(seed, voice_str, p, top_hooks) for p in platforms],
            return_exceptions=True,
        )
        return {
            platform: variations
            for item in results
            if not isinstance(item, Exception)
            for platform, variations in [item]
        }

    async def generate_from_idea(self, topic: str, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": topic[:60],
            "description": (
                f"Raw idea from the user: '{topic}'. "
                f"Frame as thought leadership — what does this person specifically know about "
                f"this topic that their audience doesn't? What's the non-obvious angle? "
                f"What would they only know from direct experience?"
            ),
            "tags": [],
            "story_hook": "",
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def generate_from_trend(self, trend: dict, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": f"On: {trend.get('topic', '')}",
            "description": (
                f"Trending topic: '{trend.get('topic', '')}'. "
                f"Keywords in this trend: {', '.join(trend.get('related_keywords', []))}. "
                f"Do NOT write about the trend generically. Find the angle only this person "
                f"can bring from their specific work and experience. What do they know about "
                f"this topic that most people don't? Connect their expertise to the trend."
            ),
            "tags": trend.get("related_keywords", []),
            "story_hook": "",
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def repurpose(self, source_text: str, target_platforms: list, voice_profile: dict) -> dict:
        """
        Transform existing long-form content into platform-native formats.
        Extracts the core insight and rewrites it natively per platform.
        """
        seed = {
            "title": "Repurposed content",
            "description": (
                f"Source content (extract the core insight and rewrite it natively — "
                f"do NOT copy-paste, do NOT summarize, REWRITE as if writing fresh for each platform): "
                f"{source_text[:800]}"
            ),
            "tags": [],
            "story_hook": "",
        }
        return await self.generate_content(seed, voice_profile, target_platforms)

    async def refine(
        self,
        content_text: str,
        instruction: str,
        platform: str,
        voice_profile: dict,
    ) -> str:
        """
        Apply specific user feedback to existing content.
        Preserves voice while applying instruction exactly.
        """
        voice_str = _format_voice(voice_profile)
        rules = PLATFORM_RULES.get(platform, "")

        user_message = json.dumps({
            "platform": platform,
            "platform_rules": rules,
            "voice_profile": voice_str,
            "original_content": content_text,
            "refinement_instruction": instruction,
            "output_instruction": (
                "Return the refined content only. Apply every part of the instruction exactly. "
                "Preserve the person's voice. No labels, no explanations."
            ),
        })

        try:
            return await call_meta(
                system_prompt=(
                    "You are Meta refining content based on explicit user feedback. "
                    "Apply every instruction exactly as stated. Preserve the person's voice. "
                    "Return only the refined content, nothing else."
                ),
                user_message=user_message,
                platform=platform,
            )
        except Exception as e:
            logger.error(f"Meta refine failed: {e}")
            return content_text

    async def process_tuning_sample(self, sample_text: str) -> dict:
        """
        Extract stylistic observations from writing samples for voice profile.
        Uses Claude Haiku at temperature 0.2 for precise stylistic extraction.
        """
        system = (
            "You are a writing style analyst. Extract 5-10 specific, concrete observations "
            "about how this person writes. Be precise: not 'writes professionally' but "
            "'uses em-dashes for asides', 'opens with counterintuitive claims', "
            "'prefers numbered lists over bullets', 'rarely uses adjectives', "
            "'ends paragraphs with questions'. "
            "These observations must be specific enough that another writer could mirror the style. "
            "Return ONLY JSON: "
            '{"observations": [], "tone": "", "formality": "", "humor": "", "preferred_style": ""}'
        )
        user = f"Writing sample:\n\n{sample_text[:8000]}"

        try:
            raw = await call_openrouter(
                system_prompt=system,
                user_message=user,
                model="anthropic/claude-3-haiku",
                temperature=0.2,
                max_tokens=700,
                json_mode=True,
            )
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Tuning sample processing failed: {e}")
            return {"observations": [], "tone": "", "formality": "", "humor": "", "preferred_style": ""}


meta_agent = MetaAgent()
