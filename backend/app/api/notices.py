from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from typing import List, Optional
from app.schemas.notice import NoticeCreate, NoticeUpdate, NoticeResponse, AIAnalysisResult
from app.services.notice_service import (
    analyze_notice_text,
    create_notice,
    get_notices,
    get_notice_by_id,
    update_notice,
    delete_notice
)
from app.services.notification_service import create_notification
from app.ocr.document_parser import extract_document_text
from app.api.auth import get_current_user, require_admin, require_user

router = APIRouter(prefix="/notices", tags=["Notices"])

@router.post("/upload")
async def upload_notice_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_user)
):
    """
    Accepts PDF, PNG, JPG, DOCX, TXT files.
    Performs Text Extraction (PyMuPDF / OCR) and runs the entire AI Intelligence pipeline.
    """
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    try:
        file_bytes = await file.read(10 * 1024 * 1024 + 1)
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Maximum upload size is 10 MB")
        extracted_text = extract_document_text(file.filename, file_bytes)
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to extract meaningful text from document. Please ensure the file contains legible content."
            )
        
        analysis = analyze_notice_text(extracted_text)
        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(e)}"
        )

@router.post("/analyze", response_model=AIAnalysisResult)
async def analyze_raw_notice(payload: dict):
    """
    Runs the NEXA AI pipeline on pasted or input text and returns full structured intelligence.
    """
    raw_content = payload.get("content", "")
    if not isinstance(raw_content, str) or len(raw_content) > 20000:
        raise HTTPException(status_code=422, detail="Content must be text of at most 20,000 characters")
    content = raw_content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content must not be empty"
        )
    category = payload.get("category")
    return analyze_notice_text(content, override_category=category)

@router.get("", response_model=List[NoticeResponse])
async def list_notices(
    category: Optional[str] = Query(None),
    importance: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: Optional[dict] = Depends(get_current_user)
):
    docs = await get_notices(
        category=category,
        importance_level=importance,
        urgency_level=urgency,
        search=search,
        status=status if current_user and current_user.get("role") == "ADMIN" else "PUBLISHED",
        limit=limit
    )
    return docs

@router.post("", response_model=NoticeResponse)
async def create_new_notice(
    notice_in: NoticeCreate,
    current_user: dict = Depends(require_admin)
):
    doc = await create_notice(notice_in.model_dump(), user_id=current_user["_id"])
    
    # Fire notification for critical or high-priority notices
    if doc.get("importance_level") in ["CRITICAL", "HIGH"]:
        badge = "🔴 Critical Notice" if doc.get("importance_level") == "CRITICAL" else "🟡 High Priority Notice"
        await create_notification(
            title=f"{badge}: {doc['title']}",
            message=doc["summary"][:120] + "...",
            notice_id=doc["_id"],
            importance_score=doc["importance"],
            notification_type=doc["importance_level"]
        )

    return doc

@router.get("/{notice_id}", response_model=NoticeResponse)
async def get_single_notice(notice_id: str, current_user: Optional[dict] = Depends(get_current_user)):
    doc = await get_notice_by_id(notice_id)
    if not doc or (doc.get("status") != "PUBLISHED" and (not current_user or current_user.get("role") != "ADMIN")):
        raise HTTPException(status_code=404, detail="Notice not found")
    return doc

@router.put("/{notice_id}", response_model=NoticeResponse)
async def update_single_notice(
    notice_id: str,
    notice_in: NoticeUpdate,
    current_user: dict = Depends(require_admin)
):
    updates = {k: v for k, v in notice_in.model_dump().items() if v is not None}
    doc = await update_notice(notice_id, updates)
    if not doc:
        raise HTTPException(status_code=404, detail="Notice not found")
    return doc

@router.delete("/{notice_id}")
async def delete_single_notice(
    notice_id: str,
    current_user: dict = Depends(require_admin)
):
    success = await delete_notice(notice_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notice not found")
    return {"message": "Notice deleted successfully"}
