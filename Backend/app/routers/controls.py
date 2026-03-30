import uuid
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.control import Control, ControlDocument
from ..models.user import User
from ..schemas.control import ControlCreate, ControlUpdate, ControlResponse
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService
from ..config import settings

router = APIRouter(prefix="/controls", tags=["controls"])


@router.get("", response_model=List[ControlResponse])
def list_controls(db: Session = Depends(get_db)):
    return db.query(Control).order_by(Control.category, Control.name).all()


@router.get("/{control_id}", response_model=ControlResponse)
def get_control(control_id: str, db: Session = Depends(get_db)):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    return control


@router.post("", response_model=ControlResponse, status_code=status.HTTP_201_CREATED)
def create_control(
    payload: ControlCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = Control(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(control)
    db.commit()
    db.refresh(control)
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' created", get_client_ip(request))
    return control


@router.patch("/{control_id}", response_model=ControlResponse)
def update_control(
    control_id: str,
    payload: ControlUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(control, field, value)
    db.commit()
    db.refresh(control)
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' updated", get_client_ip(request))
    return control


@router.patch("/{control_id}/toggle", response_model=ControlResponse)
def toggle_control(
    control_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    control.active = not control.active
    db.commit()
    db.refresh(control)
    state = "enabled" if control.active else "disabled"
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' {state}", get_client_ip(request))
    return control


@router.delete("/{control_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_control(
    control_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    db.delete(control)
    db.commit()
    AuditService.log(db, current_user, "Control Updated", control.name,
                     f"Control '{control.name}' deleted", get_client_ip(request), status="Warning")

UPLOAD_DIR = settings.upload_dir_controls

@router.get("/{control_id}/documents")
def list_documents(control_id: str, db: Session = Depends(get_db)):
    return db.query(ControlDocument).filter(ControlDocument.control_id == control_id).order_by(ControlDocument.uploaded_at.desc()).all()


@router.post("/{control_id}/documents", status_code=201)
def upload_document(
    control_id: str,
    request: Request,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    control_dir = os.path.join(UPLOAD_DIR, control_id)
    os.makedirs(control_dir, exist_ok=True)
    
    file_path = os.path.join(control_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    
    doc = ControlDocument(
        id=str(uuid.uuid4()),
        control_id=control_id,
        filename=file.filename,
        file_path=file_path,
        doc_type=doc_type,
        file_size=file_size
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    AuditService.log(db, current_user, "Document Uploaded", doc.filename,
                     f"Document '{doc.filename}' ({doc.doc_type}) uploaded to control", get_client_ip(request))
                     
    return doc


@router.delete("/{control_id}/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    control_id: str,
    doc_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(ControlDocument).filter(ControlDocument.id == doc_id, ControlDocument.control_id == control_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    db.delete(doc)
    db.commit()
    
    AuditService.log(db, current_user, "Document Deleted", doc.filename,
                     f"Document '{doc.filename}' deleted from control", get_client_ip(request), status="Warning")


@router.get("/{control_id}/documents/{doc_id}/download")
def download_document(control_id: str, doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(ControlDocument).filter(ControlDocument.id == doc_id, ControlDocument.control_id == control_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.filename)
