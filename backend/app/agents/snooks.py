import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..config import settings


SYSTEM_PROMPT = """You are Snooks, the content strategist for CozyJet AI.
You think about the bigger picture of a creator's content presence.

Given the user's recent content seeds, analytics, and trending topics, generate exactly 5 weekly content recommendations.

Return ONLY a valid JSON object with this structure:
{
  "suggestions": [
    {
      "title": "string — compelling post title",
      "angle": "string — strategic angle (e.g. 'thought leadership', 'tutorial', 'behind the scenes')",
      "platform": "string — primary platform (linkedin|twitter|instagram|youtube|reddit)",
      "best_day": "string — e.g. Tuesday",
      "best_time": "string — e.g. 9:00 AM",
      "reasoning": "string — why this content, why now, why this platform"
    }
  ]
}

No markdown. No extra text. Return only the JSON."""


class SnooksAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7,
        )

    async def suggest_content(self, seeds_summary: str, trends_summary: str, analytics_summary: str = "") -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", "Recent content seeds (last 14 days):\n{seeds}\n\nRecent analytics (last 30 days):\n{analytics}\n\nTop trending topics:\n{trends}"),
        ])
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "seeds": seeds_summary or "No seeds yet.",
            "analytics": analytics_summary or "No analytics data yet.",
            "trends": trends_summary or "No trending topics available.",
        })
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"suggestions": []}

    async def analyze_calendar_gaps(self, scheduled_content: list) -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Snooks. Analyze the user's scheduled content calendar for gaps and imbalances. Return JSON: {\"gaps\": [{\"week\": \"YYYY-WW\", \"issue\": \"...\", \"recommendation\": \"...\"}]}"),
            ("user", "Scheduled content:\n{calendar}"),
        ])
        chain = prompt | self.llm
        response = await chain.ainvoke({"calendar": json.dumps(scheduled_content)})
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"gaps": []}


snooks_agent = SnooksAgent()
