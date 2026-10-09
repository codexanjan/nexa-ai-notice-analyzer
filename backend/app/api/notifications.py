from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.services.notification_service import (
    get_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read
)
from app.api.auth import require_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def list_user_notifications(current_user: dict = Depends(require_user)):
    user_id = current_user["_id"] if current_user else None
    return await get_notifications(user_id=user_id)

@router.put("/{notification_id}/read")
async def mark_single_read(notification_id: str, current_user: dict = Depends(require_user)):
    success = await mark_notification_as_read(notification_id, current_user["_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(require_user)):
    user_id = current_user["_id"] if current_user else None
    count = await mark_all_notifications_as_read(user_id=user_id)
    return {"marked_read": count}
