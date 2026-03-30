import uuid
import logging
from sqlalchemy.orm import Session

from ..models.vendor import Vendor
from .risk_scoring import recalculate_vendor_risk

logger = logging.getLogger(__name__)


def mirror_supplier_to_vendor(
    db: Session,
    name: str,
    email: str = "",
    stage: str = "Acquisition",
) -> Vendor:
    """
    Ensures a Vendor record exists for every Library SupplierNode.
    Idempotent — safe to call multiple times for the same supplier name.
    Called after SupplierNode creation so the TPRM page stays in sync.
    """
    existing = db.query(Vendor).filter(Vendor.name == name).first()
    if existing:
        return existing

    vendor = Vendor(
        id=str(uuid.uuid4()),
        name=name,
        email=email or "",
        stage=stage or "Acquisition",
        score=50,
        risk="Medium",
        risk_color="#64748B",
    )
    recalculate_vendor_risk(vendor)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    logger.info(f"Mirrored supplier '{name}' to vendors table (stage: {stage})")
    return vendor
