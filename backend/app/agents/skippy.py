from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from ..config import settings

class SkippyAgent:
    def __init__(self):
        # OpenRouter/Gemini configuration
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )

    async def enhance_work_description(self, raw_input: str, user_context: str = "") -> str:
        system_prompt = """You are Skippy, the Content Brain for CozyJet Studio. 
        Your job is to transform raw descriptions of work into detailed content seeds for marketing.
        Fill in technical details, identify the problem solved, and estimate the accomplishment's significance.
        Target audience: fellow developers, founders, and creators.
        """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "Workspace Context: {context}\nRaw Description: {desc}")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({"context": user_context, "desc": raw_input})
        return response.content

skippy_agent = SkippyAgent()
