from pydantic import BaseModel
from typing import Optional, List


class RiskActionResponse(BaseModel):
    id: str
    risk_event_id: str
    title: str
    detail: Optional[str] = None
    score_reduction: int
    owner: Optional[str] = None
    effort: str

    model_config = {"from_attributes": True}


class RiskEventResponse(BaseModel):
    id: str
    date: str
    supplier: str
    desc: str
    severity: str
    score_change: str
    status: str
    current_score: int
    category: Optional[str] = None
    full_detail: Optional[str] = None
    impact: Optional[str] = None
    actions: List[RiskActionResponse] = []

    model_config = {"from_attributes": True}
