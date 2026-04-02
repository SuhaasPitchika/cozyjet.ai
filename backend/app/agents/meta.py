"""
Meta — Elite Content Writer
Generates platform-native content in the user's exact voice.
Uses per-platform temperatures and parallel asyncio calls for all platforms.
"""
import json
import asyncio
from ..services.model_router import (
    call_meta_parallel,
    call_openrouter,
    generate_hook,
    PLATFORM_TEMPERATURES,
    PLATFORM_MAX_TOKENS,
)

SYSTEM_PROMPT = (
    "You are Meta, an elite content writer who specializes in making technical and creative "
    "work accessible and compelling to broad audiences. You write in this person's exact voice "
    "— their rhythm, their vocabulary, their level of formality, their humor. You never sound "
    "like AI. You never use hollow phrases like 'dive into', 'game-changer', 'revolutionary', "
    "'transformative', or 'exciting'. Your writing is specific, human, and publishable immediately."
)

PLATFORM_CONSTRAINTS = {
    "linkedin": (
        "1300-1900 characters. Open with one bold statement or question — no 'I am excited to share'. "
        "Paragraphs of 1-3 lines maximum. End with a genuine question that invites discussion. "
        "Max 3 hashtags, only if they add discoverability. No filler. Every line earns its place."
    ),
    "twitter": (
        "Thread of 6-10 tweets. Tweet 1 is the hook — under 240 chars, must stop mid-scroll. "
        "Number each tweet (1/n). Each tweet standalone-valuable. Last tweet is a CTA or open question. "
        "Punchy. No corporate language. Write how real builders tweet."
    ),
    "instagram": (
        "Caption 150-300 chars. First line is the hook — no 'I' start. "
        "Value in the middle. Strong CTA at end. 5-8 strategic hashtags on a new line after a break."
    ),
    "youtube": (
        "Video script with HOOK (0-30s, grabs attention), PROBLEM (30-90s), "
        "SOLUTION with numbered steps (90s-5min), CTA (last 30s). "
        "Include [B-ROLL] and [CUT TO] markers. Write as spoken word, not prose."
    ),
    "reddit": (
        "Long-form authentic post, 300-700 words. Zero marketing language. "
        "Tell a story or share a hard-won learning. Use paragraphs. "
        "End with a genuine question to start discussion. Write like a real community member."
    ),
}

VARIATION_FRAMES = [
    (
        "Emotional Storytelling: Open with a hook that creates tension or curiosity. "
        "Build a narrative arc with a moment of realization. End with a question or reflection."
    ),
    (
        "Direct & Technical: Skip the narrative. Lead with the core insight. "
        "Write for professional peers. Be specific — names, numbers, decisions made."
    ),
    (
        "Outcome-Led: Lead with the result. Structure as: problem → what I tried → what happened → lesson. "
        "End with a concrete CTA or recommendation."
    ),
]


def _strip_fences(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return content.strip()


def _format_voice(profile: dict) -> str:
    if not profile:
        return "authentic, direct, human"
    observations = profile.get("style_observations", [])
    base = (
        f"tone={profile.get('tone', 'professional')}, "
        f"formality={profile.get('formality', 'semi-formal')}, "
        f"humor={profile.get('humor', 'witty')}"
    )
    if observations:
        base += ". Style notes: " + "; ".join(observations[:3])
    return base


class MetaAgent:
    async def _generate_single_platform(
        self,
        seed: dict,
        voice_str: str,
        platform: str,
        variation_frame: str,
        top_hooks: list = None,
    ) -> str:
        constraints = PLATFORM_CONSTRAINTS.get(platform, "Write native content for this platform.")

        hook = ""
        if top_hooks is not None:
            try:
                hook = await generate_hook(seed.get("title", ""), platform, top_hooks)
            except Exception:
                pass

        prompt = (
            f"Content seed:\n"
            f"Title: {seed.get('title', '')}\n"
            f"Description: {seed.get('description', '')}\n"
            f"Tags: {', '.join(seed.get('tags', []))}\n\n"
            f"Platform: {platform}\n"
            f"Platform rules: {constraints}\n\n"
            f"Voice profile: {voice_str}\n\n"
            f"Frame: {variation_frame}\n\n"
            + (f"Opening hook to use or build from: {hook}\n\n" if hook else "")
            + "Write the complete, ready-to-post content. No explanations, no labels, just the content."
        )

        return await call_openrouter(
            system_prompt=SYSTEM_PROMPT,
            user_message=prompt,
            temperature=PLATFORM_TEMPERATURES.get(platform, 0.8),
            max_tokens=PLATFORM_MAX_TOKENS.get(platform, 500),
        )

    async def generate_content(
        self,
        seed: dict,
        voice_profile: dict,
        platforms: list,
        top_hooks: list = None,
    ) -> dict:
        voice_str = _format_voice(voice_profile)

        async def gen_platform(platform: str) -> tuple[str, list[str]]:
            tasks = [
                self._generate_single_platform(seed, voice_str, platform, frame, top_hooks)
                for frame in VARIATION_FRAMES
            ]
            variations = await asyncio.gather(*tasks, return_exceptions=True)
            return platform, [v if isinstance(v, str) else "" for v in variations]

        results = await asyncio.gather(*[gen_platform(p) for p in platforms])
        return dict(results)

    async def generate_from_idea(self, topic: str, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": topic,
            "description": f"Raw idea: {topic}. Frame as thought leadership — what does this person know about this topic that others don't?",
            "tags": [],
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def generate_from_trend(self, trend: dict, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": f"On: {trend.get('topic', '')}",
            "description": (
                f"Connect this person's expertise to the trending topic '{trend.get('topic', '')}'. "
                f"Relevant keywords: {', '.join(trend.get('related_keywords', []))}. "
                f"Find the unique angle only this person can bring."
            ),
            "tags": trend.get("related_keywords", []),
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def repurpose(self, source_text: str, target_platforms: list, voice_profile: dict) -> dict:
        seed = {
            "title": "Repurposed content",
            "description": (
                f"Transform this long-form content into native posts. "
                f"Extract the core insight and rewrite for each platform. "
                f"Source: {source_text[:600]}"
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
        constraints = PLATFORM_CONSTRAINTS.get(platform, "")

        prompt = (
            f"Platform: {platform}\n"
            f"Platform rules: {constraints}\n"
            f"Voice profile: {voice_str}\n\n"
            f"Original content:\n{content_text}\n\n"
            f"Refinement instruction: {instruction}\n\n"
            f"Apply the instruction precisely. Preserve platform formatting. "
            f"Return ONLY the refined content — no labels, no explanation."
        )

        return await call_openrouter(
            system_prompt=(
                "You are Meta, refining content based on explicit user feedback. "
                "Apply every instruction exactly as stated. Do not add anything not asked for. "
                "Preserve the person's voice."
            ),
            user_message=prompt,
            temperature=PLATFORM_TEMPERATURES.get(platform, 0.75),
            max_tokens=PLATFORM_MAX_TOKENS.get(platform, 500),
        )


meta_agent = MetaAgent()
