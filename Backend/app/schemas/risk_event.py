from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ActionItem(BaseModel):
    id: str
    title: str
    detail: str
    owner: str
    effort: str                 # Low, Medium, High
    score_reduction: int        # negative integer e.g. -3

    model_config = {"from_attributes": True}

class RiskEventCreate(BaseModel):
    run_id: Optional[str] = None
    run_date: Optional[str] = None
    agent_id: Optional[str] = None
    supplier_name: str
    supplier_id: Optional[str] = None
    task_name: Optional[str] = None
    description: str
    severity: str
    score_change: int
    current_score: int
    full_detail: Optional[str] = None
    impact: Optional[str] = None
    category: Optional[str] = "Agent Detection"

class RiskEventResponse(BaseModel):
    id: str
    date: str
    run_id: Optional[str] = None
    run_date: Optional[str] = None
    agent_id: Optional[str] = None
    supplier_name: str
    task_name: Optional[str] = None
    description: str
    severity: str
    status: str
    score_change: int
    current_score: int
    category: str
    full_detail: Optional[str] = None
    impact: Optional[str] = None
    actions: Optional[list] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}
