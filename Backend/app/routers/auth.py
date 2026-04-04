import uuid
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import jwt

from ..database import get_db
from ..config import settings
from ..models.user import User
from ..models.organisation import Organisation
from ..schemas.auth import LoginRequest, RegisterPayload, TokenResponse, UserResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode = data.copy()
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    org = db.query(Organisation).filter(
        Organisation.id == user.org_id
    ).first() if user.org_id else None

    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "org_id": str(user.org_id) if user.org_id else "",
        "org_name": org.name if org else "",
        "role": user.role or "admin",
        "name": user.name or user.email,
    })
    return TokenResponse(access_token=token)


@router.get("/me")
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organisation).filter(
        Organisation.id == current_user.org_id
    ).first() if current_user.org_id else None

    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role or "admin",
        "org_id": str(current_user.org_id) if current_user.org_id else "",
        "org_name": org.name if org else "",
        "industry": org.industry if org else "",
        "avatar": current_user.avatar,
        "status": current_user.status or "Active",
    }


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    # Check email not already taken
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create organisation
    org = Organisation(
        id=str(uuid.uuid4()),
        name=payload.org_name,
        industry=payload.industry,
        status="active",
    )
    db.add(org)
    db.flush()

    # Create admin user linked to this org
    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=get_password_hash(payload.password),
        role="admin",
        org_id=org.id,
        is_active=True,
        status="Active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(org)

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "org_id": str(org.id),
        "org_name": org.name,
        "role": user.role,
        "name": user.name,
    })
    return TokenResponse(access_token=token)


@router.post("/update-email")
def update_email(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's email address"""
    new_email = payload.get("new_email")
    password = payload.get("password")
    
    if not new_email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Verify current password
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Check if email already taken
    existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    current_user.email = new_email
    db.commit()
    
    return {"message": "Email updated successfully"}


@router.post("/update-password")
def update_password(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's password"""
    current_password = payload.get("current_password")
    new_password = payload.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password required")
    
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

