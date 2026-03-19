from pydantic import BaseModel
from typing import Optional, List, Any


class SettingsUpdate(BaseModel):
    org_name: Optional[str] = None
    org_industry: Optional[str] = None
    org_country: Optional[str] = None
    org_timezone: Optional[str] = None
    notify_email: Optional[bool] = None
    notify_slack: Optional[bool] = None
    notify_critical_only: Optional[bool] = None
    ai_model: Optional[str] = None
    ai_temperature: Optional[str] = None
    ai_reasoning_visible: Optional[bool] = None
    compliance_frameworks: Optional[List[str]] = None
    portal_logo_url: Optional[str] = None
    portal_accent_color: Optional[str] = None
    portal_welcome_msg: Optional[str] = None
    integrations: Optional[List[Any]] = None


class SettingsResponse(BaseModel):
    id: str
    org_name: str
    org_industry: str
    org_country: str
    org_timezone: str
    notify_email: bool
    notify_slack: bool
    notify_critical_only: bool
    ai_model: str
    ai_temperature: str
    ai_reasoning_visible: bool
    compliance_frameworks: List[str]
    portal_logo_url: Optional[str] = None
    portal_accent_color: str
    portal_welcome_msg: Optional[str] = None
    integrations: List[Any] = []

    model_config = {"from_attributes": True}
