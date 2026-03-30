import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Any

from ..database import get_db
from ..models.library import Organisation, Division, SupplierNode, SystemNode
from ..models.user import User
from ..models.vendor import Vendor
from ..schemas.library import (
    GraphResponse, OrgNode, DivisionResponse, DivisionCreate,
    SupplierNodeResponse, SupplierNodeCreate, SupplierNodeUpdate,
    SystemNodeResponse, SystemNodeCreate, SystemNodeUpdate,
    HealthcareStageResponse,
)
from ..dependencies import get_current_user
from ..services.vendor_service import mirror_supplier_to_vendor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/library", tags=["library"])


# ── Full graph snapshot ────────────────────────────────────

@router.get("/graph", response_model=GraphResponse)
def get_graph(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organisation).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not initialised")

    divisions  = db.query(Division).all()
    suppliers  = db.query(SupplierNode).all()
    systems    = db.query(SystemNode).all()

    return GraphResponse(
        org=OrgNode.model_validate(org),
        divisions=[DivisionResponse.model_validate(d) for d in divisions],
        suppliers=[SupplierNodeResponse.model_validate(s) for s in suppliers],
        systems=[SystemNodeResponse.model_validate(s) for s in systems],
    )


# ── Organisation canvas position ───────────────────────────

@router.patch("/org/position")
def update_org_position(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organisation).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    if "canvas_x" in payload:
        org.canvas_x = payload["canvas_x"]
    if "canvas_y" in payload:
        org.canvas_y = payload["canvas_y"]
    db.commit()
    return {"ok": True}


# ── Divisions ──────────────────────────────────────────────

@router.post("/divisions", response_model=DivisionResponse, status_code=201)
def create_division(
    payload: DivisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    div = Division(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(div)
    db.commit()
    db.refresh(div)
    return div


@router.patch("/divisions/{div_id}", response_model=DivisionResponse)
def update_division(
    div_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    div = db.query(Division).filter(Division.id == div_id).first()
    if not div:
        raise HTTPException(status_code=404, detail="Division not found")
    for k, v in payload.items():
        if hasattr(div, k):
            setattr(div, k, v)
    db.commit()
    db.refresh(div)
    return div


@router.delete("/divisions/{div_id}", status_code=204)
def delete_division(
    div_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    div = db.query(Division).filter(Division.id == div_id).first()
    if not div:
        raise HTTPException(status_code=404, detail="Division not found")

    # Cascade: delete child system_nodes and supplier_nodes first
    supplier_ids = [s.id for s in db.query(SupplierNode).filter(SupplierNode.division_id == div_id).all()]
    if supplier_ids:
        db.query(SystemNode).filter(SystemNode.linked_supplier_id.in_(supplier_ids)).delete(synchronize_session=False)
    db.query(SystemNode).filter(SystemNode.division_id == div_id).delete(synchronize_session=False)
    db.query(SupplierNode).filter(SupplierNode.division_id == div_id).delete(synchronize_session=False)

    db.delete(div)
    db.commit()


# ── Supplier nodes ─────────────────────────────────────────

@router.post("/suppliers", response_model=SupplierNodeResponse, status_code=201)
def create_supplier_node(
    payload: SupplierNodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = SupplierNode(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(node)
    db.commit()
    db.refresh(node)

    # ── Mirror into vendors table so TPRM page picks it up ──
    try:
        mirror_supplier_to_vendor(
            db,
            name=payload.name,
            email=getattr(payload, "email", "") or "",
            stage=getattr(payload, "stage", "Acquisition") or "Acquisition",
        )
    except Exception as e:
        logger.error(f"Vendor mirror failed: {e}")
        db.rollback()

    return node



@router.patch("/suppliers/{node_id}", response_model=SupplierNodeResponse)
def update_supplier_node(
    node_id: str,
    payload: SupplierNodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = db.query(SupplierNode).filter(SupplierNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Supplier node not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node


@router.delete("/suppliers/{node_id}", status_code=204)
def delete_supplier_node(
    node_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = db.query(SupplierNode).filter(SupplierNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Supplier node not found")

    # Cascade: delete any system_nodes linked to this supplier first
    db.query(SystemNode).filter(SystemNode.linked_supplier_id == node_id).delete(synchronize_session=False)

    db.delete(node)
    db.commit()


# ── System nodes ───────────────────────────────────────────

@router.post("/systems", response_model=SystemNodeResponse, status_code=201)
def create_system_node(
    payload: SystemNodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = SystemNode(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


@router.patch("/systems/{node_id}", response_model=SystemNodeResponse)
def update_system_node(
    node_id: str,
    payload: SystemNodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = db.query(SystemNode).filter(SystemNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="System node not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node


@router.delete("/systems/{node_id}", status_code=204)
def delete_system_node(
    node_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = db.query(SystemNode).filter(SystemNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="System node not found")
    db.delete(node)
    db.commit()


# ── Healthcare library view ────────────────────────────────

@router.get("/healthcare", response_model=List[Any])
def get_healthcare_stages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the healthcare lifecycle stage data.
    Stored as static seed data — returns divisions with their
    suppliers grouped by lifecycle stage.
    """
    stages_order = ["Acquisition", "Retention", "Upgradation", "Offboarding"]
    stage_colors = {
        "Acquisition": "#0EA5E9",
        "Retention":   "#10B981",
        "Upgradation": "#F59E0B",
        "Offboarding": "#94A3B8",
    }

    result = []
    for stage in stages_order:
        divs = db.query(Division).filter(Division.lifecycle_stage == stage).all()
        suppliers = []
        systems = []
        for div in divs:
            sups = db.query(SupplierNode).filter(SupplierNode.division_id == div.id).all()
            syss = db.query(SystemNode).filter(SystemNode.division_id == div.id).all()
            suppliers.extend([SupplierNodeResponse.model_validate(s).model_dump() for s in sups])
            systems.extend([SystemNodeResponse.model_validate(s).model_dump() for s in syss])

        result.append({
            "id": stage.lower(),
            "label": stage,
            "color": stage_colors[stage],
            "suppliers": suppliers,
            "systems": systems,
        })

    return result
