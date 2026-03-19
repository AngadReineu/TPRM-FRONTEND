from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id            = Column(String, primary_key=True, index=True)
    date          = Column(String, nullable=False)
    supplier      = Column(String, nullable=False)
    desc          = Column(Text, nullable=False)
    severity      = Column(String, nullable=False)        # critical | high | medium
    score_change  = Column(String, nullable=False)        # e.g. "+12" or "-5"
    status        = Column(String, default="Open")
    current_score = Column(Integer, default=50)
    category      = Column(String, nullable=True)
    full_detail   = Column(Text, nullable=True)
    impact        = Column(Text, nullable=True)

    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class RiskAction(Base):
    __tablename__ = "risk_actions"

    id              = Column(String, primary_key=True, index=True)
    risk_event_id   = Column(String, ForeignKey("risk_events.id"), nullable=False, index=True)
    title           = Column(String, nullable=False)
    detail          = Column(Text, nullable=True)
    score_reduction = Column(Integer, default=0)
    owner           = Column(String, nullable=True)
    effort          = Column(String, default="Medium")    # Low | Medium | High

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
