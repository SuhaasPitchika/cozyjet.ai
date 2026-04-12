import uuid
from sqlalchemy import Column, Boolean, Text, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class Experiment(Base, TimestampMixin):
    __tablename__ = "experiments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    hypothesis = Column(Text, nullable=False)
    content_variable = Column(String(255), nullable=False)

    control_content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="SET NULL"), nullable=True)
    test_content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="SET NULL"), nullable=True)

    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=True)

    result = Column(Text, nullable=True)
    learning = Column(Text, nullable=True)

    # Whether this experiment's learning has been incorporated into the voice profile
    applied_to_profile = Column(Boolean, default=False)
