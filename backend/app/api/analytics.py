from fastapi import APIRouter
from typing import Dict, Any
from app.services.notice_service import get_notices
from app.schemas.analytics import AnalyticsDashboard

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=AnalyticsDashboard)
async def get_analytics_dashboard():
    notices = await get_notices(limit=500)
    total = len(notices)

    critical_count = sum(1 for n in notices if n.get("importance_level") == "CRITICAL")
    high_count = sum(1 for n in notices if n.get("importance_level") == "HIGH")
    medium_count = sum(1 for n in notices if n.get("importance_level") == "MEDIUM")
    low_count = sum(1 for n in notices if n.get("importance_level") == "LOW")
    upcoming_deadlines = sum(1 for n in notices if n.get("deadline"))

    # Category breakdown
    cat_counts: Dict[str, int] = {}
    for n in notices:
        c = n.get("category", "GENERAL")
        cat_counts[c] = cat_counts.get(c, 0) + 1

    categories_list = [
        {
            "category": cat,
            "count": cnt,
            "percentage": round((cnt / total * 100), 1) if total > 0 else 0
        }
        for cat, cnt in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Importance Distribution
    importance_distribution = [
        {"level": "CRITICAL", "count": critical_count, "color": "#FF4D67"},
        {"level": "HIGH", "count": high_count, "color": "#FFC857"},
        {"level": "MEDIUM", "count": medium_count, "color": "#55B8FF"},
        {"level": "LOW", "count": low_count, "color": "#7D8792"},
    ]

    # Urgency Distribution
    urg_counts: Dict[str, int] = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for n in notices:
        u = n.get("urgency", "LOW")
        if u in urg_counts:
            urg_counts[u] += 1
        else:
            urg_counts["LOW"] += 1

    urgency_distribution = [
        {"level": "CRITICAL", "count": urg_counts["CRITICAL"], "color": "#FF4D67"},
        {"level": "HIGH", "count": urg_counts["HIGH"], "color": "#FFC857"},
        {"level": "MEDIUM", "count": urg_counts["MEDIUM"], "color": "#55B8FF"},
        {"level": "LOW", "count": urg_counts["LOW"], "color": "#7D8792"},
    ]

    # Timeline (group by date)
    date_counts: Dict[str, Dict[str, int]] = {}
    for n in notices:
        created = (n.get("created_at") or "2026-10-01")[:10]
        if created not in date_counts:
            date_counts[created] = {"total": 0, "critical": 0}
        date_counts[created]["total"] += 1
        if n.get("importance_level") == "CRITICAL":
            date_counts[created]["critical"] += 1

    timeline = [
        {"date": d, "count": vals["total"], "critical_count": vals["critical"]}
        for d, vals in sorted(date_counts.items())
    ]
    if not timeline:
        timeline = [{"date": "2026-10-03", "count": total, "critical_count": critical_count}]

    return {
        "total_notices": total,
        "critical_notices": critical_count,
        "high_priority": high_count,
        "medium_priority": medium_count,
        "low_priority": low_count,
        "upcoming_deadlines": upcoming_deadlines,
        "notices_this_week": total,
        "categories": categories_list,
        "importance_distribution": importance_distribution,
        "urgency_distribution": urgency_distribution,
        "timeline": timeline
    }

@router.get("/categories")
async def get_categories_breakdown():
    dash = await get_analytics_dashboard()
    return dash["categories"]

@router.get("/importance")
async def get_importance_breakdown():
    dash = await get_analytics_dashboard()
    return dash["importance_distribution"]
