import collections
import logging
from copy import deepcopy
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, String
from typing import List, Optional
import json

from ..database import get_db
from ..models.risk_event import RiskEvent
from ..models.vendor import Vendor
from ..schemas.risk_event import RiskEventResponse, RiskEventCreate, ActionItem
from ..dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/risk", tags=["risks"])

@router.get("/events", response_model=List[RiskEventResponse])
def get_risk_events(
    supplier_name: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    run_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(RiskEvent)
    if supplier_name:
        q = q.filter(RiskEvent.supplier_name.ilike(f"%{supplier_name}%"))
    if severity:
        if severity != "All":
            q = q.filter(RiskEvent.severity == severity)
    if status:
        if status != "All":
            q = q.filter(RiskEvent.status == status)
    if run_id:
        q = q.filter(RiskEvent.run_id == run_id)
        
    events = q.order_by(RiskEvent.created_at.desc()).all()
    for ev in events:
        ev.id = str(ev.id)
        if hasattr(ev, 'agent_id') and ev.agent_id: ev.agent_id = str(ev.agent_id)
    return events

@router.post("/events", response_model=RiskEventResponse)
def create_risk_event(payload: RiskEventCreate, db: Session = Depends(get_db)):
    default_actions = [
        {"id": "a1", "title": "Review and verify finding", "detail": "Risk manager to review the agent finding and verify against source documents.", "owner": "Risk Manager", "effort": "Low", "scoreReduction": -3},
        {"id": "a2", "title": "Contact supplier for documentation", "detail": "Request supplier provide required documentation to resolve the identified issue.", "owner": "Risk Manager", "effort": "Low", "scoreReduction": -2},
        {"id": "a3", "title": "Re-run agent evaluation after remediation", "detail": "Once remediation steps are completed, trigger agent re-evaluation to confirm issue is resolved.", "owner": "Agent", "effort": "Low", "scoreReduction": -5}
    ]
    
    event = RiskEvent(
        date=datetime.now().strftime("%b %d, %Y"),
        run_id=payload.run_id,
        run_date=payload.run_date,
        agent_id=payload.agent_id,
        supplier_name=payload.supplier_name,
        supplier_id=payload.supplier_id,
        task_name=payload.task_name,
        description=payload.description,
        severity=payload.severity,
        score_change=payload.score_change,
        current_score=payload.current_score,
        full_detail=payload.full_detail,
        impact=payload.impact,
        category=payload.category,
        actions=default_actions
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    event.id = str(event.id)
    if hasattr(event, 'agent_id') and event.agent_id: event.agent_id = str(event.agent_id)
    return event

@router.patch("/events/{id}")
def update_risk_event_status(id: str, payload: dict, db: Session = Depends(get_db)):
    event = db.query(RiskEvent).filter(func.cast(RiskEvent.id, String) == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Risk event not found")
        
    if "status" in payload:
        event.status = payload["status"]
        if event.status == "Resolved":
            event.resolved_at = datetime.utcnow()
            
    db.commit()
    event.id = str(event.id)
    if hasattr(event, 'agent_id') and event.agent_id: event.agent_id = str(event.agent_id)
    return event

@router.patch("/events/{id}/actions")
def update_risk_event_actions(id: str, payload: dict, db: Session = Depends(get_db)):
    event = db.query(RiskEvent).filter(func.cast(RiskEvent.id, String) == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Risk event not found")
        
    if "actions" in payload:
        event.actions = payload["actions"]
            
    db.commit()
    event.id = str(event.id)
    if hasattr(event, 'agent_id') and event.agent_id: event.agent_id = str(event.agent_id)
    return event

@router.post("/events/{id}/actions/{action_id}/execute")
def execute_risk_action(id: str, action_id: str, db: Session = Depends(get_db)):
    event = db.query(RiskEvent).filter(func.cast(RiskEvent.id, String) == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Risk event not found")
        
    actions = event.actions or []
    updated = False
    for a in actions:
        if a.get("id") == action_id:
            a["completed"] = True
            a["completed_at"] = datetime.utcnow().isoformat()
            updated = True
            break
            
    if updated:
        # Reassign to force SQLAlchemy to understand JSON column was modified
        event.actions = deepcopy(actions)
        db.commit()
        
    event.id = str(event.id)
    if hasattr(event, 'agent_id') and event.agent_id: event.agent_id = str(event.agent_id)
    return event

@router.get("/trends")
def get_risk_trends(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendors = db.query(Vendor).filter(Vendor.org_id == current_user.org_id).all()
    if not vendors or len(vendors) == 0:
        return []

    months = collections.defaultdict(list)
    for v in vendors:
        if v.updated_at:
            month_str = v.updated_at.strftime("%b")
            score = v.score or 50
            months[month_str].append(score)

    if not months:
        return []

    res = []
    for month, scores in months.items():
        avg = sum(scores) / len(scores)
        critical = sum(1 for s in scores if s > 80)
        high = sum(1 for s in scores if s > 60 and s <= 80)
        res.append({
            "month": month,
            "overall": int(avg),
            "critical": critical,
            "high": high
        })
    return res

@router.get("/ai-recommendations")
def get_ai_recommendations(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendors = db.query(Vendor.id).filter(Vendor.org_id == current_user.org_id).all()
    vendor_ids = [v.id for v in vendors]
    
    if not vendor_ids:
        return {"recommendations": []}
        
    events = db.query(RiskEvent).filter(RiskEvent.supplier_id.in_(vendor_ids), RiskEvent.status == "Open").order_by(RiskEvent.created_at.desc()).limit(5).all()
    if not events:
        return {"recommendations": []}
    recs = []
    for ev in events:
        recs.append(f"{ev.supplier_name} - {ev.description} ({ev.severity}, {ev.status})")
    return {"recommendations": recs}
