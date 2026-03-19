from pydantic import BaseModel
from typing import List, Optional


class RiskTrendPoint(BaseModel):
    month: str
    overall: int
    critical: int
    high: int


class StageDataItem(BaseModel):
    stage: str
    color: str
    count: int
    critical: int
    high: int
    medium: int
    low: int


class AgentRow(BaseModel):
    initials: str
    color: str
    name: str
    stage: str
    status: str
    status_color: str
    is_active: bool


class RiskAlert(BaseModel):
    type: str
    supplier: str
    system: str
    severity: str
    severity_bg: str


class DashboardSummary(BaseModel):
    total_vendors: int
    active_agents: int
    open_risks: int
    avg_risk_score: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    controls_active: int
    controls_total: int
    risk_trend: List[RiskTrendPoint]
    stage_breakdown: List[StageDataItem]
    agent_activity: List[AgentRow]
    recent_alerts: List[RiskAlert]
