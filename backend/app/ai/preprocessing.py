import re
from typing import List, Set

STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "hereby", "informed", "herein", "regards"
}

def clean_text(text: str) -> str:
    """Cleans notice text while preserving punctuation essential for sentences and dates."""
    if not text:
        return ""
    # Normalize unicode quotes and dashes
    text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    text = text.replace("—", "-").replace("–", "-")
    # Replace multiple whitespaces and tabs
    text = re.sub(r'[ \t]+', ' ', text)
    # Replace 3 or more newlines with double newline
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def split_sentences(text: str) -> List[str]:
    """Splits text into sentences based on punctuation and linebreaks."""
    cleaned = clean_text(text)
    # Split on periods followed by space/capital letter or linebreaks
    raw_sentences = re.split(r'(?<=[.!?])\s+|\n+', cleaned)
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 3]
    return sentences

def extract_keywords(text: str, max_keywords: int = 6) -> List[str]:
    """Extracts informative keywords from notice text, removing common stopwords."""
    cleaned = clean_text(text).lower()
    words = re.findall(r'\b[a-z]{3,}\b', cleaned)
    word_freq = {}
    for w in words:
        if w not in STOP_WORDS:
            word_freq[w] = word_freq.get(w, 0) + 1
    
    # Prioritize specific high-value academic terms
    priority_terms = {
        "examination", "assessment", "internal", "semester", "attendance",
        "placement", "internship", "scholarship", "registration", "deadline",
        "hallticket", "admit", "fees", "challan", "hostel", "convocation",
        "symposium", "workshop", "submission", "eligibility", "disqualification"
    }
    
    sorted_words = sorted(
        word_freq.keys(),
        key=lambda w: (1 if w in priority_terms else 0, word_freq[w]),
        reverse=True
    )
    return sorted_words[:max_keywords]
