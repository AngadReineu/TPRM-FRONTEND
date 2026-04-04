from pydantic import BaseModel, field_validator
from typing import Optional, Any, List
import re


class StakeholderContact(BaseModel):
    label: str
    email: str


class StakeholderMatrix(BaseModel):
    internal: List[StakeholderContact] = []
    supplier: List[StakeholderContact] = []


class VendorCreate(BaseModel):
    name: str
    division_id: Optional[str] = None
    division_name: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
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
    stakeholder_matrix: Optional[StakeholderMatrix] = None

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v):
        if v and not re.match(r'^[6-9]\d{9}$', v.replace(' ', '')):
            raise ValueError('Invalid mobile number — must be 10 digits starting with 6-9')
        return v

    @field_validator('gst_number')
    @classmethod
    def validate_gst(cls, v):
        if v and not re.match(
            r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
            v.upper()
        ):
            raise ValueError('Invalid GST number format')
        return v.upper() if v else v

    @field_validator('pan_number')
    @classmethod
    def validate_pan(cls, v):
        if v and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', v.upper()):
            raise ValueError('Invalid PAN format')
        return v.upper() if v else v


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    division_id: Optional[str] = None
    division_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
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
    stakeholder_matrix: Optional[StakeholderMatrix] = None
    last_activity: Optional[str] = None

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v):
        if v and not re.match(r'^[6-9]\d{9}$', v.replace(' ', '')):
            raise ValueError('Invalid mobile number — must be 10 digits starting with 6-9')
        return v

    @field_validator('gst_number')
    @classmethod
    def validate_gst(cls, v):
        if v and not re.match(
            r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
            v.upper()
        ):
            raise ValueError('Invalid GST number format')
        return v.upper() if v else v

    @field_validator('pan_number')
    @classmethod
    def validate_pan(cls, v):
        if v and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', v.upper()):
            raise ValueError('Invalid PAN format')
        return v.upper() if v else v


class VendorResponse(BaseModel):
    id: str
    division_id: Optional[str] = None
    division_name: Optional[str] = None
    name: str
    email: str
    mobile: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
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
    stakeholder_matrix: Optional[dict] = None
    last_activity: str

    model_config = {"from_attributes": True}
