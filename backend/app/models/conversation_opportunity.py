import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class OpportunityStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    posted = "posted"
    skipped = "skipped"


class ConversationOpportunity(Base):
    __tablename__ = "conversation_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    platform: Mapped[str] = mapped_column(String(50), default="twitter")
    thread_url: Mapped[str] = mapped_column(String, default="")
    thread_title: Mapped[str] = mapped_column(Text, default="")
    drafted_reply: Mapped[str] = mapped_column(Text, default="")
    relevance_score: Mapped[int] = mapped_column(Integer, default=50)
    opportunity_reason: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[OpportunityStatus] = mapped_column(
        SAEnum(OpportunityStatus), default=OpportunityStatus.pending
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
