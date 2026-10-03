from pydantic import BaseModel
from typing import List, Dict, Any

class CategoryCount(BaseModel):
    category: str
    count: int
    percentage: float

class ImportanceDistribution(BaseModel):
    level: str
    count: int
    color: str

class UrgencyDistribution(BaseModel):
    level: str
    count: int
    color: str

class TimelinePoint(BaseModel):
    date: str
    count: int
    critical_count: int

class AnalyticsDashboard(BaseModel):
    total_notices: int
    critical_notices: int
    high_priority: int
    medium_priority: int
    low_priority: int
    upcoming_deadlines: int
    notices_this_week: int
    categories: List[CategoryCount]
    importance_distribution: List[ImportanceDistribution]
    urgency_distribution: List[UrgencyDistribution]
    timeline: List[TimelinePoint]
