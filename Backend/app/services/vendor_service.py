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
    org_id: str = None,
) -> Vendor:
    """
    Ensures a Vendor record exists for every Library SupplierNode.
    Idempotent — safe to call multiple times for the same supplier name.
    Called after SupplierNode creation so the TPRM page stays in sync.
    """
    q = db.query(Vendor).filter(Vendor.name == name)
    if org_id:
        q = q.filter(Vendor.org_id == org_id)
    existing = q.first()
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
        org_id=org_id,
    )
    recalculate_vendor_risk(vendor)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    logger.info(f"Mirrored supplier '{name}' to vendors table (org: {org_id})")
    return vendor


def mirror_vendor_to_supplier(
    db: Session,
    vendor: Vendor,
) -> None:
    """
    Ensures a SupplierNode record exists for every Vendor.
    Idempotent — safe to call multiple times for the same vendor name.
    """
    from ..models.library import SupplierNode, Division

    existing = db.query(SupplierNode).filter(SupplierNode.name == vendor.name).first()
    if existing:
        return

    # To create a SupplierNode, we need a division. We'll find the first one or create an "Unassigned" division.
    first_div = db.query(Division).first()
    if not first_div:
        import uuid
        first_div = Division(id=str(uuid.uuid4()), name="Default Division")
        db.add(first_div)
        db.commit()
        db.refresh(first_div)

    import uuid
    supplier_node = SupplierNode(
        id=str(uuid.uuid4()),
        division_id=first_div.id,
        name=vendor.name,
        email=vendor.email,
        stage=vendor.stage or "Acquisition",
        phone=vendor.mobile,
        gst=vendor.gst_number,
        pan=vendor.pan_number,
        internal_spoc=vendor.internal_spoc,
        external_spoc=vendor.external_spoc,
        risk_score=vendor.score,
        pii_volume="moderate" if vendor.score < 70 else "low", # rough mapping
        canvas_x=first_div.canvas_x + 100,
        canvas_y=first_div.canvas_y + 100,
    )
    db.add(supplier_node)
    db.commit()
    logger.info(f"Mirrored vendor '{vendor.name}' to supplier_nodes table")
