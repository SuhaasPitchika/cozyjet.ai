import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class ChatMode(str, enum.Enum):
    refine = "refine"
    meta = "meta"
    support = "support"


class ChatSession(Base, TimestampMixin):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mode = Column(Enum(ChatMode), nullable=False)

    # List of {"role": "user"|"assistant", "content": "..."}
    messages = Column(JSON, default=[])

    # For refine sessions — the content being refined
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="SET NULL"), nullable=True)
