from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class NoticeCategory(str, Enum):
    EXAMINATION = "EXAMINATION"
    ASSIGNMENT = "ASSIGNMENT"
    ATTENDANCE = "ATTENDANCE"
    FEES = "FEES"
    PLACEMENT = "PLACEMENT"
    SCHOLARSHIP = "SCHOLARSHIP"
    EVENT = "EVENT"
    HOLIDAY = "HOLIDAY"
    ACADEMIC = "ACADEMIC"
    ADMINISTRATION = "ADMINISTRATION"
    ADMISSION = "ADMISSION"
    WORKSHOP = "WORKSHOP"
    INTERNSHIP = "INTERNSHIP"
    RESULT = "RESULT"
    REGISTRATION = "REGISTRATION"
    HOSTEL = "HOSTEL"
    TRANSPORT = "TRANSPORT"
    EMERGENCY = "EMERGENCY"
    GENERAL = "GENERAL"

class ImportanceLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class NoticeStatus(str, Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"
    ARCHIVED = "ARCHIVED"

class ExplanationFactors(BaseModel):
    category_criticality: float = 0
    deadline_proximity: float = 0
    action_required: float = 0
    urgency_signals: float = 0
    consequence: float = 0
    event_proximity: float = 0
    weights: Dict[str, float] = {
        "category_criticality": 0.20,
        "deadline_proximity": 0.25,
        "action_required": 0.20,
        "urgency_signals": 0.15,
        "consequence": 0.10,
        "event_proximity": 0.10
    }

class NoticeEntities(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    deadline: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    requirements: List[str] = []

class AIAnalysisResult(BaseModel):
    category: Dict[str, Any]  # {"value": "EXAMINATION", "confidence": 0.96}
    importance: Dict[str, Any]  # {"score": 95, "level": "CRITICAL"}
    urgency: Dict[str, Any]  # {"level": "HIGH", "score": 90, "confidence": 0.91}
    summary: str
    entities: NoticeEntities
    actions: List[str]
    keywords: List[str]
    explanation: List[str]
    explanation_factors: ExplanationFactors

class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=3)
    content: str = Field(..., min_length=5)
    category: Optional[NoticeCategory] = None
    department: Optional[str] = None
    deadline: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    status: NoticeStatus = NoticeStatus.PUBLISHED
    attachment_url: Optional[str] = None

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[NoticeCategory] = None
    department: Optional[str] = None
    deadline: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[NoticeStatus] = None

class NoticeResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    confidence: float
    importance: int
    importance_level: str
    urgency: str
    summary: str
    deadline: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    requirements: List[str] = []
    actions: List[str] = []
    keywords: List[str] = []
    explanation: List[str] = []
    explanation_factors: Optional[Dict[str, Any]] = None
    status: str = "PUBLISHED"
    attachment_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
