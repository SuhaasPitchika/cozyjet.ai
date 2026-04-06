import enum
import uuid
from sqlalchemy import Column, String, Boolean, Enum, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin

class SubscriptionTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    studio = "studio"
    agency = "agency"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.free)
    subscription_expires_at = Column(DateTime, nullable=True)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    
    # voice_profile: e.g. {tone, style, emoji_usage, formality, humor, preferred_platforms}
    voice_profile = Column(JSON, default={
        "tone": "professional",
        "style": "storytelling",
        "emoji_usage": "moderate",
        "formality": "semi-formal",
        "humor": "witty",
        "preferred_platforms": ["twitter", "linkedin"]
    })

    # growth_profile: extracted from onboarding conversation by the AI
    # {niche, sub_niche, goal, goal_timeline, current_state, fear, tone,
    #  content_style, admired_creators, time_available_minutes,
    #  comfort_zone, positioning_opportunity, psychological_profile}
    growth_profile = Column(JSON, default={})

    onboarding_complete = Column(Boolean, default=False)
    timezone = Column(String(100), default="UTC")
