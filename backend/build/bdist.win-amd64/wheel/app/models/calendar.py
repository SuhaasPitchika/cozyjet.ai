import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin

class CalendarStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    published = "published"

class CalendarEntry(Base, TimestampMixin):
    __tablename__ = "calendar_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="CASCADE"), nullable=True)
    
    platform = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(Enum(CalendarStatus), default=CalendarStatus.draft)
    
    # AI estimate of expected engagement
    engagement_prediction = Column(Integer, nullable=True)
