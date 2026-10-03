from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import create_task, get_tasks, update_task, delete_task
from app.api.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_current_user)
):
    user_id = current_user["_id"] if current_user else None
    return await get_tasks(user_id=user_id, status=status)

@router.post("", response_model=TaskResponse)
async def add_task(
    task_in: TaskCreate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    user_id = current_user["_id"] if current_user else None
    return await create_task(task_in.model_dump(), user_id=user_id)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task_item(
    task_id: str,
    task_in: TaskUpdate
):
    updates = {k: v for k, v in task_in.model_dump().items() if v is not None}
    doc = await update_task(task_id, updates)
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return doc

@router.delete("/{task_id}")
async def delete_task_item(task_id: str):
    success = await delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}
