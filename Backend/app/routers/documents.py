import uuid
import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.document import Document
from ..models.user import User
from ..schemas.document import DocumentResponse
from ..dependencies import get_current_user, get_client_ip
from ..services.audit import AuditService
from ..config import settings

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    vendor_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Document)
    if vendor_id:
        q = q.filter(Document.vendor_id == vendor_id)
    return q.order_by(Document.created_at.desc()).all()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    vendor_id: Optional[str] = Form(None),
    vendor_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_size_mb}MB limit")

    doc_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "")[1]
    save_name = f"{doc_id}{ext}"
    save_path = os.path.join(settings.upload_dir, save_name)

    os.makedirs(settings.upload_dir, exist_ok=True)
    async with aiofiles.open(save_path, "wb") as f:
        await f.write(contents)

    doc = Document(
        id=doc_id,
        name=save_name,
        original_name=file.filename or save_name,
        mime_type=file.content_type,
        size_bytes=len(contents),
        path=save_path,
        vendor_id=vendor_id,
        vendor_name=vendor_name,
        category=category,
        uploaded_by=current_user.name,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    AuditService.log(
        db, current_user, "PII Configured", doc.original_name,
        f"Document '{doc.original_name}' uploaded", get_client_ip(request),
    )
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.path):
        os.remove(doc.path)

    db.delete(doc)
    db.commit()
    AuditService.log(
        db, current_user, "PII Configured", doc.original_name,
        f"Document '{doc.original_name}' deleted", get_client_ip(request), status="Warning",
    )
