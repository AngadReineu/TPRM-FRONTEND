from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from ..database import Base


class Control(Base):
    __tablename__ = "controls"

    id                   = Column(String, primary_key=True, index=True)
    name                 = Column(String, nullable=False)
    desc                 = Column(String, nullable=True)

    # Auto-set from persona — Process | Technical | Document
    category             = Column(String, nullable=False, default="Process")

    # Persona group — Consulting | Operations | Data Security | Regulatory
    personality          = Column(String, nullable=True)

    # Risk level — determines agent execution order
    risk                 = Column(String, default="Medium")  # Critical | High | Medium | Low

    # Active state and coverage
    active               = Column(Boolean, default=True)
    coverage             = Column(Integer, default=0)

    # SLM Tasks — list of task names this control covers
    slm_tasks            = Column(JSON, default=[])

    # Step 2 — Target Asset Scope (Consulting)
    supplier_scope       = Column(JSON, default=[])       # list of vendor IDs
    lifecycle_stage      = Column(String, nullable=True)  # Acquisition | Retention | Upgradation | Offboarding | All
    communication_scope  = Column(JSON, default={})       # { "Payment Monitoring": "finance@supplier.com" }
    document_scope       = Column(JSON, default=[])       # ["SOW", "PO", "Invoice" ...]

    # Step 3 — Data Source
    data_sources         = Column(JSON, default=[])       # ["email", "documents", "portal"]
    evidence_retention   = Column(String, default="90d")  # 30d | 90d | 1y | 7y

    # Step 4 — Trigger Config
    trigger_mode         = Column(String, default="event")  # event | scheduled | manual
    trigger_events       = Column(JSON, default=[])          # list of event types
    trigger_frequency    = Column(String, nullable=True)     # Hourly | Daily | Every 6hrs | Weekly | Monthly
    first_eval_date      = Column(String, nullable=True)
    first_eval_time      = Column(String, nullable=True)

    # Step 5 — AI Behaviour
    evaluation_prompt    = Column(Text, nullable=True)       # auto-generated Mistral prompt
    anomaly_triggers     = Column(JSON, default=[])          # list of anomaly trigger names
    confidence_threshold = Column(Integer, default=75)       # 0-100
    auto_actions         = Column(JSON, default=[           # list of enabled auto actions
        "send_email_alert",
        "reduce_risk_score",
        "flag_for_review",
        "create_slm_task"
    ])
    remediation_suggestion = Column(Text, nullable=True)
    store_snapshots      = Column(Boolean, default=True)
    require_approval     = Column(Boolean, default=False)
    truth_gap_detection  = Column(Boolean, default=True)

    # Relational context
    internal_spoc        = Column(String, nullable=True)
    external_spoc        = Column(String, nullable=True)
    truth_validator      = Column(Boolean, default=False)
    has_truth_gap        = Column(Boolean, default=False)

    # Metadata
    last_eval            = Column(String, nullable=True)
    control_source       = Column(String, default="local")  # local | kyudo | grc

    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())

class ControlDocument(Base):
    __tablename__ = "control_documents"

    id          = Column(String, primary_key=True)
    control_id  = Column(String, nullable=False)
    filename    = Column(String, nullable=False)
    file_path   = Column(String, nullable=False)
    doc_type    = Column(String, nullable=False)  # SOW, PO, Invoice, SLA, Contract, NDA, DPA, Other
    uploaded_at = Column(DateTime, default=func.now())
    file_size   = Column(Integer, nullable=True)
