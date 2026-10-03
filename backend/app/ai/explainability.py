from typing import Dict, Any, List

def generate_explanation(
    category: str,
    importance_score: int,
    importance_level: str,
    factors: Dict[str, Any],
    has_deadline: bool,
    has_action: bool,
    has_event: bool
) -> List[str]:
    """
    Generates human-readable, factual justification points explaining the AI importance score.
    """
    reasons = []

    c_score = factors.get("category_criticality", 0)
    d_score = factors.get("deadline_proximity", 0)
    a_score = factors.get("action_required", 0)
    u_score = factors.get("urgency_signals", 0)
    k_score = factors.get("consequence", 0)
    e_score = factors.get("event_proximity", 0)

    # Category reason
    category_title = category.replace("_", " ").title()
    if c_score >= 80:
        reasons.append(f"High-priority academic domain: Classified under {category_title} with critical weight ({int(c_score)}%).")
    elif c_score >= 50:
        reasons.append(f"Standard operational domain: Notice categorized as {category_title} ({int(c_score)}%).")
    else:
        reasons.append(f"Informational category: Categorized as {category_title}.")

    # Deadline reason
    if has_deadline and d_score >= 75:
        reasons.append(f"Imminent submission deadline: Deadline proximity scored at {int(d_score)}% due to urgent time window.")
    elif has_deadline:
        reasons.append(f"Upcoming deadline detected with {int(d_score)}% proximity score.")

    # Action required reason
    if a_score >= 85:
        reasons.append(f"Mandatory student action required: Action score evaluated at {int(a_score)}%.")
    elif a_score > 0:
        reasons.append(f"Action required from students ({int(a_score)}% action factor).")

    # Consequence reason
    if k_score >= 80:
        reasons.append(f"Explicit consequence stated: Stated consequence factor evaluated at {int(k_score)}%.")

    # Urgency signals reason
    if u_score >= 70:
        reasons.append(f"Strong urgency signals: Notice contains pressing timing directives ({int(u_score)}%).")

    # Event proximity reason
    if has_event and e_score >= 80:
        reasons.append(f"Near event timeline: Event proximity scored at {int(e_score)}%.")

    # Summary synthesis conclusion
    if importance_level == "CRITICAL":
        reasons.append(f"Overall classification: Ranked CRITICAL ({importance_score}/100) requiring immediate student and administrative attention.")
    elif importance_level == "HIGH":
        reasons.append(f"Overall classification: Ranked HIGH ({importance_score}/100) due to impending commitments.")
    elif importance_level == "MEDIUM":
        reasons.append(f"Overall classification: Ranked MEDIUM ({importance_score}/100) as a standard actionable notice.")
    else:
        reasons.append(f"Overall classification: Ranked LOW ({importance_score}/100) for general awareness.")

    return reasons
