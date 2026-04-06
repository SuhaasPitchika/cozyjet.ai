import enum
import uuid
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class OpportunityStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    posted = "posted"
    skipped = "skipped"


class ConversationOpportunity(Base, TimestampMixin):
    __tablename__ = "conversation_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    platform = Column(String(50), nullable=False)
    thread_url = Column(String(500), nullable=False)
    thread_title = Column(Text, nullable=False)
    original_post = Column(Text, nullable=False)
    drafted_reply = Column(Text, nullable=False)

    # 0-100: how relevant and valuable is this opportunity for this creator
    relevance_score = Column(Integer, default=0)
    opportunity_reason = Column(Text, default="")

    status = Column(Enum(OpportunityStatus), default=OpportunityStatus.pending)
