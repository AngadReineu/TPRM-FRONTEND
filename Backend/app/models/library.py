from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Organisation(Base):
    """Singleton — one row represents the org centre node on the canvas."""
    __tablename__ = "organisation"

    id         = Column(String, primary_key=True, default="org")
    name       = Column(String, default="My Organisation")
    canvas_x   = Column(Float, default=580.0)
    canvas_y   = Column(Float, default=380.0)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Division(Base):
    __tablename__ = "divisions"

    id              = Column(String, primary_key=True, index=True)
    org_id          = Column(String, index=True)
    name            = Column(String, nullable=False)
    canvas_x        = Column(Float, default=400.0)
    canvas_y        = Column(Float, default=300.0)
    lifecycle_stage = Column(String, nullable=True)   # Acquisition | Retention | Upgradation | Offboarding

    created_at      = Column(DateTime(timezone=True), server_default=func.now())


class SupplierNode(Base):
    """
    Graph-view supplier node. Separate from the Vendor table —
    this carries canvas position and graph-specific PII detail.
    """
    __tablename__ = "supplier_nodes"

    id              = Column(String, primary_key=True, index=True)
    org_id          = Column(String, nullable=True, index=True)
    division_id     = Column(String, ForeignKey("divisions.id"), nullable=False, index=True)
    canvas_x        = Column(Float, default=200.0)
    canvas_y        = Column(Float, default=200.0)

    name            = Column(String, nullable=False)
    email           = Column(String, nullable=True)
    contact         = Column(String, nullable=True)
    phone           = Column(String, nullable=True)
    website         = Column(String, nullable=True)
    gst             = Column(String, nullable=True)
    pan             = Column(String, nullable=True)

    stage           = Column(String, default="Acquisition")
    risk_score      = Column(Integer, nullable=True)
    pii_volume      = Column(String, default="low")        # low | moderate | high
    pii_flow        = Column(String, nullable=True)        # share | ingest | both
    pii_types       = Column(JSON, default=[])
    has_truth_gap   = Column(Boolean, default=False)
    declared_pii    = Column(JSON, default=[])
    detected_pii    = Column(JSON, default=[])

    internal_spoc   = Column(String, nullable=True)
    external_spoc   = Column(String, nullable=True)
    contract_start  = Column(String, nullable=True)
    contract_end    = Column(String, nullable=True)
    frequency       = Column(String, nullable=True)
    lifecycles      = Column(JSON, default=[])             # list of Stage strings
    stakeholders    = Column(JSON, default={})

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class SystemNode(Base):
    """CRM / infra / DB node on the graph canvas."""
    __tablename__ = "system_nodes"

    id                    = Column(String, primary_key=True, index=True)
    org_id                = Column(String, nullable=True, index=True)
    division_id           = Column(String, ForeignKey("divisions.id"), nullable=False, index=True)
    canvas_x              = Column(Float, default=200.0)
    canvas_y              = Column(Float, default=200.0)

    name                  = Column(String, nullable=False)
    type                  = Column(String, default="crm")    # crm | infra | db
    data_source           = Column(String, nullable=True)
    pii_types             = Column(JSON, default=[])
    vuln_score            = Column(Integer, nullable=True)
    stage                 = Column(String, nullable=True)
    internal_spoc         = Column(String, nullable=True)
    authorized_pii        = Column(JSON, default=[])
    has_stage_discrepancy = Column(Boolean, default=False)
    discrepancy_fields    = Column(JSON, default=[])
    agent_reasoning       = Column(JSON, nullable=True)      # full reasoning object
    linked_supplier_id    = Column(String, ForeignKey("supplier_nodes.id"), nullable=True)

    created_at            = Column(DateTime(timezone=True), server_default=func.now())
    updated_at            = Column(DateTime(timezone=True), onupdate=func.now())
