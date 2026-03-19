from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.settings_model import OrgSettings
from ..models.user import User
from ..schemas.settings import SettingsResponse, SettingsUpdate
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService

router = APIRouter(prefix="/settings", tags=["settings"])


def _get_or_create(db: Session) -> OrgSettings:
    s = db.query(OrgSettings).filter(OrgSettings.id == "global").first()
    if not s:
        s = OrgSettings(id="global")
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_create(db)


@router.patch("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    AuditService.log(
        db, current_user, "Control Updated", "Settings",
        "Organisation settings updated", get_client_ip(request),
    )
    return s
