import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin

class PostAnalytics(Base, TimestampMixin):
    __tablename__ = "post_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="CASCADE"), nullable=False)
    
    platform = Column(String, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    
    # Calculated as (likes + comments + shares) / views * 100
    engagement_rate = Column(Float, default=0.0)
    
    fetched_at = Column(DateTime, nullable=False)
