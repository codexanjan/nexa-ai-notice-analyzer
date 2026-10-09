import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import db_manager
from app.ai.preprocessing import clean_text, extract_keywords
from app.ai.classifier import classify_notice
from app.ai.entity_extractor import extract_all_entities
from app.ai.importance_engine import calculate_importance
from app.ai.urgency_engine import calculate_urgency
from app.ai.summarizer import generate_summary
from app.ai.explainability import generate_explanation

def analyze_notice_text(text: str, override_category: Optional[str] = None, deadline_override: Optional[str] = None, event_date_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes the entire NEXA AI Intelligence Pipeline on raw notice text:
    Text Extraction -> Cleaning -> Classification -> Entity Extraction ->
    Deadline Extraction -> Importance Scoring -> Urgency Scoring ->
    Summary Generation -> Action Extraction -> Explainable AI.
    """
    cleaned = clean_text(text)
    
    # 1. Classification
    if override_category:
        cls_result = {"value": override_category.upper(), "confidence": 1.0}
    else:
        cls_result = classify_notice(cleaned)
    category = cls_result["value"]
    confidence = cls_result["confidence"]

    # 2. Entity & Deadline & Action Extraction
    entities = extract_all_entities(cleaned)
    deadline = deadline_override or entities.get("deadline")
    event_date = event_date_override or entities.get("date")
    entities["deadline"] = deadline
    entities["date"] = event_date
    event_time = entities.get("time")
    actions = entities.get("actions", [])

    # 3. Keywords
    keywords = extract_keywords(cleaned, max_keywords=6)

    # 4. Importance Calculation (Exact formula)
    imp_result = calculate_importance(
        category=category,
        text=cleaned,
        deadline_str=deadline,
        event_date_str=event_date,
        actions=actions
    )
    score = imp_result["score"]
    level = imp_result["level"]
    factors = imp_result["factors"]

    # 5. Urgency Calculation
    d_score = factors.get("deadline_proximity", 0)
    e_score = factors.get("event_proximity", 0)
    k_score = factors.get("consequence", 0)
    urg_result = calculate_urgency(d_score, e_score, k_score)

    # 6. Factual Summary Generation
    summary = generate_summary(cleaned)

    # 7. Explainable AI Generation
    reasons = generate_explanation(
        category=category,
        importance_score=score,
        importance_level=level,
        factors=factors,
        has_deadline=bool(deadline),
        has_action=bool(actions),
        has_event=bool(event_date)
    )

    return {
        "category": {
            "value": category,
            "confidence": confidence
        },
        "importance": {
            "score": score,
            "level": level
        },
        "urgency": {
            "level": urg_result["level"],
            "score": urg_result["score"],
            "confidence": urg_result["confidence"]
        },
        "summary": summary,
        "entities": entities,
        "actions": actions,
        "keywords": keywords,
        "explanation": reasons,
        "explanation_factors": {
            "category_criticality": factors["category_criticality"],
            "deadline_proximity": factors["deadline_proximity"],
            "action_required": factors["action_required"],
            "urgency_signals": factors["urgency_signals"],
            "consequence": factors["consequence"],
            "event_proximity": factors["event_proximity"],
            "weights": {
                "category_criticality": 0.20,
                "deadline_proximity": 0.25,
                "action_required": 0.20,
                "urgency_signals": 0.15,
                "consequence": 0.10,
                "event_proximity": 0.10
            }
        }
    }

async def create_notice(data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    notices_col = db_manager.get_collection("notices")
    content = data["content"]
    title = data.get("title") or content[:50]
    
    # Run AI pipeline
    analysis = analyze_notice_text(content, override_category=data.get("category"), deadline_override=data.get("deadline"), event_date_override=data.get("event_date"))
    
    notice_doc = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "content": content,
        "category": analysis["category"]["value"],
        "confidence": analysis["category"]["confidence"],
        "importance": analysis["importance"]["score"],
        "importance_level": analysis["importance"]["level"],
        "urgency": analysis["urgency"]["level"],
        "summary": analysis["summary"],
        "deadline": data.get("deadline") or analysis["entities"].get("deadline"),
        "event_date": data.get("event_date") or analysis["entities"].get("date"),
        "event_time": data.get("event_time") or analysis["entities"].get("time"),
        "location": data.get("location") or analysis["entities"].get("location"),
        "department": data.get("department") or analysis["entities"].get("department"),
        "semester": analysis["entities"].get("semester"),
        "requirements": analysis["entities"].get("requirements", []),
        "actions": analysis["actions"],
        "keywords": analysis["keywords"],
        "explanation": analysis["explanation"],
        "explanation_factors": analysis["explanation_factors"],
        "status": data.get("status", "PUBLISHED"),
        "attachment_url": data.get("attachment_url"),
        "created_by": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    notice_doc["id"] = notice_doc["_id"]
    await notices_col.insert_one(notice_doc)
    return notice_doc

async def get_notices(
    category: Optional[str] = None,
    importance_level: Optional[str] = None,
    urgency_level: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    notices_col = db_manager.get_collection("notices")
    query = {}
    if category and category != "ALL":
        query["category"] = category.upper()
    if importance_level and importance_level != "ALL":
        query["importance_level"] = importance_level.upper()
    if urgency_level and urgency_level != "ALL":
        query["urgency"] = urgency_level.upper()
    if status:
        query["status"] = status

    docs = await notices_col.find(query=query, sort=[("importance", -1), ("created_at", -1)], limit=limit)
    
    if search:
        s = search.lower().strip()
        filtered = []
        for d in docs:
            content_match = s in d.get("content", "").lower()
            title_match = s in d.get("title", "").lower()
            category_match = s in d.get("category", "").lower()
            keywords_match = any(s in kw.lower() for kw in d.get("keywords", []))
            if content_match or title_match or category_match or keywords_match:
                filtered.append(d)
        return filtered

    return docs

async def get_notice_by_id(notice_id: str) -> Optional[Dict[str, Any]]:
    notices_col = db_manager.get_collection("notices")
    return await notices_col.find_one({"_id": notice_id})

async def update_notice(notice_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    notices_col = db_manager.get_collection("notices")
    existing = await notices_col.find_one({"_id": notice_id})
    if not existing:
        return None
    
    # If content changed, re-run AI pipeline
    if any(key in updates for key in ("content", "category", "deadline", "event_date")):
        analysis = analyze_notice_text(updates.get("content", existing["content"]), override_category=updates.get("category", existing.get("category")), deadline_override=updates.get("deadline", existing.get("deadline")), event_date_override=updates.get("event_date", existing.get("event_date")))
        updates["category"] = analysis["category"]["value"]
        updates["confidence"] = analysis["category"]["confidence"]
        updates["importance"] = analysis["importance"]["score"]
        updates["importance_level"] = analysis["importance"]["level"]
        updates["urgency"] = analysis["urgency"]["level"]
        updates["summary"] = analysis["summary"]
        updates["deadline"] = updates.get("deadline") or analysis["entities"].get("deadline")
        updates["actions"] = analysis["actions"]
        updates["keywords"] = analysis["keywords"]
        updates["explanation"] = analysis["explanation"]
        updates["explanation_factors"] = analysis["explanation_factors"]

    await notices_col.update_one({"_id": notice_id}, {"$set": updates})
    return await notices_col.find_one({"_id": notice_id})

async def delete_notice(notice_id: str) -> bool:
    notices_col = db_manager.get_collection("notices")
    res = await notices_col.delete_one({"_id": notice_id})
    return res > 0
