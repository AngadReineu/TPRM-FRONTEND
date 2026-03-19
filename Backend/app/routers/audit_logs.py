from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.audit_log import AuditLog
from ..models.user import User
from ..schemas.audit_log import AuditLogResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    action: Optional[str] = Query(None),
    user: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    if user:
        q = q.filter(AuditLog.user.ilike(f"%{user}%"))
    if status:
        q = q.filter(AuditLog.status == status)
    return q.order_by(AuditLog.ts.desc()).offset(offset).limit(limit).all()
