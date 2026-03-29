import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..config import settings


SYSTEM_PROMPT = """You are Skippy, a work analyst for CozyJet AI.
Your job is to read raw activity data from developer and creator tools and turn it into a structured content seed.

Given raw platform activity, return a JSON object with these exact keys:
- "title": a concise work title under 60 characters
- "description": 2-3 sentences explaining what was done, why it matters professionally, and who on social media would find it interesting
- "tags": array of 3-5 relevant topic tags (e.g. ["typescript", "authentication", "saas"])
- "target_audience": one sentence describing who would find this valuable
- "content_angles": array of 3 brief angle descriptions — storytelling hook, technical detail, outcome/result

Return ONLY valid JSON. No markdown. No extra text."""


class SkippyAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.6,
        )

    async def process_activity(self, raw_activity: str, platform: str = "manual") -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", "Platform: {platform}\n\nRaw activity data:\n{activity}"),
        ])
        chain = prompt | self.llm
        response = await chain.ainvoke({"platform": platform, "activity": raw_activity})
        content = response.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "title": f"Work via {platform}",
                "description": raw_activity[:300],
                "tags": [platform],
                "target_audience": "developers and creators",
                "content_angles": ["storytelling", "technical detail", "outcome"],
            }

    async def enhance_work_description(self, raw_input: str, user_context: str = "") -> str:
        combined = f"Context: {user_context}\n\nDescription: {raw_input}" if user_context else raw_input
        result = await self.process_activity(combined, platform="manual")
        return result.get("description", raw_input)

    async def analyze_screenshot(self, base64_image: str) -> dict:
        llm_vision = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.5,
        )
        from langchain.schema import HumanMessage
        message = HumanMessage(content=[
            {
                "type": "text",
                "text": f"{SYSTEM_PROMPT}\n\nAnalyze this screenshot and produce the content seed JSON.",
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64_image}"},
            },
        ])
        response = await llm_vision.ainvoke([message])
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "title": "Screenshot Analysis",
                "description": content[:300],
                "tags": ["screenshot"],
                "target_audience": "developers and creators",
                "content_angles": ["visual insight", "process detail", "outcome"],
            }


skippy_agent = SkippyAgent()
