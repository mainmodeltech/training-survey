from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from core.security import verify_password, hash_password, create_access_token, get_current_admin
import models

router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    is_superadmin: bool


class CreateAdminRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_superadmin: bool = False


@router.post("/token", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    token = create_access_token({"sub": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        is_superadmin=user.is_superadmin,
    )


@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_admin)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_superadmin": current_user.is_superadmin,
        "created_at": current_user.created_at,
    }


@router.post("/create-admin", status_code=201)
def create_admin(
    payload: CreateAdminRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Réservé au super-administrateur")

    existing = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username ou email déjà utilisé")

    user = models.User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_superadmin=payload.is_superadmin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"Administrateur '{user.username}' créé avec succès", "id": user.id}
