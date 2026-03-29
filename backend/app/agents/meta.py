import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..config import settings


PLATFORM_CONSTRAINTS = {
    "linkedin": "1300-1900 characters. Professional tone. Paragraphs with line breaks. End with a question or call to action.",
    "twitter": "A thread of 6-12 tweets. First tweet is the hook (<280 chars). Each subsequent tweet numbered. Last tweet CTA.",
    "instagram": "150-300 characters for caption. Conversational. End with 5-10 relevant hashtags.",
    "youtube": "Video script: Hook (0-30s), Problem (30-90s), Solution with steps (90s-5min), CTA (last 30s). Include [B-ROLL] and [CUT TO] markers.",
    "reddit": "Long-form authentic post. No marketing language. Tell a story or share a learning. 300-800 words.",
}

GENERATION_SYSTEM = """You are Meta, the elite marketing copywriter for CozyJet AI.

Your job: given a content seed and user voice profile, generate 3 platform-specific variations.

Variation 0 — Emotional Storytelling: hook, narrative arc, reflection or question at the end.
Variation 1 — Direct & Technical: written for professional peers, specifics without narrative wrapper.
Variation 2 — Outcome-Led: lead with results, structured (problem → solution → metric → CTA).

Platform constraints:
{platform_constraints}

Voice profile guidance: match {voice_profile}

Return ONLY a valid JSON object:
{{
  "<platform>": ["variation_0_text", "variation_1_text", "variation_2_text"],
  ...
}}

No markdown. No extra keys. Only the JSON."""

REFINE_SYSTEM = """You are Meta, refining content based on user feedback.
Apply the instruction precisely. Preserve platform formatting constraints.
Return ONLY the refined content text — no JSON, no explanation."""


class MetaAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.75,
            max_tokens=2000,
        )

    def _build_constraints(self, platforms: list) -> str:
        lines = []
        for p in platforms:
            constraint = PLATFORM_CONSTRAINTS.get(p, "No specific constraint.")
            lines.append(f"- {p}: {constraint}")
        return "\n".join(lines)

    async def generate_content(self, seed: dict, voice_profile: dict, platforms: list) -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", GENERATION_SYSTEM),
            ("user", "Content seed:\n{seed}\n\nGenerate for platforms: {platforms}"),
        ])
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "platform_constraints": self._build_constraints(platforms),
            "voice_profile": json.dumps(voice_profile),
            "seed": json.dumps(seed),
            "platforms": ", ".join(platforms),
        })
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback: return empty variations
            return {p: ["", "", ""] for p in platforms}

    async def generate_from_idea(self, topic: str, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": topic,
            "description": f"Raw idea: {topic}. Frame this as thought leadership content.",
            "tags": [],
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def generate_from_trend(self, trend: dict, voice_profile: dict, platforms: list) -> dict:
        seed = {
            "title": f"Trending: {trend.get('topic', '')}",
            "description": f"Connect your expertise to the trending topic: {trend.get('topic', '')}. Keywords: {', '.join(trend.get('related_keywords', []))}.",
            "tags": trend.get("related_keywords", []),
        }
        return await self.generate_content(seed, voice_profile, platforms)

    async def repurpose(self, source_text: str, target_platforms: list, voice_profile: dict) -> dict:
        seed = {
            "title": "Repurposed content",
            "description": f"Transform the following long-form content into native social posts: {source_text[:500]}",
            "tags": [],
        }
        return await self.generate_content(seed, voice_profile, target_platforms)

    async def refine(self, content_text: str, instruction: str, platform: str, voice_profile: dict) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", REFINE_SYSTEM),
            ("user", "Platform: {platform}\nVoice profile: {voice}\nOriginal content:\n{content}\n\nRefinement instruction: {instruction}"),
        ])
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "platform": platform,
            "voice": json.dumps(voice_profile),
            "content": content_text,
            "instruction": instruction,
        })
        return response.content.strip()


meta_agent = MetaAgent()
