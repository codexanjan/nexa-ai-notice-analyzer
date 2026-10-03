import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import db_manager

async def create_notification(
    title: str,
    message: str,
    notice_id: Optional[str] = None,
    importance_score: Optional[int] = None,
    notification_type: str = "CRITICAL",
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    notifications_col = db_manager.get_collection("notifications")
    doc = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "message": message,
        "notice_id": notice_id,
        "importance_score": importance_score,
        "type": notification_type,
        "read": False,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    doc["id"] = doc["_id"]
    await notifications_col.insert_one(doc)
    return doc

async def get_notifications(user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    notifications_col = db_manager.get_collection("notifications")
    query = {}
    if user_id:
        query["$or"] = [{"user_id": user_id}, {"user_id": None}]
    
    docs = await notifications_col.find(query=query, sort=[("created_at", -1)], limit=limit)
    return docs

async def mark_notification_as_read(notification_id: str) -> bool:
    notifications_col = db_manager.get_collection("notifications")
    res = await notifications_col.update_one({"_id": notification_id}, {"$set": {"read": True}})
    return res > 0

async def mark_all_notifications_as_read(user_id: Optional[str] = None) -> int:
    notifications_col = db_manager.get_collection("notifications")
    # update all matching
    notifications = await notifications_col.find()
    count = 0
    for n in notifications:
        if not n.get("read", False):
            await notifications_col.update_one({"_id": n["_id"]}, {"$set": {"read": True}})
            count += 1
    return count
