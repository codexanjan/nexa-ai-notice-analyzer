import re
from typing import List
from app.ai.preprocessing import split_sentences, clean_text

BOILERPLATE_PATTERNS = [
    r'^all\s+students\s+(?:are\s+)?(?:hereby\s+)?(?:informed|notified)\s+that\s+',
    r'^this\s+is\s+to\s+(?:inform|notify)\s+all\s+(?:students|concerned)\s+that\s+',
    r'^it\s+is\s+(?:hereby\s+)?brought\s+to\s+the\s+notice\s+of\s+all\s+students\s+that\s+',
    r'^it\s+is\s+informed\s+that\s+',
    r'^notice\s+is\s+hereby\s+given\s+that\s+',
    r'^all\s+the\s+students\s+are\s+requested\s+to\s+note\s+that\s+',
    r'^students\s+are\s+informed\s+that\s+'
]

def clean_sentence(sentence: str) -> str:
    s = sentence.strip()
    for bp in BOILERPLATE_PATTERNS:
        s = re.sub(bp, '', s, flags=re.IGNORECASE).strip()
    if s:
        s = s[0].upper() + s[1:]
    return s

def generate_summary(text: str) -> str:
    """
    Generates a concise, strictly factual summary without inventing or inferring facts.
    If information is insufficient: returns 'Not specified in notice.'
    """
    cleaned = clean_text(text)
    if not cleaned or len(cleaned.split()) < 4:
        return "Not specified in notice."

    sentences = split_sentences(cleaned)
    if not sentences:
        return "Not specified in notice."

    # Identify key informational sentences
    key_sentences = []
    
    # First sentence (often the core announcement)
    first_clean = clean_sentence(sentences[0])
    if len(first_clean) > 10:
        key_sentences.append(first_clean)

    # Search for action / deadline / requirement sentences
    action_req_keywords = [
        "must", "deadline", "last date", "submit", "carry", "register", "pay",
        "held on", "conducted on", "hall ticket", "will be closed", "scheduled"
    ]
    for s in sentences[1:]:
        s_lower = s.lower()
        if any(kw in s_lower for kw in action_req_keywords):
            clean_s = clean_sentence(s)
            if clean_s not in key_sentences:
                key_sentences.append(clean_s)
                if len(key_sentences) >= 3:
                    break

    if not key_sentences:
        return clean_sentence(sentences[0])

    summary = " ".join(key_sentences)
    # Ensure it ends with period
    if not summary.endswith(('.', '!', '?')):
        summary += '.'
    return summary
