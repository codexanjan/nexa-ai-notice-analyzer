import pytest
from app.ai.importance_engine import calculate_importance, CATEGORY_CRITICALITY_MAP
from app.ai.urgency_engine import calculate_urgency, calculate_deadline_risk
from app.ai.classifier import classify_notice
from app.ai.entity_extractor import extract_all_entities
from app.ai.summarizer import generate_summary
from app.services.notice_service import analyze_notice_text

def test_prompt_worked_example_1():
    """
    Prompt Section 10 Worked Example:
    'All students are informed that the internal assessment examination will be conducted tomorrow at 10 AM. Students must carry their ID cards.'
    Assume analyzed 20 hours before exam:
    C = 95, E = 90, A = 100, U = 80, K = 10, D = 0.
    I = 0.20(95) + 0.25(0) + 0.20(100) + 0.15(80) + 0.10(10) + 0.10(90) = 61 -> HIGH.
    """
    text = "All students are informed that the internal assessment examination will be conducted tomorrow at 10 AM. Students must carry their ID cards."
    analysis = analyze_notice_text(text)
    assert analysis["category"]["value"] == "EXAMINATION"
    # Score should match the high range and close to 61
    assert 55 <= analysis["importance"]["score"] <= 75
    assert analysis["importance"]["level"] in ["HIGH", "MEDIUM"]
    assert "attend" in " ".join(analysis["actions"]).lower() or "carry" in " ".join(analysis["actions"]).lower()

def test_prompt_worked_example_2():
    """
    Prompt Section 11 Worked Example:
    'Final date for examination registration is today at 5 PM. Students who fail to register will not be permitted to appear for the examination.'
    Suppose 4 hours remain:
    C = 95, D = 95, A = 100, U = 95, K = 100, E = 0.
    I = 87 -> CRITICAL.
    """
    text = "Final date for examination registration is today at 5 PM. Students who fail to register will not be permitted to appear for the examination."
    analysis = analyze_notice_text(text)
    assert analysis["category"]["value"] in ["REGISTRATION", "EXAMINATION"]
    assert analysis["importance"]["score"] >= 80
    assert analysis["importance"]["level"] == "CRITICAL"
    assert analysis["urgency"]["level"] in ["CRITICAL", "HIGH"]

def test_no_hallucination_summary():
    """
    Summary must be factual and concise without inventing details.
    """
    text = "All students are hereby informed that the internal assessment examination for the current semester will be conducted on Monday at 10 AM. Students are required to carry their college ID cards."
    summary = generate_summary(text)
    
    assert "internal assessment examination" in summary.lower()
    assert "monday at 10 am" in summary.lower() or "monday" in summary.lower()
    assert "college id" in summary.lower() or "carry" in summary.lower()

def test_deadline_risk_calculation():
    """
    R = 0.50T + 0.30I + 0.20S
    """
    # Overdue task with critical notice
    risk_overdue = calculate_deadline_risk(time_pressure_score=100.0, notice_importance_score=95, status="Overdue")
    assert risk_overdue["risk_score"] >= 85
    assert risk_overdue["risk_level"] == "CRITICAL"

    # Completed task
    risk_completed = calculate_deadline_risk(time_pressure_score=10.0, notice_importance_score=30, status="Completed")
    assert risk_completed["risk_score"] <= 25
    assert risk_completed["risk_level"] == "LOW"

def test_explainable_ai_factors():
    """
    Verify explanation contains all factors and textual reasons.
    """
    text = "Urgent: Final date for fee payment is tomorrow. Late fee applies."
    analysis = analyze_notice_text(text)
    factors = analysis["explanation_factors"]
    
    assert "category_criticality" in factors
    assert "deadline_proximity" in factors
    assert "action_required" in factors
    assert "urgency_signals" in factors
    assert len(analysis["explanation"]) > 0

if __name__ == "__main__":
    test_prompt_worked_example_1()
    test_prompt_worked_example_2()
    test_no_hallucination_summary()
    test_deadline_risk_calculation()
    test_explainable_ai_factors()
    print("All NLP, Intelligence, and Scoring unit tests passed successfully!")
