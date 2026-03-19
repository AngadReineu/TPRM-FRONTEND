from pydantic import BaseModel
from typing import Optional, List, Any


class OrgNode(BaseModel):
    id: str
    name: str
    canvas_x: float
    canvas_y: float

    model_config = {"from_attributes": True}


class DivisionResponse(BaseModel):
    id: str
    name: str
    canvas_x: float
    canvas_y: float
    lifecycle_stage: Optional[str] = None

    model_config = {"from_attributes": True}


class DivisionCreate(BaseModel):
    name: str
    canvas_x: float = 400.0
    canvas_y: float = 300.0
    lifecycle_stage: Optional[str] = None


class SupplierNodeResponse(BaseModel):
    id: str
    division_id: str
    canvas_x: float
    canvas_y: float
    name: str
    email: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    gst: Optional[str] = None
    pan: Optional[str] = None
    stage: str
    risk_score: Optional[int] = None
    pii_volume: str
    pii_flow: Optional[str] = None
    pii_types: List[str] = []
    has_truth_gap: bool
    declared_pii: List[str] = []
    detected_pii: List[str] = []
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    contract_start: Optional[str] = None
    contract_end: Optional[str] = None
    frequency: Optional[str] = None
    lifecycles: List[str] = []
    stakeholders: Any = {}

    model_config = {"from_attributes": True}


class SupplierNodeCreate(BaseModel):
    division_id: str
    name: str
    canvas_x: float = 200.0
    canvas_y: float = 200.0
    email: Optional[str] = None
    stage: str = "Acquisition"
    pii_volume: str = "low"
    pii_flow: Optional[str] = None
    pii_types: List[str] = []


class SupplierNodeUpdate(BaseModel):
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    name: Optional[str] = None
    email: Optional[str] = None
    stage: Optional[str] = None
    risk_score: Optional[int] = None
    pii_volume: Optional[str] = None
    pii_flow: Optional[str] = None
    pii_types: Optional[List[str]] = None
    has_truth_gap: Optional[bool] = None
    declared_pii: Optional[List[str]] = None
    detected_pii: Optional[List[str]] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    contract_end: Optional[str] = None
    frequency: Optional[str] = None
    lifecycles: Optional[List[str]] = None
    stakeholders: Optional[Any] = None


class SystemNodeResponse(BaseModel):
    id: str
    division_id: str
    canvas_x: float
    canvas_y: float
    name: str
    type: str
    data_source: Optional[str] = None
    pii_types: List[str] = []
    vuln_score: Optional[int] = None
    stage: Optional[str] = None
    internal_spoc: Optional[str] = None
    authorized_pii: List[str] = []
    has_stage_discrepancy: bool
    discrepancy_fields: List[str] = []
    agent_reasoning: Optional[Any] = None
    linked_supplier_id: Optional[str] = None

    model_config = {"from_attributes": True}


class SystemNodeCreate(BaseModel):
    division_id: str
    name: str
    type: str = "crm"
    canvas_x: float = 200.0
    canvas_y: float = 200.0
    linked_supplier_id: Optional[str] = None


class SystemNodeUpdate(BaseModel):
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    name: Optional[str] = None
    type: Optional[str] = None
    data_source: Optional[str] = None
    pii_types: Optional[List[str]] = None
    vuln_score: Optional[int] = None
    stage: Optional[str] = None
    authorized_pii: Optional[List[str]] = None
    has_stage_discrepancy: Optional[bool] = None
    discrepancy_fields: Optional[List[str]] = None
    linked_supplier_id: Optional[str] = None


class GraphResponse(BaseModel):
    org: OrgNode
    divisions: List[DivisionResponse]
    suppliers: List[SupplierNodeResponse]
    systems: List[SystemNodeResponse]


class HealthcareStageResponse(BaseModel):
    id: str
    label: str
    color: str
    systems: List[Any]
    suppliers: List[Any]
