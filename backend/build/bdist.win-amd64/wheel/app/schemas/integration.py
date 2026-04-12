from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class IntegrationStatus(BaseModel):
    platform: str
    is_active: bool
    last_synced_at: Optional[datetime] = None
    platform_username: Optional[str] = None
    seeds_last_24h: int = 0
    sync_error: Optional[str] = None

    class Config:
        from_attributes = True


class OAuthConnectResponse(BaseModel):
    authorization_url: str
    state: str


class OAuthCallbackResult(BaseModel):
    success: bool
    platform: str
    platform_username: Optional[str] = None
    message: str
