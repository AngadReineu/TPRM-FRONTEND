import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.control import Control
from ..models.user import User
from ..schemas.control import ControlCreate, ControlUpdate, ControlResponse
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService

router = APIRouter(prefix="/controls", tags=["controls"])


@router.get("", response_model=List[ControlResponse])
def list_controls(db: Session = Depends(get_db)):
    return db.query(Control).order_by(Control.category, Control.name).all()


@router.get("/{control_id}", response_model=ControlResponse)
def get_control(control_id: str, db: Session = Depends(get_db)):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    return control


@router.post("", response_model=ControlResponse, status_code=status.HTTP_201_CREATED)
def create_control(
    payload: ControlCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = Control(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(control)
    db.commit()
    db.refresh(control)
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' created", get_client_ip(request))
    return control


@router.patch("/{control_id}", response_model=ControlResponse)
def update_control(
    control_id: str,
    payload: ControlUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(control, field, value)
    db.commit()
    db.refresh(control)
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' updated", get_client_ip(request))
    return control


@router.patch("/{control_id}/toggle", response_model=ControlResponse)
def toggle_control(
    control_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    control.active = not control.active
    db.commit()
    db.refresh(control)
    state = "enabled" if control.active else "disabled"
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' {state}", get_client_ip(request))
    return control


@router.delete("/{control_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_control(
    control_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    db.delete(control)
    db.commit()
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' deleted", get_client_ip(request), status="Warning")
