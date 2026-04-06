import uuid
from sqlalchemy import Column, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class OnboardingSession(Base, TimestampMixin):
    __tablename__ = "onboarding_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # JSON array of {"role": "user"|"assistant", "content": "..."} objects
    messages = Column(JSON, default=[])
    is_complete = Column(Boolean, default=False)
