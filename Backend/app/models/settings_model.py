from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from ..database import Base


class OrgSettings(Base):
    __tablename__ = "org_settings"

    id                   = Column(String, primary_key=True, default="global")

    # Org
    org_name             = Column(String, default="ABC Corp")
    org_industry         = Column(String, default="Financial Services")
    org_country          = Column(String, default="India")
    org_timezone         = Column(String, default="Asia/Kolkata")

    # Notifications
    notify_email         = Column(Boolean, default=True)
    notify_slack         = Column(Boolean, default=False)
    notify_critical_only = Column(Boolean, default=False)

    # AI Config
    ai_model             = Column(String, default="claude-sonnet-4-6")
    ai_temperature       = Column(String, default="0.3")
    ai_reasoning_visible = Column(Boolean, default=True)

    # Compliance frameworks enabled
    compliance_frameworks = Column(JSON, default=["ISO 27001", "GDPR", "SOC 2"])

    # Portal settings
    portal_logo_url      = Column(String, nullable=True)
    portal_accent_color  = Column(String, default="#0EA5E9")
    portal_welcome_msg   = Column(Text, nullable=True)

    # Integrations — stored as JSON list of { name, connected, config }
    integrations         = Column(JSON, default=[])

    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())
