from pydantic import BaseModel
from typing import Optional, Any


class VendorCreate(BaseModel):
    name: str
    email: str
    stage: str = "Acquisition"
    stage_color: str = "#0EA5E9"
    score: int = 50
    risk: str = "Medium"
    risk_color: str = "#64748B"
    assessment: str = "pending"
    pii: Any = {"configured": False}
    pii_flow: Optional[str] = None
    contract_end: Optional[str] = None
    contract_warning: bool = False
    agent_id: Optional[str] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    stage: Optional[str] = None
    stage_color: Optional[str] = None
    score: Optional[int] = None
    risk: Optional[str] = None
    risk_color: Optional[str] = None
    assessment: Optional[str] = None
    pii: Optional[Any] = None
    pii_flow: Optional[str] = None
    contract_end: Optional[str] = None
    contract_warning: Optional[bool] = None
    agent_id: Optional[str] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    last_activity: Optional[str] = None


class VendorResponse(BaseModel):
    id: str
    name: str
    email: str
    stage: str
    stage_color: str
    score: int
    risk: str
    risk_color: str
    assessment: str
    pii: Any
    pii_flow: Optional[str] = None
    contract_end: Optional[str] = None
    contract_warning: bool
    agent_id: Optional[str] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    last_activity: str

    model_config = {"from_attributes": True}
