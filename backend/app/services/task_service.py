import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import db_manager
from app.ai.importance_engine import estimate_hours_remaining, calculate_deadline_proximity
from app.ai.urgency_engine import calculate_deadline_risk

async def create_task(data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    tasks_col = db_manager.get_collection("tasks")
    notices_col = db_manager.get_collection("notices")
    
    notice_importance = 50
    if data.get("notice_id"):
        notice = await notices_col.find_one({"_id": data["notice_id"]})
        if notice:
            notice_importance = notice.get("importance", 50)
            if not data.get("deadline") and notice.get("deadline"):
                data["deadline"] = notice["deadline"]

    # Calculate deadline time pressure score T
    deadline_str = data.get("deadline")
    hours = estimate_hours_remaining(deadline_str) if deadline_str else None
    t_score = calculate_deadline_proximity(hours)

    status = data.get("status", "Pending")
    risk_calc = calculate_deadline_risk(
        time_pressure_score=t_score,
        notice_importance_score=notice_importance,
        status=status
    )

    task_doc = {
        "_id": str(uuid.uuid4()),
        "title": data["title"],
        "notice_id": data.get("notice_id"),
        "deadline": deadline_str,
        "priority": data.get("priority", "MEDIUM"),
        "status": status,
        "risk_score": risk_calc["risk_score"],
        "risk_level": risk_calc["risk_level"],
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    task_doc["id"] = task_doc["_id"]
    await tasks_col.insert_one(task_doc)
    return task_doc

async def get_tasks(user_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    tasks_col = db_manager.get_collection("tasks")
    query = {}
    if user_id:
        query["user_id"] = user_id
    if status and status != "ALL":
        query["status"] = status
    
    tasks = await tasks_col.find(query=query, sort=[("risk_score", -1), ("created_at", -1)])
    return tasks

async def update_task(task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    tasks_col = db_manager.get_collection("tasks")
    existing = await tasks_col.find_one({"_id": task_id})
    if not existing:
        return None

    if "status" in updates:
        if updates["status"] == "Completed" and existing.get("status") != "Completed":
            updates["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif updates["status"] != "Completed":
            updates["completed_at"] = None

    # Re-calculate risk score if status or deadline changed
    new_status = updates.get("status", existing.get("status", "Pending"))
    deadline = updates.get("deadline", existing.get("deadline"))
    hours = estimate_hours_remaining(deadline) if deadline else None
    t_score = calculate_deadline_proximity(hours)
    
    risk_calc = calculate_deadline_risk(
        time_pressure_score=t_score,
        notice_importance_score=(await db_manager.get_collection("notices").find_one({"_id": existing.get("notice_id")} ) or {}).get("importance", 50),
        status=new_status
    )
    updates["risk_score"] = risk_calc["risk_score"]
    updates["risk_level"] = risk_calc["risk_level"]

    await tasks_col.update_one({"_id": task_id}, {"$set": updates})
    return await tasks_col.find_one({"_id": task_id})

async def delete_task(task_id: str) -> bool:
    tasks_col = db_manager.get_collection("tasks")
    res = await tasks_col.delete_one({"_id": task_id})
    return res > 0
