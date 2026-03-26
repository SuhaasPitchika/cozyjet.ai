from langchain_openai import ChatOpenAI # Using ChatOpenAI for OpenRouter
from langchain.prompts import ChatPromptTemplate
from langchain.schema import SystemMessage, HumanMessage
from ..config import settings
import json

class SkippyAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="anthropic/claude-3.5-sonnet",
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            temperature=0.7,
            default_headers={
                "HTTP-Referer": settings.FRONTEND_URL,
                "X-Title": "CozyJet AI"
            }
        )

    async def summarize_activity(self, activity_data: dict) -> dict:
        """
        Takes raw activity data (e.g. GitHub commit, Notion page edit) 
        and generates a content seed: title, description, and strategic context.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are Skippy, an expert content researcher. Your job is to transform raw "
                "technical work data into a 'Content Seed' for a solo creator. "
                "The seed should capture: "
                "1. What work was done (the title and raw description). "
                "2. Why it matters to their audience. "
                "3. What strategic angle would resonate (e.g. technical depth, problem solving, results). "
                "Output as a JSON object with 'title', 'description', and 'tags'."
            )),
            ("human", "Analyze this activity: {activity}")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({"activity": json.dumps(activity_data)})
        
        try:
            # Basic parsing, Claude often doesn't need much help but a check is good
            res_text = response.content
            if "```json" in res_text:
                res_text = res_text.split("```json")[1].split("```")[0].strip()
            return json.loads(res_text)
        except:
            return {
                "title": activity_data.get("title", "New Activity Detected"),
                "description": activity_data.get("description", "A new activity has been recorded from your connected tools."),
                "tags": ["automated"]
            }

    async def analyze_voice(self, transcribed_text: str) -> dict:
        """For manual voice or text input enhancement."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Transform this rough insight into a high-quality content seed. Identify the core problem, the solution, and the 'Aha!' moment."),
            ("human", "{text}")
        ])
        chain = prompt | self.llm
        resp = await chain.ainvoke({"text": transcribed_text})
        return {"title": "Enhanced Insight", "description": resp.content, "tags": ["voice"]}
