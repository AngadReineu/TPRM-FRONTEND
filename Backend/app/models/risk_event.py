from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from ..database import Base

class RiskEvent(Base):
    __tablename__ = "risk_events"
    
    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id        = Column(String, nullable=True, index=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    date          = Column(String, nullable=False)           # human readable "Mar 25, 2026"
    run_id        = Column(String, nullable=True)            # agent run ID e.g. "ed70016b"
    run_date      = Column(String, nullable=True)            # "2026-03-25"
    agent_id      = Column(String, ForeignKey("agents.id"), nullable=True)
    supplier_name = Column(String, nullable=False)
    supplier_id   = Column(String, ForeignKey("vendors.id"), nullable=True)
    task_name     = Column(String, nullable=True)
    description   = Column(String, nullable=False)
    severity      = Column(String, nullable=False)           # Critical, High, Medium, Low
    status        = Column(String, default="Open")           # Open, In Review, Resolved
    score_change  = Column(Integer, default=0)               # e.g. +18 for Critical
    current_score = Column(Integer, default=50)
    category      = Column(String, default="Agent Detection")
    full_detail   = Column(Text, nullable=True)              # full Mistral finding text
    impact        = Column(Text, nullable=True)              # business impact
    actions       = Column(JSON, nullable=True)              # list of action objects
    resolved_at   = Column(DateTime, nullable=True)
