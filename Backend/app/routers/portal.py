import uuid
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, Dict

from ..database import get_db
from ..models.vendor import Vendor
from ..models.user import User
from ..dependencies import get_current_user
from ..services.audit import AuditService
from ..services.risk_scoring import recalculate_vendor_risk

router = APIRouter(prefix="/portal", tags=["portal"])


# ── Risk score calculation from portal answers ─────────────────────────────
def calculate_risk_score_from_answers(answers: Dict[str, Any]) -> int:
    """
    Calculate a risk score (0-100) from supplier portal answers.
    Higher score = higher risk.
    """
    score = 50  # Start at medium risk

    # Security questions (Step 4) — negative answers increase risk
    risk_increasing = [
        'L_mfa',           # MFA not enforced
        'I_patch',         # No patch management
        'I_vulnerability',  # No vulnerability scanning
        'H_encryption',    # No encryption in transit
        'G_sdlc',          # No secure SDLC
        'Q_soc2',          # No SOC2/ISO cert
        'Q_pentest',       # No penetration testing
        'Q_incident',      # No incident response plan
        'E_breach',        # Had a breach (historic)
        'C_regulatory',    # Regulatory violations
    ]

    risk_decreasing = [
        'Q_iso27001',      # ISO 27001 certified
        'Q_soc2_type2',    # SOC2 Type II
        'L_rbac',          # RBAC implemented
        'I_monitoring',    # 24/7 monitoring
        'H_tls',           # TLS 1.2+ enforced
    ]

    for key in risk_increasing:
        val = answers.get(key)
        if val == 'no' or val is False:
            score += 5
        elif val == 'yes' or val is True:
            score -= 3

    for key in risk_decreasing:
        val = answers.get(key)
        if val == 'yes' or val is True:
            score -= 5
        elif val == 'no' or val is False:
            score += 3

    # Document uploads reduce risk
    doc_keys = [
        'doc_info_security_policy', 'doc_data_privacy_policy',
        'doc_bcp', 'doc_cyber_insurance', 'doc_iso_soc',
    ]
    docs_uploaded = sum(1 for k in doc_keys if answers.get(k) == 'uploaded')
    score -= docs_uploaded * 3  # Each required doc reduces risk

    # Clamp to 0-100
    return max(0, min(100, score))


def score_to_risk_level(score: int) -> tuple[str, str]:
    """Convert numeric score to risk level and color."""
    if score >= 75:
        return 'Critical', '#EF4444'
    elif score >= 50:
        return 'High', '#F59E0B'
    elif score >= 25:
        return 'Medium', '#64748B'
    else:
        return 'Low', '#10B981'


# ── Token storage (in production use Redis or a DB table) ──────────────────
# For now store in vendor.pii JSON field as portal_token
# In production add a portal_tokens table

def get_vendor_by_token(token: str, db: Session) -> Vendor | None:
    """Find vendor where portal_token matches."""
    vendors = db.query(Vendor).all()
    for v in vendors:
        pii = v.pii or {}
        if isinstance(pii, dict) and pii.get('portal_token') == token:
            return v
    return None


# ── Routes ─────────────────────────────────────────────────────────────────

@router.get("/{token}")
def validate_portal_token(token: str, db: Session = Depends(get_db)):
    """
    Validate a supplier portal token.
    Returns vendor info if valid.
    Called by the frontend before showing the portal.
    """
    vendor = get_vendor_by_token(token, db)

    if not vendor:
        raise HTTPException(status_code=404, detail="Invalid portal token")

    pii = vendor.pii or {}

    # Check if already submitted
    if pii.get('portal_submitted'):
        raise HTTPException(status_code=409, detail="Assessment already submitted")

    # Check expiry (tokens valid for 30 days)
    issued_at = pii.get('portal_token_issued_at')
    if issued_at:
        issued = datetime.fromisoformat(issued_at)
        if datetime.utcnow() > issued + timedelta(days=30):
            raise HTTPException(status_code=410, detail="Portal token expired")

    return {
        "vendor_id":    vendor.id,
        "vendor_name":  vendor.name,
        "vendor_email": vendor.email,
        "stage":        vendor.stage,
    }


class PortalSubmission(BaseModel):
    vendor_id: str
    answers: Dict[str, Any]


@router.post("/{token}/submit")
def submit_portal_assessment(
    token: str,
    payload: PortalSubmission,
    db: Session = Depends(get_db),
):
    """
    Submit supplier portal assessment.
    Calculates risk score and updates vendor record.
    """
    vendor = get_vendor_by_token(token, db)

    if not vendor:
        raise HTTPException(status_code=404, detail="Invalid portal token")

    pii = vendor.pii or {}
    if pii.get('portal_submitted'):
        raise HTTPException(status_code=409, detail="Already submitted")

    # Calculate risk score from answers
    risk_score = calculate_risk_score_from_answers(payload.answers)
    risk_level, risk_color = score_to_risk_level(risk_score)

    # Update vendor record
    vendor.score      = risk_score
    vendor.risk       = risk_level
    vendor.risk_color = risk_color
    vendor.assessment = 'complete'

    # Mark token as used and store answers
    pii['portal_submitted']    = True
    pii['portal_submitted_at'] = datetime.utcnow().isoformat()
    pii['portal_answers']      = payload.answers
    vendor.pii = pii

    db.commit()
    db.refresh(vendor)

    return {
        "status":     "submitted",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "vendor_id":  vendor.id,
    }


# ── Send portal link (called by Risk Manager from Vendors page) ────────────

class SendPortalRequest(BaseModel):
    vendor_id: str


@router.post("/send/{vendor_id}")
def send_portal_link(
    vendor_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a portal token and send the link to the supplier.
    Called when Risk Manager clicks 'Send Portal Link' on a vendor.
    """
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Generate secure token
    token = secrets.token_urlsafe(32)

    # Store token on vendor
    pii = vendor.pii or {}
    pii['portal_token']          = token
    pii['portal_token_issued_at'] = datetime.utcnow().isoformat()
    pii['portal_submitted']      = False
    vendor.pii        = pii
    vendor.assessment = 'pending'
    db.commit()

    # Build the portal URL
    base_url = str(request.base_url).rstrip('/')
    portal_url = f"{base_url}/portal/{token}"

    # TODO: Send email via SMTP when email service is set up
    # For now return the URL so it can be copied/displayed in the UI
    # smtp_service.send(to=vendor.email, subject="Complete your risk assessment", body=portal_url)

    AuditService.log(
        db=db,
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        action="Portal Link Sent",
        entity_type="Vendor",
        entity_id=vendor.id,
        description=f"Portal assessment link sent to {vendor.name} ({vendor.email})",
        ip_address=request.client.host if request.client else "unknown",
        status="success",
    )

    return {
        "portal_url": portal_url,
        "token":      token,
        "vendor_id":  vendor.id,
        "email":      vendor.email,
        "message":    f"Portal link generated for {vendor.name}. Email sending requires SMTP configuration.",
    }