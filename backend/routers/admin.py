from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from pydantic import BaseModel
from database import get_db
from core.security import get_current_admin
import models

router = APIRouter()


class SubmissionDetail(BaseModel):
    id: int
    full_name: str
    position: str
    department: str
    location: str
    self_level: str
    features_usage: dict
    file_size: Optional[str]
    daily_tasks: list
    daily_time: str
    difficulties: list
    difficulty_details: Optional[str]
    motivation: str
    expected_results: list
    ambition_level: str
    preferred_duration: str
    preferred_modality: str
    has_computer: Optional[str]
    concrete_case: Optional[str]
    additional_comments: Optional[str]
    computed_level: Optional[str]
    score_total: Optional[float]
    score_breakdown: Optional[dict]
    reviewed: bool
    notes_admin: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class AdminNote(BaseModel):
    notes_admin: Optional[str] = None
    reviewed: Optional[bool] = None


@router.get("/submissions")
def list_submissions(
    skip: int = 0,
    limit: int = 50,
    level: Optional[str] = Query(None, description="Filtrer par niveau : A ou B"),
    reviewed: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    query = db.query(models.Submission)
    if level:
        query = query.filter(models.Submission.computed_level == level)
    if reviewed is not None:
        query = query.filter(models.Submission.reviewed == reviewed)

    total = query.count()
    items = query.order_by(models.Submission.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": s.id,
                "full_name": s.full_name,
                "position": s.position,
                "department": s.department,
                "location": s.location,
                "self_level": s.self_level,
                "computed_level": s.computed_level,
                "score_total": s.score_total,
                "preferred_duration": s.preferred_duration,
                "preferred_modality": s.preferred_modality,
                "reviewed": s.reviewed,
                "created_at": str(s.created_at),
            }
            for s in items
        ],
    }


@router.get("/submissions/{submission_id}")
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    s = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Soumission introuvable")
    return s


@router.patch("/submissions/{submission_id}")
def update_submission(
    submission_id: int,
    payload: AdminNote,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    s = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Soumission introuvable")
    if payload.notes_admin is not None:
        s.notes_admin = payload.notes_admin
    if payload.reviewed is not None:
        s.reviewed = payload.reviewed
    db.commit()
    return {"message": "Mis à jour"}


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    total = db.query(func.count(models.Submission.id)).scalar()
    level_a = db.query(func.count(models.Submission.id)).filter(models.Submission.computed_level == "A").scalar()
    level_b = db.query(func.count(models.Submission.id)).filter(models.Submission.computed_level == "B").scalar()
    reviewed = db.query(func.count(models.Submission.id)).filter(models.Submission.reviewed == True).scalar()
    avg_score = db.query(func.avg(models.Submission.score_total)).scalar()

    levels = db.query(models.Submission.self_level, func.count(models.Submission.id)).group_by(models.Submission.self_level).all()
    modalities = db.query(models.Submission.preferred_modality, func.count(models.Submission.id)).group_by(models.Submission.preferred_modality).all()
    durations = db.query(models.Submission.preferred_duration, func.count(models.Submission.id)).group_by(models.Submission.preferred_duration).all()

    return {
        "total_submissions": total,
        "level_a_count": level_a,
        "level_b_count": level_b,
        "reviewed_count": reviewed,
        "pending_count": total - reviewed,
        "avg_score": round(float(avg_score), 1) if avg_score else 0,
        "by_self_level": [{"level": l, "count": c} for l, c in levels],
        "by_modality": [{"modality": m, "count": c} for m, c in modalities],
        "by_duration": [{"duration": d, "count": c} for d, c in durations],
    }
