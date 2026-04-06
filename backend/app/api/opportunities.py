"""
Conversation Opportunities API
─────────────────────────────────────────────────────────────────
GET  /api/opportunities           — List conversation reply opportunities
GET  /api/opportunities/{id}      — Get a single opportunity
PATCH /api/opportunities/{id}    — Update status, relevance, or notes
"""
import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.conversation_opportunity import ConversationOpportunity, OpportunityStatus
from ..models.user import User

logger = logging.getLogger("cozyjet.opportunities")
router = APIRouter()

class OpportunityUpdate(BaseModel):
    status: Optional[OpportunityStatus] = None
    relevance_score: Optional[int] = None
    opportunity_reason: Optional[str] = None


def _serialize(opportunity: ConversationOpportunity) -> dict:
    return {
        "id": str(opportunity.id),
        "platform": opportunity.platform,
        "thread_url": opportunity.thread_url,
        "thread_title": opportunity.thread_title,
        "original_post": opportunity.original_post,
        "drafted_reply": opportunity.drafted_reply,
        "relevance_score": opportunity.relevance_score,
        "opportunity_reason": opportunity.opportunity_reason,
        "status": opportunity.status,
        "created_at": opportunity.created_at.isoformat(),
        "updated_at": opportunity.updated_at.isoformat() if opportunity.updated_at else None,
    }


@router.get("")
async def list_opportunities(
    status: Optional[OpportunityStatus] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ConversationOpportunity).where(ConversationOpportunity.user_id == user.id)
    if status:
        stmt = stmt.where(ConversationOpportunity.status == status)

    result = await db.execute(stmt)
    opportunities = result.scalars().all()
    return {"opportunities": [_serialize(o) for o in opportunities]}


@router.get("/{opportunity_id}")
async def get_opportunity(
    opportunity_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ConversationOpportunity).where(
        ConversationOpportunity.id == opportunity_id,
        ConversationOpportunity.user_id == user.id,
    )
    result = await db.execute(stmt)
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _serialize(opportunity)


@router.patch("/{opportunity_id}")
async def update_opportunity(
    opportunity_id: UUID,
    payload: OpportunityUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ConversationOpportunity).where(
        ConversationOpportunity.id == opportunity_id,
        ConversationOpportunity.user_id == user.id,
    )
    result = await db.execute(stmt)
    opportunity = result.scalar_one_or_none()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if payload.status is not None:
        opportunity.status = payload.status
    if payload.relevance_score is not None:
        opportunity.relevance_score = payload.relevance_score
    if payload.opportunity_reason is not None:
        opportunity.opportunity_reason = payload.opportunity_reason

    db.add(opportunity)
    await db.commit()
    await db.refresh(opportunity)
    return _serialize(opportunity)
