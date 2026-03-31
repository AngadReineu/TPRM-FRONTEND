from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from ..database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id                = Column(String, primary_key=True, index=True)
    org_id            = Column(String, nullable=True, index=True)
    name              = Column(String, nullable=False)
    email             = Column(String, nullable=False)

    # Contact info
    mobile            = Column(String, nullable=True)
    gst_number        = Column(String, nullable=True)
    pan_number        = Column(String, nullable=True)

    # Lifecycle
    stage             = Column(String, default="Acquisition")   # Acquisition | Retention | Upgradation | Offboarding
    stage_color       = Column(String, default="#0EA5E9")

    # Risk
    score             = Column(Integer, default=50)
    risk              = Column(String, default="Medium")        # Critical | High | Medium | Low
    risk_color        = Column(String, default="#64748B")

    # Assessment
    assessment        = Column(String, default="pending")       # complete | overdue | pending

    # PII — stored as JSON object { configured, icons, method }
    pii               = Column(JSON, default={"configured": False})
    pii_flow          = Column(String, nullable=True)           # share | ingest | both

    # Contract
    contract_end      = Column(String, nullable=True)
    contract_warning  = Column(Boolean, default=False)

    # Relationships
    agent_id          = Column(String, nullable=True)           # e.g. "a1"
    internal_spoc     = Column(String, nullable=True)
    external_spoc     = Column(String, nullable=True)

    # Stakeholder matrix — JSON: {"internal": [{"label": "...", "email": "..."}], "supplier": [...]}
    stakeholder_matrix = Column(JSON, nullable=True)

    last_activity     = Column(String, default="just now")

    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), onupdate=func.now())
