from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    display_name: Optional[str] = None
    subscription_tier: str
    voice_profile: dict
    
    class Config:
        from_attributes = True
