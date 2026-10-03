from typing import Dict, Any, Optional

def calculate_urgency(
    d_score: float,
    e_score: float,
    k_score: float
) -> Dict[str, Any]:
    """
    Computes Urgency:
    U_final = 0.50*D + 0.30*E + 0.20*K
    0–25 LOW, 26–50 MEDIUM, 51–75 HIGH, 76–100 CRITICAL
    """
    u_raw = (0.50 * d_score) + (0.30 * e_score) + (0.20 * k_score)
    score = int(round(u_raw))
    score = max(0, min(100, score))

    if score <= 25:
        level = "LOW"
    elif score <= 50:
        level = "MEDIUM"
    elif score <= 75:
        level = "HIGH"
    else:
        level = "CRITICAL"

    # Confidence calculation based on clarity of dates and consequences
    confidence = 0.85
    if d_score > 0 or e_score > 0:
        confidence = 0.94
    if k_score >= 80:
        confidence = 0.96

    return {
        "score": score,
        "level": level,
        "confidence": round(confidence, 2)
    }

def calculate_deadline_risk(
    time_pressure_score: float,
    notice_importance_score: int,
    status: str
) -> Dict[str, Any]:
    """
    Computes Deadline Risk Formula for a task:
    R = 0.50*T + 0.30*I + 0.20*S
    Where:
    T = time pressure
    I = notice importance
    S = task status: Overdue (100), Not Started/Pending (90), In Progress (50), Completed (0)
    """
    status_lower = status.lower()
    if "overdue" in status_lower:
        s_score = 100.0
    elif "complete" in status_lower:
        s_score = 0.0
    elif "progress" in status_lower:
        s_score = 50.0
    else:  # Pending / Not started
        s_score = 90.0

    r_raw = (0.50 * time_pressure_score) + (0.30 * float(notice_importance_score)) + (0.20 * s_score)
    risk_score = int(round(r_raw))
    risk_score = max(0, min(100, risk_score))

    if risk_score <= 25:
        risk_level = "LOW"
    elif risk_score <= 50:
        risk_level = "MEDIUM"
    elif risk_score <= 75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level
    }
