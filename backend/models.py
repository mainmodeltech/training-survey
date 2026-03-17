from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, Float
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superadmin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    # Section 1 — Identification
    full_name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    department = Column(String, nullable=False)
    location = Column(String, nullable=False)

    # Section 2 — Niveau
    self_level = Column(String, nullable=False)  # debutant | intermediaire | avance | expert
    features_usage = Column(JSON, nullable=False)  # {feature: "jamais"|"parfois"|"souvent"}
    file_size = Column(String, nullable=True)

    # Section 3 — Utilisation quotidienne
    daily_tasks = Column(JSON, nullable=False)  # list of strings
    daily_time = Column(String, nullable=False)
    difficulties = Column(JSON, nullable=False)  # list of strings
    difficulty_details = Column(String, nullable=True)

    # Section 4 — Ambitions
    motivation = Column(String, nullable=False)
    expected_results = Column(JSON, nullable=False)  # list of strings
    ambition_level = Column(String, nullable=False)

    # Section 5 — Modalités
    preferred_duration = Column(String, nullable=False)
    preferred_modality = Column(String, nullable=False)
    has_computer = Column(String, nullable=True)
    concrete_case = Column(String, nullable=True)
    additional_comments = Column(String, nullable=True)

    # Scoring automatique (calculé à la soumission)
    computed_level = Column(String, nullable=True)       # A | B
    score_total = Column(Float, nullable=True)
    score_breakdown = Column(JSON, nullable=True)        # détail du scoring

    # Méta
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed = Column(Boolean, default=False)
    notes_admin = Column(String, nullable=True)
