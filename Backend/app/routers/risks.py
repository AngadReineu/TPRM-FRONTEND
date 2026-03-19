from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.risk import RiskEvent, RiskAction
from ..models.user import User
from ..schemas.risk import RiskEventResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/risks", tags=["risks"])


@router.get("", response_model=List[RiskEventResponse])
def list_risk_events(
    severity: Optional[str] = Query(None),
    supplier: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(RiskEvent)
    if severity:
        q = q.filter(RiskEvent.severity == severity)
    if supplier:
        q = q.filter(RiskEvent.supplier.ilike(f"%{supplier}%"))
    events = q.order_by(RiskEvent.date.desc()).all()

    result = []
    for ev in events:
        actions = db.query(RiskAction).filter(RiskAction.risk_event_id == ev.id).all()
        ev_dict = {c.name: getattr(ev, c.name) for c in ev.__table__.columns}
        ev_dict["actions"] = actions
        result.append(RiskEventResponse.model_validate(ev_dict))
    return result


@router.get("/{event_id}", response_model=RiskEventResponse)
def get_risk_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ev = db.query(RiskEvent).filter(RiskEvent.id == event_id).first()
    if not ev:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Risk event not found")
    actions = db.query(RiskAction).filter(RiskAction.risk_event_id == ev.id).all()
    ev_dict = {c.name: getattr(ev, c.name) for c in ev.__table__.columns}
    ev_dict["actions"] = actions
    return RiskEventResponse.model_validate(ev_dict)
