import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

CATEGORY_CRITICALITY_MAP: Dict[str, float] = {
    "EMERGENCY": 100.0,
    "EXAMINATION": 95.0,
    "REGISTRATION": 90.0,
    "FEES": 85.0,
    "RESULT": 85.0,
    "ADMISSION": 85.0,
    "ATTENDANCE": 80.0,
    "PLACEMENT": 80.0,
    "SCHOLARSHIP": 75.0,
    "ASSIGNMENT": 70.0,
    "INTERNSHIP": 70.0,
    "ACADEMIC": 65.0,
    "WORKSHOP": 50.0,
    "ADMINISTRATION": 50.0,
    "EVENT": 45.0,
    "TRANSPORT": 40.0,
    "HOSTEL": 40.0,
    "HOLIDAY": 30.0,
    "GENERAL": 20.0
}

def estimate_hours_remaining(date_str: Optional[str]) -> Optional[float]:
    """Estimates hours remaining from relative terms or standard date formats."""
    if not date_str:
        return None
    
    text = date_str.lower().strip()
    if "today" in text:
        return 4.0
    if "tomorrow" in text:
        return 20.0
    if "within 6 hours" in text:
        return 5.0
    if "in 2 days" in text:
        return 40.0
    if "in 3 days" in text:
        return 65.0
    if "next week" in text:
        return 120.0
    
    # Try parsing weekday (e.g. "Monday", "Friday")
    weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for idx, day in enumerate(weekdays):
        if day in text:
            # Assume 2026-10-03 is Saturday (index 5)
            # Default to upcoming day
            days_ahead = (idx - 5) % 7
            if days_ahead == 0:
                days_ahead = 7
            return float(days_ahead * 24 - 4)

    # Try parsing date strings like "10 October 2026", "2026-10-10", "15/10/2026"
    date_patterns = [
        ("%Y-%m-%d", r'\d{4}-\d{2}-\d{2}'),
        ("%d/%m/%Y", r'\d{2}/\d{2}/\d{4}'),
        ("%d %B %Y", r'\d{1,2}\s+[A-Za-z]+\s+\d{4}'),
        ("%d %b %Y", r'\d{1,2}\s+[A-Za-z]{3}\s+\d{4}')
    ]
    now = datetime(2026, 10, 3, 11, 0, tzinfo=timezone.utc)
    for fmt, regex in date_patterns:
        match = re.search(regex, text)
        if match:
            try:
                target = datetime.strptime(match.group(0), fmt).replace(tzinfo=timezone.utc)
                diff = (target - now).total_seconds() / 3600.0
                return max(0.0, diff)
            except Exception:
                continue

    # Default conservative estimate for recognized date string without year
    if any(m in text for m in ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]):
        return 96.0  # ~4 days

    return 72.0

def calculate_deadline_proximity(hours: Optional[float]) -> float:
    """Calculates D score based on hours remaining until deadline."""
    if hours is None:
        return 0.0
    if hours <= 0:
        return 100.0
    elif hours <= 6:
        return 95.0
    elif hours <= 24:
        return 90.0
    elif hours <= 48:
        return 75.0
    elif hours <= 72:
        return 60.0
    elif hours <= 168:
        return 45.0
    elif hours <= 336:
        return 25.0
    else:
        return 10.0

def calculate_event_proximity(hours: Optional[float]) -> float:
    """Calculates E score based on hours remaining until event/exam."""
    if hours is None:
        return 0.0
    if hours <= 0:
        return 100.0
    elif hours <= 6:
        return 95.0
    elif hours <= 24:
        return 90.0
    elif hours <= 48:
        return 80.0
    elif hours <= 72:
        return 65.0
    elif hours <= 168:
        return 50.0
    elif hours <= 336:
        return 30.0
    else:
        return 10.0

def calculate_action_score(text: str, has_deadline: bool, actions: list) -> float:
    """Calculates A score based on mandatory action, attendance, submission, or optional action."""
    text_lower = text.lower()
    is_mandatory = bool(re.search(r'\b(must|mandatory|compulsory|required|strictly required|shall)\b', text_lower))
    is_submission = bool(re.search(r'\b(submit|submission|pay|payment|register|registration|apply|application)\b', text_lower))
    is_attendance = bool(re.search(r'\b(must attend|required to attend|compulsory attendance|attend)\b', text_lower))
    is_optional = bool(re.search(r'\b(may|can|optional|invited to|welcome to)\b', text_lower))

    if is_mandatory:
        return 100.0
    if is_attendance:
        return 85.0
    if is_submission:
        return 85.0
    if actions:
        return 75.0
    if is_optional:
        return 40.0
    if re.search(r'\b(holiday|announced|notice|information|informed)\b', text_lower):
        return 10.0
    return 0.0

