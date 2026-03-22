from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ControlCreate(BaseModel):
    name: str
    desc: Optional[str] = None
    category: str = "Process"
    personality: Optional[str] = None
    risk: str = "Medium"
    active: bool = True
    coverage: int = 0
    slm_tasks: List[str] = []
    supplier_scope: List[str] = []
    lifecycle_stage: Optional[str] = None
    communication_scope: Dict[str, str] = {}
    document_scope: List[str] = []
    data_sources: List[str] = ["email", "documents", "portal"]
    evidence_retention: str = "90d"
    trigger_mode: str = "event"
    trigger_events: List[str] = []
    trigger_frequency: Optional[str] = None
    first_eval_date: Optional[str] = None
    first_eval_time: Optional[str] = None
    evaluation_prompt: Optional[str] = None
    anomaly_triggers: List[str] = []
    confidence_threshold: int = 75
    auto_actions: List[str] = ["send_email_alert", "reduce_risk_score", "flag_for_review", "create_slm_task"]
    remediation_suggestion: Optional[str] = None
    store_snapshots: bool = True
    require_approval: bool = False
    truth_gap_detection: bool = True
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    truth_validator: bool = False
    has_truth_gap: bool = False
    control_source: str = "local"


class ControlUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    category: Optional[str] = None
    personality: Optional[str] = None
    risk: Optional[str] = None
    active: Optional[bool] = None
    coverage: Optional[int] = None
    slm_tasks: Optional[List[str]] = None
    supplier_scope: Optional[List[str]] = None
    lifecycle_stage: Optional[str] = None
    communication_scope: Optional[Dict[str, str]] = None
    document_scope: Optional[List[str]] = None
    data_sources: Optional[List[str]] = None
    evidence_retention: Optional[str] = None
    trigger_mode: Optional[str] = None
    trigger_events: Optional[List[str]] = None
    trigger_frequency: Optional[str] = None
    first_eval_date: Optional[str] = None
    first_eval_time: Optional[str] = None
    evaluation_prompt: Optional[str] = None
    anomaly_triggers: Optional[List[str]] = None
    confidence_threshold: Optional[int] = None
    auto_actions: Optional[List[str]] = None
    remediation_suggestion: Optional[str] = None
    store_snapshots: Optional[bool] = None
    require_approval: Optional[bool] = None
    truth_gap_detection: Optional[bool] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    truth_validator: Optional[bool] = None
    has_truth_gap: Optional[bool] = None
    last_eval: Optional[str] = None


class ControlResponse(BaseModel):
    id: str
    name: str
    desc: Optional[str] = None
    category: str
    personality: Optional[str] = None
    risk: str
    active: bool
    coverage: int
    slm_tasks: List[str] = []
    supplier_scope: List[str] = []
    lifecycle_stage: Optional[str] = None
    communication_scope: Dict[str, Any] = {}
    document_scope: List[str] = []
    data_sources: List[str] = []
    evidence_retention: str = "90d"
    trigger_mode: str = "event"
    trigger_events: List[str] = []
    trigger_frequency: Optional[str] = None
    first_eval_date: Optional[str] = None
    first_eval_time: Optional[str] = None
    evaluation_prompt: Optional[str] = None
    anomaly_triggers: List[str] = []
    confidence_threshold: int = 75
    auto_actions: List[str] = []
    remediation_suggestion: Optional[str] = None
    store_snapshots: bool = True
    require_approval: bool = False
    truth_gap_detection: bool = True
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    truth_validator: bool = False
    has_truth_gap: bool = False
    last_eval: Optional[str] = None
    control_source: str = "local"

    model_config = {"from_attributes": True}
