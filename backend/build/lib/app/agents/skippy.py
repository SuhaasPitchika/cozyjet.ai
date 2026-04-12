"""
Skippy — Work Intelligence Agent
Temperature: 0.3 (factual accuracy — reads real activity data)
Model: Claude Sonnet via OpenRouter (quality narrative extraction)

System prompt: under 200 words, first-person identity only.
User message: structured JSON template the model fills in.
"""
import json
import logging
from ..services.model_router import call_skippy as _call_skippy, call_openrouter, call_intent_classifier

logger = logging.getLogger("cozyjet.skippy")

# Under 200 words. First person. Who I am, what I care about, how I think.
SYSTEM_PROMPT = (
    "You are Skippy, a work intelligence agent. You read raw activity data from developer "
    "and creator tools and find the professional story worth telling. You think like a "
    "journalist who covers technology — you look for what is genuinely interesting, novel, "
    "or useful to an audience of builders and creators. You write with economy. Every word "
    "earns its place. You never pad, never generalize, never produce boilerplate. "
    "You understand that a commit message saying 'fix auth redirect bug' might actually be "
    "the end of a three-week struggle to get token refresh right — and THAT is the story. "
    "You connect dots. You find the narrative hiding in the data."
)

OUTPUT_TEMPLATE = {
    "title": "",
    "description": "",
    "tags": [],
    "target_audience": "",
    "content_angles": [],
    "story_hook": "",
}


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


class SkippyAgent:
    async def process_activity(
        self,
        raw_activity: str,
        platform: str = "manual",
        user_context: str = "",
        recent_titles: list = None,
    ) -> dict:
        """
        Convert raw platform activity into a structured content seed.

        user_context: Two sentences max about who this person is and what they're focused on.
        recent_titles: Last 5 seed titles to avoid repetition.
        """
        # Build the structured user message — template-fill pattern reduces generic output
        message = json.dumps({
            "activity": raw_activity,
            "platform": platform,
            "user_context": (
                user_context.strip()
                if user_context
                else "A developer and creator focused on building in public. Currently shipping and sharing their work."
            ),
            "recent_seeds_to_avoid": (recent_titles or [])[:5],
            "instructions": (
                "Find the genuinely interesting story in this activity. "
                "What would a technical journalist find worth writing about here? "
                "Be specific — name the actual thing, the actual problem, the actual win. "
                "The title must be under 60 characters. "
                "The description must be 2-3 sentences: what happened, why it matters, what was hard or surprising. "
                "content_angles: 3 distinct narrative angles this could become a post from. "
                "story_hook: one sentence that would make someone stop scrolling."
            ),
            "output": OUTPUT_TEMPLATE,
        })

        try:
            raw = await _call_skippy(message, SYSTEM_PROMPT)
            result = json.loads(_strip_fences(raw))
            # Ensure required fields exist
            return {
                "title": result.get("title", raw_activity[:60]),
                "description": result.get("description", raw_activity[:250]),
                "tags": result.get("tags", [platform]),
                "target_audience": result.get("target_audience", "developers and creators"),
                "content_angles": result.get("content_angles", []),
                "story_hook": result.get("story_hook", ""),
            }
        except Exception as e:
            logger.error(f"Skippy seed generation failed: {e}")
            return {
                "title": raw_activity[:60],
                "description": raw_activity[:250],
                "tags": [platform],
                "target_audience": "developers and creators",
                "content_angles": ["storytelling", "technical detail", "outcome"],
                "story_hook": "",
            }

    async def analyze_narrative_arc(
        self,
        activities: list[str],
        user_context: str = "",
    ) -> dict:
        """
        Given a list of recent activities, identify the bigger story arc.
        Used for the daily sync when Skippy connects dots across weeks.
        """
        if not activities:
            return {}

        combined = "\n".join([f"- {a}" for a in activities[:20]])
        message = json.dumps({
            "recent_activities": combined,
            "user_context": user_context or "A developer building in public.",
            "task": (
                "These activities may form a larger narrative arc. "
                "Is there a bigger story here — a project reaching completion, "
                "a skill being built, a problem being solved over time? "
                "If yes, describe the arc and suggest a content angle. If no arc exists, say so."
            ),
            "output": {
                "has_arc": False,
                "arc_title": "",
                "arc_description": "",
                "suggested_angle": "",
            },
        })

        try:
            raw = await _call_skippy(message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Narrative arc analysis failed: {e}")
            return {"has_arc": False, "arc_title": "", "arc_description": "", "suggested_angle": ""}

    async def enhance_work_description(self, raw_input: str, user_context: str = "") -> str:
        result = await self.process_activity(raw_input, user_context=user_context)
        return result.get("description", raw_input)

    async def analyze_screenshot(self, base64_image: str) -> dict:
        from ..services.model_router import _openrouter_client

        client = _openrouter_client()

        try:
            resp = await client.chat.completions.create(
                model="anthropic/claude-3-haiku",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    f"{SYSTEM_PROMPT}\n\n"
                                    f"Analyze this screenshot. Find the professional story in it. "
                                    f"Return ONLY this JSON:\n{json.dumps(OUTPUT_TEMPLATE)}"
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                            },
                        ],
                    }
                ],
                temperature=0.3,
                max_tokens=700,
            )
            raw = resp.choices[0].message.content.strip()
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Screenshot analysis failed: {e}")
            return {
                "title": "Screenshot Analysis",
                "description": "Visual work captured from screenshot.",
                "tags": ["screenshot"],
                "target_audience": "developers and creators",
                "content_angles": ["visual insight", "process detail", "outcome"],
                "story_hook": "",
            }

    async def detect_calendar_intent(self, message: str) -> dict:
        try:
            raw = await call_intent_classifier(message)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Intent detection failed: {e}")
            return {"intent": False, "event": {}}


skippy_agent = SkippyAgent()
