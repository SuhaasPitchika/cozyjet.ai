"""
Relationships API
─────────────────────────────────────────────────────────────────
GET  /api/relationships             — List relationship pipeline
POST /api/relationships             — Add a new relationship target
GET  /api/relationships/{id}        — Get a single target with sequence
PATCH /api/relationships/{id}       — Update stage, notes, engagement count
DELETE /api/relationships/{id}      — Remove a target
POST /api/relationships/{id}/sequence — Generate Snooks 3-week sequence
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
from ..models.user import User
from ..models.relationship import RelationshipTarget, RelationshipStage

logger = logging.getLogger("cozyjet.relationships")

router = APIRouter()


class RelationshipCreate(BaseModel):
    target_username: str
    target_platform: str
    target_follower_count: int = 0
    alignment_score: int = 50
    notes: str = ""


class RelationshipUpdate(BaseModel):
    relationship_stage: Optional[RelationshipStage] = None
    engagement_count: Optional[int] = None
    notes: Optional[str] = None
    alignment_score: Optional[int] = None


def _serialize(target: RelationshipTarget) -> dict:
    return {
        "id": str(target.id),
        "user_id": str(target.user_id),
        "target_username": target.target_username,
        "target_platform": target.target_platform,
        "target_follower_count": target.target_follower_count,
        "alignment_score": target.alignment_score,
        "relationship_stage": target.relationship_stage,
        "engagement_count": target.engagement_count,
        "last_engaged_at": target.last_engaged_at.isoformat() if target.last_engaged_at else None,
        "notes": target.notes,
        "created_at": target.created_at.isoformat(),
    }


@router.get("")
async def list_relationships(
    stage: Optional[RelationshipStage] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all relationship targets, optionally filtered by stage."""
    query = select(RelationshipTarget).where(RelationshipTarget.user_id == user.id)
    if stage:
        query = query.where(RelationshipTarget.relationship_stage == stage)
    query = query.order_by(RelationshipTarget.alignment_score.desc())

    result = await db.execute(query)
    targets = result.scalars().all()
    return {"relationships": [_serialize(t) for t in targets]}


@router.post("")
async def add_relationship(
    body: RelationshipCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new relationship target to the pipeline."""
    target = RelationshipTarget(
        user_id=user.id,
        target_username=body.target_username,
        target_platform=body.target_platform,
        target_follower_count=body.target_follower_count,
        alignment_score=body.alignment_score,
        notes=body.notes,
    )
    db.add(target)
    await db.commit()
    await db.refresh(target)
    return _serialize(target)


@router.get("/{target_id}")
async def get_relationship(
    target_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single relationship target."""
    result = await db.execute(
        select(RelationshipTarget).where(
            RelationshipTarget.id == target_id,
            RelationshipTarget.user_id == user.id,
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Relationship target not found")
    return _serialize(target)


@router.patch("/{target_id}")
async def update_relationship(
    target_id: UUID,
    body: RelationshipUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update relationship stage, engagement count, or notes."""
    result = await db.execute(
        select(RelationshipTarget).where(
            RelationshipTarget.id == target_id,
            RelationshipTarget.user_id == user.id,
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Relationship target not found")

    if body.relationship_stage is not None:
        target.relationship_stage = body.relationship_stage
    if body.engagement_count is not None:
        target.engagement_count = body.engagement_count
    if body.notes is not None:
        target.notes = body.notes
    if body.alignment_score is not None:
        target.alignment_score = body.alignment_score

    db.add(target)
    await db.commit()
    await db.refresh(target)
    return _serialize(target)


@router.delete("/{target_id}")
async def delete_relationship(
    target_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a relationship target from the pipeline."""
    result = await db.execute(
        select(RelationshipTarget).where(
            RelationshipTarget.id == target_id,
            RelationshipTarget.user_id == user.id,
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Relationship target not found")

    await db.delete(target)
    await db.commit()
    return {"message": "Relationship target removed"}


@router.post("/{target_id}/sequence")
async def generate_sequence(
    target_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a Snooks 3-week relationship building sequence for this target.
    Returns week-by-week actions, natural collaboration angle, and things to avoid.
    """
    result = await db.execute(
        select(RelationshipTarget).where(
            RelationshipTarget.id == target_id,
            RelationshipTarget.user_id == user.id,
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Relationship target not found")

    growth_profile = user.growth_profile or {}
    if not growth_profile:
        raise HTTPException(
            status_code=400,
            detail="Complete onboarding first so Snooks can personalize the sequence"
        )

    from ..agents.snooks import snooks_agent

    target_dict = {
        "username": target.target_username,
        "platform": target.target_platform,
        "follower_count": target.target_follower_count,
        "alignment_score": target.alignment_score,
        "current_stage": target.relationship_stage,
        "notes": target.notes,
    }

    try:
        sequence = await snooks_agent.generate_relationship_sequence(target_dict, growth_profile)
        return {
            "target": _serialize(target),
            "sequence": sequence,
        }
    except Exception as e:
        logger.error(f"Sequence generation failed: {e}")
        raise HTTPException(status_code=503, detail="AI service unavailable")
