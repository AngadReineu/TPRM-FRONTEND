from pydantic import BaseModel
from typing import Optional


class ControlCreate(BaseModel):
    name: str
    desc: Optional[str] = None
    category: str
    active: bool = True
    coverage: int = 0
    scope: str = "Partial"
    risk: str = "Medium"
    last_eval: Optional[str] = None
    deps: int = 0
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    pii_flow: Optional[str] = None
    truth_validator: bool = False
    has_truth_gap: bool = False
    personality: Optional[str] = None


class ControlUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    category: Optional[str] = None
    active: Optional[bool] = None
    coverage: Optional[int] = None
    scope: Optional[str] = None
    risk: Optional[str] = None
    last_eval: Optional[str] = None
    deps: Optional[int] = None
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    pii_flow: Optional[str] = None
    truth_validator: Optional[bool] = None
    has_truth_gap: Optional[bool] = None
    personality: Optional[str] = None


class ControlResponse(BaseModel):
    id: str
    name: str
    desc: Optional[str] = None
    category: str
    active: bool
    coverage: int
    scope: str
    risk: str
    last_eval: Optional[str] = None
    deps: int
    internal_spoc: Optional[str] = None
    external_spoc: Optional[str] = None
    pii_flow: Optional[str] = None
    truth_validator: bool
    has_truth_gap: bool
    personality: Optional[str] = None

    model_config = {"from_attributes": True}
