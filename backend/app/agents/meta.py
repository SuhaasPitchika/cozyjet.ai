"""
Meta — Elite Content Writer
Generates platform-native content in the user's exact voice.
Per-platform temperatures via separate asyncio.gather() calls.
Pre-step: hook generation at temperature 0.9.
Tuning: style observations from voice profile injected into every call.
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

SYSTEM_PROMPT = (
    "You are Meta, an elite content writer who specializes in making technical and creative "
    "work accessible and compelling to broad audiences. You write in this person's exact voice "
    "— their rhythm, their vocabulary, their level of formality, their humor. You never sound "
    "like AI. You never use hollow phrases like 'dive into', 'game-changer', 'revolutionary', "
    "'transformative', or 'exciting'. Your writing is specific, human, and publishable immediately."
)

PLATFORM_RULES: dict[str, str] = {
    "linkedin": (
        "1300-1900 characters. Open with one bold statement or question — never 'I am excited to share'. "
        "1-3 line paragraphs max. End with a genuine question. Max 3 hashtags. No filler."
    ),
    "twitter": (
        "Thread of 6-10 tweets. Tweet 1 = hook (≤240 chars, stops mid-scroll). "
        "Number each tweet (1/n). Each tweet standalone-valuable. Last tweet = CTA or open question."
    ),
    "instagram": (
        "Caption 150-300 chars. First line = hook (no 'I' start). Value in middle. Strong CTA at end. "
        "5-8 hashtags on a new line after two line breaks."
    ),
    "youtube": (
        "Script: HOOK (0-30s), PROBLEM (30-90s), SOLUTION with steps (90s-5min), CTA (last 30s). "
        "Include [B-ROLL] and [CUT TO] markers. Write as spoken word."
    ),
    "reddit": (
        "Long-form authentic post, 300-700 words. Zero marketing language. "
        "Tell a real story or share a hard-won insight. End with a question. Write like a community member."
    ),
}

VARIATION_FRAMES = [
    (
        "Variation 0 — Emotional Storytelling: Open with tension or curiosity. "
        "Build a narrative arc with a moment of realization. End with a question or reflection."
    ),
    (
        "Variation 1 — Direct & Technical: Lead with the core insight immediately. "
        "Write for professional peers. Use specific names, numbers, and decisions made."
    ),
    (
        "Variation 2 — Outcome-Led: Lead with the result. "
        "Structure: problem → what I tried → what happened → lesson. End with a concrete CTA."
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
        return "authentic, direct, human — no corporate language."
    obs = profile.get("style_observations", [])
    base = (
        f"Tone: {profile.get('tone', 'professional')}. "
        f"Formality: {profile.get('formality', 'semi-formal')}. "
        f"Humor: {profile.get('humor', 'witty')}."
    )
    if obs:
        base += " Style notes: " + "; ".join(obs[:4]) + "."
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
        user_message = json.dumps({
            "seed": {
                "title": seed.get("title", ""),
                "description": seed.get("description", ""),
                "tags": seed.get("tags", []),
            },
            "platform": platform,
            "platform_rules": rules,
            "voice_profile": voice_str,
            "variation_frame": variation_frame,
            "hook_to_use": hook,
            "output": "Ready-to-post content only. No labels, no explanations.",
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
        hook = ""
        try:
            hook = await call_hook_generator(
                seed.get("title", seed.get("description", "")[:80]),
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
                f"Raw idea: {topic}. Frame as thought leadership — "
                f"what does this person know about this topic that others don't?"
            ),
            "tags": [],
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def generate_from_trend(self, trend: dict, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": f"On: {trend.get('topic', '')}",
            "description": (
                f"Connect this person's expertise to the trending topic '{trend.get('topic', '')}'. "
                f"Keywords: {', '.join(trend.get('related_keywords', []))}. "
                f"Find the unique angle only this person can bring."
            ),
            "tags": trend.get("related_keywords", []),
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def repurpose(self, source_text: str, target_platforms: list, voice_profile: dict) -> dict:
        seed = {
            "title": "Repurposed content",
            "description": (
                f"Extract the core insight from this content and rewrite it "
                f"natively for each platform. Source: {source_text[:600]}"
            ),
            "tags": [],
        }
        return await self.generate_content(seed, voice_profile, target_platforms)

    async def refine(
        self,
        content_text: str,
        instruction: str,
        platform: str,
        voice_profile: dict,
    ) -> str:
        voice_str = _format_voice(voice_profile)
        rules = PLATFORM_RULES.get(platform, "")

        user_message = json.dumps({
            "platform": platform,
            "platform_rules": rules,
            "voice_profile": voice_str,
            "original_content": content_text,
            "refinement_instruction": instruction,
            "output": "Refined content only. Apply instruction exactly. No labels or explanations.",
        })

        try:
            return await call_meta(
                system_prompt=(
                    "You are Meta refining content based on explicit user feedback. "
                    "Apply every instruction exactly as stated. Preserve the person's voice."
                ),
                user_message=user_message,
                platform=platform,
            )
        except Exception as e:
            logger.error(f"Meta refine failed: {e}")
            return content_text

    async def process_tuning_sample(self, sample_text: str) -> dict:
        """Extract stylistic observations from a writing sample for voice profile updates."""
        system = (
            "You are a writing style analyst. Extract 5-10 specific, concrete observations "
            "about how this person writes. Be precise: not 'writes professionally' but "
            "'uses em-dashes for asides, opens with counterintuitive claims, prefers bullet lists'. "
            "Return ONLY JSON: {\"observations\": [], \"tone\": \"\", \"formality\": \"\", "
            "\"humor\": \"\", \"preferred_style\": \"\"}"
        )
        user = f"Writing sample:\n\n{sample_text[:8000]}"

        try:
            raw = await call_openrouter(
                system_prompt=system,
                user_message=user,
                model="anthropic/claude-3-haiku",
                temperature=0.2,
                max_tokens=600,
                json_mode=True,
            )
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Tuning sample processing failed: {e}")
            return {"observations": [], "tone": "", "formality": "", "humor": "", "preferred_style": ""}


meta_agent = MetaAgent()
