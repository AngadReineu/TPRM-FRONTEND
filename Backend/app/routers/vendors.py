import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.vendor import Vendor
from ..models.user import User
from ..schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from ..dependencies import get_current_user, get_client_ip, get_optional_user
from typing import Optional
from ..services.audit import AuditService
from ..services.risk_scoring import recalculate_vendor_risk

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("", response_model=List[VendorResponse])
def list_vendors(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_user),
):
    from ..models.library import Division
    
    q = db.query(Vendor)
    if current_user:
        q = q.filter(Vendor.org_id == current_user.org_id)
    if search:
        q = q.filter(Vendor.name.ilike(f"%{search}%"))
    if stage:
        q = q.filter(Vendor.stage == stage)
    
    vendors = q.order_by(Vendor.name).offset(skip).limit(limit).all()
    
    # Populate division_name from divisions table if division_id exists but division_name is missing
    for vendor in vendors:
        if vendor.division_id and not vendor.division_name:
            division = db.query(Division).filter(Division.id == vendor.division_id).first()
            if division:
                vendor.division_name = division.name
    
    return vendors


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: str, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    from ..models.library import Division
    
    if current_user:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.org_id == current_user.org_id).first()
    else:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Populate division_name if division_id exists but division_name is missing
    if vendor.division_id and not vendor.division_name:
        division = db.query(Division).filter(Division.id == vendor.division_id).first()
        if division:
            vendor.division_name = division.name
    
    return vendor


@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(
    payload: VendorCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    vendor = Vendor(
        id=str(uuid.uuid4()), 
        org_id=current_user.org_id if current_user else None,
        **payload.model_dump()
    )
    recalculate_vendor_risk(vendor)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    payload: VendorUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if current_user:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.org_id == current_user.org_id).first()
    else:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
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
    current_user: Optional[User] = Depends(get_optional_user),
):
    if current_user:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.org_id == current_user.org_id).first()
    else:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    name = vendor.name
    db.delete(vendor)
    db.commit()
