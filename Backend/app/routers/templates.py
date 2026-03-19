from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.template import Template
from ..models.user import User
from ..schemas.template import TemplateResponse
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=List[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Template).order_by(Template.name).all()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(Template).filter(Template.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.patch("/{template_id}/deploy", response_model=TemplateResponse)
def deploy_template(
    template_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = db.query(Template).filter(Template.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    t.deployed = not t.deployed
    db.commit()
    db.refresh(t)
    state = "deployed" if t.deployed else "undeployed"
    AuditService.log(
        db, current_user, "Portal Sent", t.name,
        f"Template '{t.name}' {state}", get_client_ip(request),
    )
    return t
