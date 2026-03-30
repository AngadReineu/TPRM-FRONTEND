from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class AgentCreate(BaseModel):
    name: str
    initials: Optional[str] = None
    status: str = "active"
    stage: str = "Acquisition"
    controls: int = 0
    suppliers: int = 0
    gradient: Optional[str] = None
    alerts: int = 0
    division: Optional[str] = None
    frequency: str = "Daily"
    notify: List[str] = []
    alert_level: Optional[str] = None
    control_list: List[str] = []
    supplier_list: List[str] = []
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    initials: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[str] = None
    controls: Optional[int] = None
    suppliers: Optional[int] = None
    gradient: Optional[str] = None
    alerts: Optional[int] = None
    division: Optional[str] = None
    frequency: Optional[str] = None
    notify: Optional[List[str]] = None
    role: Optional[str] = None
    color: Optional[str] = None
    avatar_seed: Optional[str] = None
    uptime: Optional[str] = None
    next_eval: Optional[str] = None
    last_scan: Optional[str] = None
    open_tasks: Optional[int] = None
    current_task: Optional[str] = None
    alert_level: Optional[str] = None
    systems: Optional[List[str]] = None
    supplier_list: Optional[List[str]] = None
    control_list: Optional[List[str]] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None


class AgentResponse(BaseModel):
    id: str
    name: str
    initials: str
    status: str
    stage: str
    controls: int
    suppliers: int
    gradient: Optional[str] = None
    alerts: int
    last_active: str
    health: int
    division: Optional[str] = None
    frequency: str
    notify: List[str] = []
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    truth_match: Optional[int] = None
    role: Optional[str] = None
    color: Optional[str] = None
    avatar_seed: Optional[str] = None
    uptime: Optional[str] = None
    next_eval: Optional[str] = None
    last_scan: Optional[str] = None
    open_tasks: int = 0
    current_task: Optional[str] = None
    alert_level: Optional[str] = None
    systems: List[str] = []
    supplier_list: List[str] = []
    control_list: List[str] = []

    model_config = {"from_attributes": True}


class AgentTaskResponse(BaseModel):
    id: str
    agent_id: str
    view: str
    title: str
    supplier: Optional[str] = None
    priority: str
    assignee: Optional[str] = None
    status: str
    due_date: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class AgentLogResponse(BaseModel):
    id: str
    agent_id: str
    run_id: Optional[str] = None
    run_date: Optional[str] = None
    view: str
    time: str
    type: str
    message: str
    detail: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AgentTimelineResponse(BaseModel):
    id: str
    agent_id: str
    view: str
    time: str
    event: str
    status: str

    model_config = {"from_attributes": True}


# ── Request schemas (moved from routers/agents.py) ─────────

class AgentTaskCreate(BaseModel):
    title: str
    supplier: Optional[str] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"
    due_date: Optional[str] = None
    description: Optional[str] = None
    view: Optional[str] = "list"
    run_id: Optional[str] = None
    run_date: Optional[str] = None


class AgentLogCreate(BaseModel):
    type: str
    message: str
    detail: Optional[str] = None
    run_id: Optional[str] = None
    run_date: Optional[str] = None


class RunTaskPayload(BaseModel):
    task_name: str


class AgentTaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    description: Optional[str] = None
