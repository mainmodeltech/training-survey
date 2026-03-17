from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from database import get_db
from core.scoring import compute_score
import models

router = APIRouter()


class SubmissionCreate(BaseModel):
    # Section 1
    full_name: str
    position: str
    department: str
    location: str
    # Section 2
    self_level: str
    features_usage: Dict[str, str]
    file_size: Optional[str] = None
    # Section 3
    daily_tasks: List[str]
    daily_time: str
    difficulties: List[str]
    difficulty_details: Optional[str] = None
    # Section 4
    motivation: str
    expected_results: List[str]
    ambition_level: str
    # Section 5
    preferred_duration: str
    preferred_modality: str
    has_computer: Optional[str] = None
    concrete_case: Optional[str] = None
    additional_comments: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    full_name: str
    computed_level: Optional[str]
    score_total: Optional[float]
    recommended_label: Optional[str]
    recommended_duration: Optional[str]
    key_topics: Optional[List[str]]
    message: str

    class Config:
        from_attributes = True


@router.post("/", response_model=SubmissionResponse, status_code=201)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    # Calcul du score et du curriculat recommandé
    scoring = compute_score(payload.model_dump())

    submission = models.Submission(
        full_name=payload.full_name,
        position=payload.position,
        department=payload.department,
        location=payload.location,
        self_level=payload.self_level,
        features_usage=payload.features_usage,
        file_size=payload.file_size,
        daily_tasks=payload.daily_tasks,
        daily_time=payload.daily_time,
        difficulties=payload.difficulties,
        difficulty_details=payload.difficulty_details,
        motivation=payload.motivation,
        expected_results=payload.expected_results,
        ambition_level=payload.ambition_level,
        preferred_duration=payload.preferred_duration,
        preferred_modality=payload.preferred_modality,
        has_computer=payload.has_computer,
        concrete_case=payload.concrete_case,
        additional_comments=payload.additional_comments,
        computed_level=scoring["computed_level"],
        score_total=scoring["score_total"],
        score_breakdown=scoring["score_breakdown"],
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=submission.id,
        full_name=submission.full_name,
        computed_level=scoring["computed_level"],
        score_total=scoring["score_total"],
        recommended_label=scoring["recommended_label"],
        recommended_duration=scoring["recommended_duration"],
        key_topics=scoring["key_topics"],
        message="Formulaire soumis avec succès. Notre équipe vous contactera sous 5 jours ouvrables.",
    )
