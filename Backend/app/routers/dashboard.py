from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.dashboard import DashboardSummary
from ..dependencies import get_current_user
from ..services.dashboard import build_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return build_dashboard(db)
