from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    OVERDUE = "Overdue"

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2)
    notice_id: Optional[str] = None
    deadline: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    deadline: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    notice_id: Optional[str] = None
    deadline: Optional[str] = None
    priority: str
    status: str
    risk_score: int = 0
    risk_level: str = "LOW"
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
