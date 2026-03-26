import uuid
from sqlalchemy import Column, String, Integer, Text, JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin

class ContentTemplate(Base, TimestampMixin):
    __tablename__ = "content_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    template_text = Column(Text, nullable=False)
    
    # {var_name: {"hint": "description", "type": "string"}}
    variables = Column(JSON, default={})
    
    performance_score = Column(Integer, default=0) # Average engagement score
    is_public = Column(Boolean, default=False)
