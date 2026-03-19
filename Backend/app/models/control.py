from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base


class Control(Base):
    __tablename__ = "controls"

    id               = Column(String, primary_key=True, index=True)
    name             = Column(String, nullable=False)
    desc             = Column(String, nullable=True)
    category         = Column(String, nullable=False)     # Technical | Process | Document | Expected Res.
    active           = Column(Boolean, default=True)
    coverage         = Column(Integer, default=0)         # 0–100 percent
    scope            = Column(String, default="Partial")  # Full | Partial
    risk             = Column(String, default="Medium")   # Critical | High | Medium | Low
    last_eval        = Column(String, nullable=True)
    deps             = Column(Integer, default=0)         # number of dependent controls
    internal_spoc    = Column(String, nullable=True)
    external_spoc    = Column(String, nullable=True)
    pii_flow         = Column(String, nullable=True)      # share | ingest | both
    truth_validator  = Column(Boolean, default=False)
    has_truth_gap    = Column(Boolean, default=False)
    personality      = Column(String, nullable=True)      # Consulting | Operations | Security | Regulatory

    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())
