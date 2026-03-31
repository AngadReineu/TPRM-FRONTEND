import uuid
from ..models.organisation import Organisation
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from ..database import get_db
from ..config import settings
from ..models.user import User
from ..schemas.auth import LoginRequest, RegisterPayload, TokenResponse, UserResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "org_id": user.org_id or "",
        "org_name": org.name if org else "",
        "role": user.role or "admin",
        "name": user.name or user.email,
    })
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register")
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    """
    creates a new organisation and an admin user linked to it 
    retirns a jwt token so the iser is immediately logged in
    """

    #check email not already taken 
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered!")

        # this is to create a organisation 
    org = Organisation(
        id=str(uuid.uuid4()),
        name= payload.org.name,
        industry=payload.industry,
        status="active",
    )
    db.add(org)
    db.flush() #gets org.id without full commit

    # now create the admin user
    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=pwd_context.hash(payload.password),
        role="admin",
        org_id=org.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    #return the JWT token same format as login 
    token = create_access_token({
        "sub":user.email,
        "user_id": user.id,
        "org_id":org.id,
        "org_name": org_name,
        "role": user.role,
        "name": user.name,
    })
    return {"access_token": token,"token_type": "bearer"}
