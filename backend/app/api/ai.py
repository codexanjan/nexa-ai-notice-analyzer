from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.ai.preprocessing import clean_text
from app.ai.classifier import classify_notice
from app.ai.entity_extractor import extract_all_entities
from app.ai.importance_engine import calculate_importance
from app.ai.urgency_engine import calculate_urgency
from app.ai.summarizer import generate_summary
from app.services.notice_service import analyze_notice_text

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/classify")
def classify_endpoint(payload: Dict[str, Any]):
    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    return classify_notice(content)

@router.post("/summarize")
def summarize_endpoint(payload: Dict[str, Any]):
    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    return {"summary": generate_summary(content)}

@router.post("/extract")
def extract_endpoint(payload: Dict[str, Any]):
    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    return extract_all_entities(content)

@router.post("/importance")
def importance_endpoint(payload: Dict[str, Any]):
    content = payload.get("content", "").strip()
    category = payload.get("category", "GENERAL")
    deadline = payload.get("deadline")
    event_date = payload.get("event_date")
    actions = payload.get("actions", [])
    return calculate_importance(category, content, deadline, event_date, actions)

@router.post("/analyze")
def analyze_endpoint(payload: Dict[str, Any]):
    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    category = payload.get("category")
    return analyze_notice_text(content, override_category=category)
