from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from typing import Optional
import uuid

from ..database import get_db
from ..models.user import User
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService
from passlib.context import CryptContext

router = APIRouter(prefix="/roles", tags=["roles"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    avatar: Optional[str] = None
    last_login: Optional[str] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None


# Static permission matrix — maps role → module → permission level
PERMISSION_MATRIX = {
    "Admin": {
        "dashboard": "full", "vendors": "full", "agents": "full",
        "controls": "full", "risks": "full", "documents": "full",
        "audit_logs": "full", "roles": "full", "settings": "full",
        "library": "full", "templates": "full",
    },
    "Risk Manager": {
        "dashboard": "full", "vendors": "full", "agents": "full",
        "controls": "full", "risks": "full", "documents": "full",
        "audit_logs": "read", "roles": "read", "settings": "read",
        "library": "full", "templates": "full",
    },
    "Compliance Officer": {
        "dashboard": "read", "vendors": "read", "agents": "read",
        "controls": "read", "risks": "full", "documents": "full",
        "audit_logs": "full", "roles": "read", "settings": "none",
        "library": "read", "templates": "read",
    },
    "DPO": {
        "dashboard": "read", "vendors": "read", "agents": "none",
        "controls": "read", "risks": "read", "documents": "full",
        "audit_logs": "full", "roles": "none", "settings": "none",
        "library": "read", "templates": "none",
    },
    "Viewer": {
        "dashboard": "read", "vendors": "read", "agents": "read",
        "controls": "read", "risks": "read", "documents": "read",
        "audit_logs": "read", "roles": "none", "settings": "none",
        "library": "read", "templates": "read",
    },
}


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).order_by(User.name).all()
    result = []
    for u in users:
        result.append(UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            status=u.status,
            avatar=u.avatar,
            last_login=u.last_login.strftime("%d %b %Y, %I:%M %p") if u.last_login else "Never",
        ))
    return result


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_role(
    user_id: str,
    payload: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role:
        user.role = payload.role
    if payload.status:
        user.status = payload.status

    db.commit()
    db.refresh(user)

    AuditService.log(
        db, current_user, "Role Changed", user.name,
        f"Role changed to {user.role}", get_client_ip(request),
    )
    return UserResponse(
        id=user.id, name=user.name, email=user.email,
        role=user.role, status=user.status, avatar=user.avatar,
        last_login=user.last_login.strftime("%d %b %Y, %I:%M %p") if user.last_login else "Never",
    )


@router.get("/permissions")
def get_permissions(current_user: User = Depends(get_current_user)):
    """Return full permission matrix and the current user's permissions."""
    return {
        "matrix": PERMISSION_MATRIX,
        "current_role": current_user.role,
        "current_permissions": PERMISSION_MATRIX.get(current_user.role, {}),
    }


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Viewer"


@router.post("/users/register", response_model=UserResponse, status_code=201)
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Self-registration endpoint — no auth required.
    New users are created with status 'Pending' until an admin activates them.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    allowed_roles = ["Risk Manager", "Compliance Officer", "DPO", "Viewer"]
    role = payload.role if payload.role in allowed_roles else "Viewer"

    user = User(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=payload.email,
        hashed_password=pwd_context.hash(payload.password),
        role=role,
        status="Pending",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        avatar=user.avatar,
        last_login=None,
    )
