import enum
import uuid
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class ArcStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"


class NarrativeArc(Base, TimestampMixin):
    __tablename__ = "narrative_arcs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    arc_title = Column(String(255), nullable=False)
    arc_description = Column(Text, nullable=False)
    project_context = Column(Text, default="")

    total_stages = Column(Integer, default=5)
    current_stage = Column(Integer, default=1)

    status = Column(Enum(ArcStatus), default=ArcStatus.active)
    started_at = Column(DateTime, nullable=False)
    estimated_end = Column(DateTime, nullable=False)
