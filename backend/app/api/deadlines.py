from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.services.notice_service import get_notices
from app.services.task_service import get_tasks
from app.ai.importance_engine import estimate_hours_remaining
from app.api.auth import get_current_user

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

@router.get("")
async def get_deadline_center_data(current_user = Depends(get_current_user)):
    """
    Groups actionable items and notices into:
    - Due Today (<= 24 hours)
    - Due This Week (24 to 168 hours)
    - Upcoming (> 168 hours)
    - Completed
    """
    notices = await get_notices(limit=200, status="PUBLISHED")
    tasks = await get_tasks(user_id=current_user["_id"]) if current_user else []

    due_today = []
    due_this_week = []
    upcoming = []
    completed = []

    # First sort tasks
    for t in tasks:
        if t.get("status") == "Completed":
            completed.append({
                "type": "TASK",
                "id": t["_id"],
                "title": t["title"],
                "deadline": t.get("deadline", "No deadline"),
                "importance": t.get("risk_score", 50),
                "urgency": t.get("risk_level", "LOW"),
                "status": "Completed",
                "notice_id": t.get("notice_id")
            })
            continue

        d_str = t.get("deadline")
        hours = estimate_hours_remaining(d_str) if d_str else 999.0
        item = {
            "type": "TASK",
            "id": t["_id"],
            "title": t["title"],
            "deadline": d_str or "No deadline",
            "importance": t.get("risk_score", 50),
            "urgency": t.get("risk_level", "MEDIUM"),
            "status": t.get("status", "Pending"),
            "notice_id": t.get("notice_id")
        }
        if hours is not None and hours <= 24:
            due_today.append(item)
        elif hours is not None and hours <= 168:
            due_this_week.append(item)
        else:
            upcoming.append(item)

    # Next add notices with explicit deadlines
    for n in notices:
        d_str = n.get("deadline")
        if not d_str:
            continue
        
        hours = estimate_hours_remaining(d_str)
        item = {
            "type": "NOTICE",
            "id": n["_id"],
            "title": n["title"],
            "deadline": d_str,
            "importance": n.get("importance", 50),
            "urgency": n.get("urgency", "MEDIUM"),
            "status": "Action Required" if n.get("actions") else "Notice",
            "notice_id": n["_id"],
            "category": n.get("category")
        }
        if hours is not None and hours <= 24:
            due_today.append(item)
        elif hours is not None and hours <= 168:
            due_this_week.append(item)
        else:
            upcoming.append(item)

    return {
        "due_today": due_today,
        "due_this_week": due_this_week,
        "upcoming": upcoming,
        "completed": completed,
        "total_active_deadlines": len(due_today) + len(due_this_week) + len(upcoming)
    }
