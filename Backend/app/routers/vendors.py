import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.vendor import Vendor
from ..models.user import User
from ..schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService
from ..services.risk_scoring import recalculate_vendor_risk
from sqlalchemy import func

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("", response_model=List[VendorResponse])
def list_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
):
    q = db.query(Vendor)
    if current_user.org_id:
        q = q.filter(Vendor.org_id == current_user.org_id)
    if search:
        q = q.filter(Vendor.name.ilike(f"%{search}%"))
    if stage:
        q = q.filter(Vendor.stage == stage)
    return q.order_by(Vendor.name).offset(skip).limit(limit).all()


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(
    payload: VendorCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Duplicate validation
    existing = db.query(Vendor).filter(
        (func.lower(Vendor.name) == payload.name.lower()) | 
        (func.lower(Vendor.email) == payload.email.lower())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vendor with this name or email already exists")

    data = payload.model_dump()
    # Convert StakeholderMatrix pydantic model to dict for JSON column
    if data.get('stakeholder_matrix') and payload.stakeholder_matrix:
        data['stakeholder_matrix'] = payload.stakeholder_matrix.model_dump()
    vendor = Vendor(
        id=str(uuid.uuid4()), 
        org_id=current_user.org_id,
        **data
    )
    recalculate_vendor_risk(vendor)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    
    from ..services.vendor_service import mirror_vendor_to_supplier
    mirror_vendor_to_supplier(db, vendor)
    
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    payload: VendorUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Duplicate validation on update
    name = update_data.get("name", vendor.name)
    email = update_data.get("email", vendor.email)
    existing = db.query(Vendor).filter(
        ((func.lower(Vendor.name) == name.lower()) | (func.lower(Vendor.email) == email.lower())),
        Vendor.id != vendor_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Another vendor with this name or email already exists")

    # Convert StakeholderMatrix pydantic model to dict for JSON column
    if 'stakeholder_matrix' in update_data and payload.stakeholder_matrix:
        update_data['stakeholder_matrix'] = payload.stakeholder_matrix.model_dump()

    for field, value in update_data.items():
        setattr(vendor, field, value)

    recalculate_vendor_risk(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(
    vendor_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    name = vendor.name
    db.delete(vendor)
    db.commit()
