import uuid
from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base, TimestampMixin

class Trend(Base, TimestampMixin):
    __tablename__ = "trends"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    trend_score = Column(Integer, default=0) # 0-100
    
    related_keywords = Column(ARRAY(String), default=list)
    
    detected_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    __table_args__ = (
        Index("idx_trend_platform_score", "platform", trend_score.desc()),
    )
