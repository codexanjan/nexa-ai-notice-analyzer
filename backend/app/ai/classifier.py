import os
import pickle
from pathlib import Path
from typing import Dict, Any, Tuple
from app.core.config import settings

# Keyword boost mappings for domain resilience
KEYWORD_MAPPINGS = {
    "EXAMINATION": ["exam", "examination", "assessment", "internal", "midterm", "hall ticket", "invigilator", "malpractice"],
    "ASSIGNMENT": ["assignment", "submission", "laboratory report", "lab manual", "project milestone"],
    "ATTENDANCE": ["attendance", "shortage", "condonation", "detained", "percentage cutoff"],
    "FEES": ["tuition fee", "exam fee", "hostel fee", "dues", "challan", "fine", "penalty fee"],
    "PLACEMENT": ["placement", "recruitment", "interview", "campus drive", "pre-placement", "ctc", "resume"],
    "SCHOLARSHIP": ["scholarship", "merit-cum-means", "e-kyc", "fee reimbursement", "endowment"],
    "EVENT": ["symposium", "festival", "sports meet", "annual day", "cultural", "celebration", "convocation"],
    "HOLIDAY": ["holiday", "closed", "suspended", "break", "vacation", "non-working"],
    "ACADEMIC": ["academic calendar", "classes", "syllabus", "timetable", "elective", "remedial"],
    "ADMINISTRATION": ["admin office", "identity card", "id card", "counter", "transcript", "migration"],
    "ADMISSION": ["admission", "counselling", "allotment", "seat", "verification of certificates"],
    "WORKSHOP": ["workshop", "hands-on", "bootcamp", "training", "seminar", "certified"],
    "INTERNSHIP": ["internship", "industrial training", "stipend", "noc", "completion certificate"],
    "RESULT": ["results", "revaluation", "grade sheet", "photocopy of answer", "grades", "sgpa", "cgpa"],
    "REGISTRATION": ["course registration", "subject enrollment", "portal open", "register before"],
    "HOSTEL": ["hostel", "room allotment", "warden", "mess", "gate timing"],
    "TRANSPORT": ["bus route", "bus pass", "transportation", "shuttle"],
    "EMERGENCY": ["emergency", "urgent", "rainfall warning", "cyclone", "evacuation", "shutdown", "immediate alert"],
    "GENERAL": ["lost and found", "notice", "cleanliness", "canteen", "library books"]
}

import json
import re
import math
from collections import Counter

class StandaloneClassifier:
    def __init__(self, data: dict):
        self.classes_ = data["classes"]
        self.vocabulary = data["vocabulary"]
        self.idf = data["idf"]
        self.coef = data["coef"]
        self.intercept = data["intercept"]
        self.sublinear_tf = data.get("sublinear_tf", True)

    def predict_proba(self, texts):
        results = []
        for text in texts:
            tokens = re.findall(r'(?u)\b\w\w+\b', text.lower())
            ngrams = list(tokens)
            for i in range(len(tokens) - 1):
                ngrams.append(tokens[i] + ' ' + tokens[i+1])
            counts = Counter(ngrams)
            feat_values = {}
            sum_sq = 0.0
            for term, count in counts.items():
                if term in self.vocabulary:
                    idx = self.vocabulary[term]
                    tf = (1.0 + math.log(count)) if self.sublinear_tf else float(count)
                    val = tf * self.idf[idx]
                    feat_values[idx] = val
                    sum_sq += val * val
            norm = math.sqrt(sum_sq) or 1.0
            for idx in feat_values:
                feat_values[idx] /= norm
            logits = []
            for c_idx in range(len(self.classes_)):
                score = self.intercept[c_idx]
                row = self.coef[c_idx]
                for f_idx, val in feat_values.items():
                    score += row[f_idx] * val
                logits.append(score)
            max_logit = max(logits)
            exp_scores = [math.exp(l - max_logit) for l in logits]
            tot = sum(exp_scores) or 1.0
            probs = [s / tot for s in exp_scores]
            results.append(probs)
        return results

_model = None

def get_classifier_model():
    global _model
    if _model is not None:
        return _model
    
    weights_path = settings.MODEL_DIR / "notice_classifier_weights.json"
    if weights_path.exists():
        try:
            with open(weights_path, "r", encoding="utf-8") as f:
                _model = StandaloneClassifier(json.load(f))
                return _model
        except Exception as e:
            print(f"[Classifier] Failed to load JSON weights: {e}")

    model_path = settings.MODEL_DIR / "notice_classifier.pkl"
    if model_path.exists():
        try:
            with open(model_path, "rb") as f:
                _model = pickle.load(f)
                return _model
        except Exception as e:
            print(f"[Classifier] Failed to load model: {e}")
    
    # Check if we can trigger training
    try:
        from backend.ml.training.train import train_and_evaluate
        ds = settings.BASE_DIR / "ml" / "dataset" / "notices.csv"
        met = settings.MODEL_DIR / "model_metrics.json"
        _model, _ = train_and_evaluate(ds, model_path, met)
        return _model
    except Exception as ex:
        print(f"[Classifier] On-the-fly training unavailable: {ex}")
        return None

def classify_notice(text: str) -> Dict[str, Any]:
    """
    Classifies a notice into one of 19 categories with confidence score.
    Returns: {"value": "EXAMINATION", "confidence": 0.94}
    """
    if not text or len(text.strip()) < 5:
        return {"value": "GENERAL", "confidence": 0.50}

    model = get_classifier_model()
    if model is not None:
        try:
            probs = model.predict_proba([text])[0]
            classes = model.classes_
            if hasattr(probs, 'argmax'):
                max_idx = probs.argmax()
            else:
                max_idx = probs.index(max(probs))
            predicted_class = classes[max_idx]
            confidence = float(probs[max_idx])

            # Safety check: if text clearly has distinct priority keyword not matching top class, verify
            text_lower = text.lower()
            keyword_scores = {}
            for cat, kws in KEYWORD_MAPPINGS.items():
                score = sum(1 for kw in kws if kw in text_lower)
                if score > 0:
                    keyword_scores[cat] = score

            if keyword_scores:
                best_kw_cat = max(keyword_scores.items(), key=lambda x: x[1])[0]
                if keyword_scores[best_kw_cat] >= 2 and confidence < 0.60:
                    predicted_class = best_kw_cat
                    confidence = 0.85

            return {
                "value": predicted_class,
                "confidence": round(min(0.99, max(0.51, confidence)), 2)
            }
        except Exception as e:
            print(f"[Classifier] Prediction error: {e}")

    # Heuristic fallback based on keyword frequency
    text_lower = text.lower()
    best_cat = "GENERAL"
    best_score = 0
    for cat, kws in KEYWORD_MAPPINGS.items():
        score = sum(2 if kw in text_lower else 0 for kw in kws)
        if score > best_score:
            best_score = score
            best_cat = cat

    conf = min(0.92, 0.60 + (best_score * 0.08)) if best_score > 0 else 0.55
    return {
        "value": best_cat,
        "confidence": round(conf, 2)
    }
