import enum
import uuid
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class RelationshipStage(str, enum.Enum):
    identified = "identified"
    warming = "warming"
    engaged = "engaged"
    connected = "connected"


class RelationshipTarget(Base, TimestampMixin):
    __tablename__ = "relationship_targets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    target_username = Column(String(255), nullable=False)
    target_platform = Column(String(50), nullable=False)
    target_follower_count = Column(Integer, default=0)

    # 0-100: how well their audience overlaps with user's niche
    alignment_score = Column(Integer, default=0)

    relationship_stage = Column(Enum(RelationshipStage), default=RelationshipStage.identified)
    engagement_count = Column(Integer, default=0)
    last_engaged_at = Column(DateTime, nullable=True)
    notes = Column(Text, default="")