def calculate_urgency_signals(text: str) -> float:
    """Calculates U score based on strongest urgency keyword with multi-signal reinforcement."""
    text_lower = text.lower()
    signals = []
    
    if re.search(r'\b(emergency|immediate|immediately|cancelled|postponed)\b', text_lower):
        signals.append(100.0)
    if re.search(r'\b(final date|last date|closing date|final deadline)\b', text_lower):
        signals.append(95.0)
    if re.search(r'\b(today|expires today|deadline today|within hours)\b', text_lower):
        signals.append(90.0)
    if re.search(r'\b(mandatory|must|strictly|compulsory)\b', text_lower):
        signals.append(80.0)
    if re.search(r'\b(important|urgent|crucial|attention)\b', text_lower):
        signals.append(70.0)
    if re.search(r'\b(tomorrow|soon|upcoming)\b', text_lower):
        signals.append(50.0)

    if not signals:
        return 10.0
    
    u_max = max(signals)
    n = len(signals)
    u_final = min(100.0, u_max + 5.0 * (n - 1))
    return u_final

def calculate_consequence_score(text: str) -> float:
    """Calculates K score from explicit consequence stated in notice without inferring missing ones."""
    text_lower = text.lower()
    if re.search(r'\b(not be permitted|will not be allowed|disqualification|disqualified|debarred|severe penalty|police action|legal action)\b', text_lower):
        return 100.0
    if re.search(r'\b(cannot appear|loss of eligibility|hall ticket withheld|detained|admission cancelled|room allotment cancelled)\b', text_lower):
        return 90.0
    if re.search(r'\b(fine|late fee|penalty|rs\.|incur a penalty)\b', text_lower):
        return 80.0
    if re.search(r'\b(academic consequence|internal marks deducted|zero marks)\b', text_lower):
        return 80.0
    if re.search(r'\b(administrative action|reported to dean|show cause)\b', text_lower):
        return 60.0
    if re.search(r'\b(inconvenience|delayed)\b', text_lower):
        return 40.0
    return 10.0

def calculate_importance(
    category: str,
    text: str,
    deadline_str: Optional[str] = None,
    event_date_str: Optional[str] = None,
    actions: Optional[list] = None
) -> Dict[str, Any]:
    """
    Computes exact mathematical importance score:
    I = 0.20*C + 0.25*D + 0.20*A + 0.15*U + 0.10*K + 0.10*E
    """
    category_upper = (category or "GENERAL").upper()
    c = CATEGORY_CRITICALITY_MAP.get(category_upper, 20.0)

    has_deadline = bool(deadline_str)
    d_hours = estimate_hours_remaining(deadline_str) if has_deadline else None
    d = calculate_deadline_proximity(d_hours)

    actions_list = actions or []
    a = calculate_action_score(text, has_deadline, actions_list)

    u = calculate_urgency_signals(text)
    k = calculate_consequence_score(text)

    has_event = bool(event_date_str)
    e_hours = estimate_hours_remaining(event_date_str) if has_event else None
    e = calculate_event_proximity(e_hours)

    # Exact weighted formula
    i_raw = (0.20 * c) + (0.25 * d) + (0.20 * a) + (0.15 * u) + (0.10 * k) + (0.10 * e)
    score = int(round(i_raw))
    score = max(0, min(100, score))

    if score <= 30:
        level = "LOW"
    elif score <= 60:
        level = "MEDIUM"
    elif score <= 80:
        level = "HIGH"
    else:
        level = "CRITICAL"

    factors = {
        "category_criticality": c,
        "deadline_proximity": d,
        "action_required": a,
        "urgency_signals": u,
        "consequence": k,
        "event_proximity": e,
        "raw_weighted": round(i_raw, 2)
    }

    return {
        "score": score,
        "level": level,
        "factors": factors
    }
