from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from ..config import settings
import json

class MetaAgent:
    def __init__(self, user_id: str):
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
        # self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    async def generate_variations(self, seed: dict, voice_profile: dict, platforms: list) -> dict:
        """
        Generates 3 variations per platform:
        1. Emotional storytelling with a hook.
        2. Direct and technical peer-to-peer.
        3. Measurable outcomes and results.
        """
        system_prompt = (
            "You are Meta, a premium AI content factory for solo creators. "
            "Your tone: {voice_tone}, your style: {voice_style}, your formality: {voice_formality}. "
            "Use emojis at a {emoji_usage} level. "
            "Your audience expects {technical_depth} depth. "
            
            "Produce 3 distinct variations per requested platform. "
            "Variation 0: EMOTIONAL STORYTELLING (Hook -> Narrative -> CTA). "
            "Variation 1: DEEPLY TECHNICAL (Peer-to-peer focus, direct insight). "
            "Variation 2: OUTCOMES & RESULTS (Metric-first, tangible value). "
            
            "Platform Constraints: "
            "LinkedIn: 1200-1800 chars, readable line breaks, 3-5 hashtags. "
            "Twitter: Thread format (first tweet as hook). "
            "Instagram: Captions with line breaks and hashtags. "
            "Reddit: Community-first, detailed but value-led."
            
            "Output JSON object: {{platform_name: [list of 3 variations indexed 0 to 2]}}."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Generate content for {platforms} based on this work seed: {seed}")
        ])
        
        chain = prompt | self.llm
        
        # Prepare context from voice_profile
        voice_ctx = {
            "voice_tone": voice_profile.get("tone", "honest"),
            "voice_style": voice_profile.get("style", "direct"),
            "voice_formality": voice_profile.get("formality", "semi-formal"),
            "emoji_usage": voice_profile.get("emoji_usage", "moderate"),
            "technical_depth": voice_profile.get("technical_depth", "expert-level"),
            "seed": json.dumps(seed),
            "platforms": ", ".join(platforms)
        }
        
        response = await chain.ainvoke(voice_ctx)
        
        try:
            res_text = response.content
            if "```json" in res_text:
                res_text = res_text.split("```json")[1].split("```")[0].strip()
            return json.loads(res_text)
        except:
            return {"error": "Failed to parse variations JSON", "raw": response.content}

    async def refine_content(self, original_text: str, feedback: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Refine the provided content based on the user's feedback. Keep their voice profile in mind."),
            ("human", "Original: {text}\nFeedback: {feedback}")
        ])
        chain = prompt | self.llm
        resp = await chain.ainvoke({"text": original_text, "feedback": feedback})
        return resp.content
