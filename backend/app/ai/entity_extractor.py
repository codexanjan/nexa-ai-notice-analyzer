import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
          "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

def extract_dates(text: str) -> List[str]:
    """Finds explicit dates in text without guessing or hallucinating."""
    dates = []
    # Pattern 1: DD Month YYYY or DD Month (e.g. 10 October 2026, 15 Nov)
    p1 = re.findall(r'\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{4})?)\b', text, re.IGNORECASE)
    dates.extend(p1)
    
    # Pattern 2: DD/MM/YYYY or YYYY-MM-DD
    p2 = re.findall(r'\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b', text)
    dates.extend(p2)
    
    # Pattern 3: Days of week with optional specifier (e.g. Monday, next Monday, coming Friday)
    p3 = re.findall(r'\b((?:next\s+|this\s+|coming\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b', text, re.IGNORECASE)
    dates.extend(p3)

    # Pattern 4: Relative keywords: tomorrow, today
    p4 = re.findall(r'\b(today|tomorrow)\b', text, re.IGNORECASE)
    dates.extend(p4)

    # Deduplicate while preserving order
    seen = set()
    cleaned_dates = []
    for d in dates:
        d_clean = d.strip()
        if d_clean.lower() not in seen:
            seen.add(d_clean.lower())
            cleaned_dates.append(d_clean)
    return cleaned_dates

def extract_times(text: str) -> List[str]:
    """Extracts explicit time references (e.g. 10:00 AM, 5 PM, 14:30)."""
    p = re.findall(r'\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)|\d{1,2}:\d{2}\s*(?:hrs|hours)?)\b', text)
    seen = set()
    times = []
    for t in p:
        t_clean = t.strip()
        if t_clean.lower() not in seen:
            seen.add(t_clean.lower())
            times.append(t_clean)
    return times

def extract_deadline(text: str) -> Optional[str]:
    """Identifies explicit submission, payment, or registration deadlines."""
    deadline_patterns = [
        r'(?:final date|last date|closing date|deadline|submission date|due date)(?:\s+for\s+[a-zA-Z0-9\s]+?)?\s+is\s+([A-Za-z0-9\s,/-]+?)(?:\.|\n|$)',
        r'(?:last date|deadline|submission date|due date|closes on|before|on or before|by)\s+([A-Za-z0-9\s,/-]+?)(?:\.|\n|at|$)',
        r'(?:submit|pay|register)\s+.*?by\s+([A-Za-z0-9\s,/-]+?)(?:\.|\n|at|$)',
        r'(?:by|before)\s+(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+\d{4})?)',
        r'(?:by|before)\s+(today|tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)'
    ]
    for pattern in deadline_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            # Clean trailing punctuation
            candidate = re.sub(r'[,.\s]+$', '', candidate)
            # Ensure candidate looks like a date/day or phrase
            if any(k in candidate.lower() for k in DAYS + MONTHS + ["today", "tomorrow", "pm", "am", "202", "11:59"]):
                # Truncate if too long
                if len(candidate) > 40:
                    candidate = candidate[:40].strip()
                return candidate
    return None

def extract_location(text: str) -> Optional[str]:
    """Finds explicit location or venue."""
    loc_keywords = [
        "Main Auditorium", "Auditorium", "Seminar Hall 1", "Seminar Hall 2", "Seminar Hall",
        "Conference Hall", "Sports Ground", "Ground", "Admin Block", "Administrative Block",
        "Counter 3", "Counter 1", "Health Centre", "Placement Cell", "Dean Office", "Security Office",
        "CS Lab 3", "Lab 4", "Maker Lab", "Library Hall", "Room 302", "Room 401"
    ]
    for loc in loc_keywords:
        if re.search(rf'\b{re.escape(loc)}\b', text, re.IGNORECASE):
            return loc
    
    # Generic regex for "in <Venue>" or "at <Venue>"
    match = re.search(r'\b(?:in|at)\s+(?:the\s+)?([A-Z][a-zA-Z0-9\s]{2,25}(?:Hall|Auditorium|Lab|Room|Block|Cell|Center|Centre|Ground))\b', text)
    if match:
        return match.group(1).strip()
    return None

def extract_department(text: str) -> Optional[str]:
    """Identifies department or branch."""
    dept_keywords = [
        "Computer Science", "Information Technology", "Electronics & Communication",
        "Electronics and Communication", "Electronics", "Mechanical Engineering", "Mechanical",
        "Civil Engineering", "Civil", "Electrical Engineering", "Electrical",
        "AI & Data Science", "Artificial Intelligence", "Placement Cell", "Examination Branch",
        "Registrar Section", "Dean Office", "Student Affairs"
    ]
    for dept in dept_keywords:
        if re.search(rf'\b{re.escape(dept)}\b', text, re.IGNORECASE):
            return dept
    return None

def extract_semester(text: str) -> Optional[str]:
    """Identifies explicitly mentioned semester or year."""
    match = re.search(r'\b(?:semester|sem)\s+([IVXLCDMivxlcdm\d]+)\b', text, re.IGNORECASE)
    if match:
        return f"Semester {match.group(1).upper()}"
    match2 = re.search(r'\b(\d(?:st|nd|rd|th)\s+semester)\b', text, re.IGNORECASE)
    if match2:
        return match2.group(1).title()
    if re.search(r'\bfinal\s+year\b', text, re.IGNORECASE):
        return "Final Year"
    return None

def extract_requirements(text: str) -> List[str]:
    """Extracts explicit requirements such as ID card, Hall ticket, Resume."""
    req_terms = [
        ("college id cards?", "College ID card"),
        ("id cards?", "College ID card"),
        ("hall tickets?", "Hall Ticket"),
        ("admit cards?", "Admit Card"),
        ("formal dress code", "Formal dress code"),
        ("resume", "Resume / CV"),
        ("calculator", "Calculator (if permitted)"),
        ("medical certificates?", "Medical Certificate"),
        ("caste and income certificates?", "Caste & Income Certificate"),
        ("transfer certificates?", "Transfer Certificate"),
        ("no-dues certificate", "No-Dues Clearance"),
        ("original certificates?", "Original Certificates"),
        ("laptops?", "Personal Laptop")
    ]
    reqs = []
    text_lower = text.lower()
    for pattern, label in req_terms:
        if re.search(rf'\b{pattern}\b', text_lower):
            if label not in reqs:
                reqs.append(label)
    return reqs

def extract_actions(text: str) -> List[str]:
    """Identifies concrete actionable requirements for students."""
    actions = []
    # Search for imperative clauses and action triggers
    action_triggers = [
        (r'attend\s+(?:the\s+)?([a-zA-Z\s]{4,30})', "Attend {}"),
        (r'carry\s+(?:their\s+)?([a-zA-Z\s]{4,30})', "Carry {}"),
        (r'submit\s+(?:the\s+)?([a-zA-Z\s]{4,35})', "Submit {}"),
        (r'pay\s+(?:the\s+)?([a-zA-Z\s]{4,30})', "Pay {}"),
        (r'register\s+(?:for\s+)?([a-zA-Z\s]{4,30})', "Register for {}"),
        (r'clear\s+(?:all\s+)?([a-zA-Z\s]{4,30})', "Clear {}"),
        (r'collect\s+(?:from\s+)?([a-zA-Z\s]{4,30})', "Collect {}"),
        (r'report\s+(?:to\s+)?([a-zA-Z\s]{4,30})', "Report to {}"),
    ]
    text_clean = text.replace("\n", " ")
    for trigger, template in action_triggers:
        matches = re.finditer(trigger, text_clean, re.IGNORECASE)
        for m in matches:
            target = m.group(1).strip()
            # Stop at punctuation or prepositions
            target = re.split(r'[,.;]|\b(?:on|at|by|before|in|with|to)\b', target)[0].strip()
            if 3 <= len(target) <= 35:
                act = template.format(target)
                act = act[0].upper() + act[1:]
                if act not in actions:
                    actions.append(act)

    # Direct common actions
    if not actions:
        if re.search(r'\bexamination\b', text, re.IGNORECASE) and re.search(r'\bconducted|held\b', text, re.IGNORECASE):
            actions.append("Attend examination")
        elif re.search(r'\bworkshop\b', text, re.IGNORECASE) and re.search(r'\bregister\b', text, re.IGNORECASE):
            actions.append("Register for workshop")
        elif re.search(r'\bfee\b', text, re.IGNORECASE) and re.search(r'\bpay\b', text, re.IGNORECASE):
            actions.append("Pay prescribed fee")
        elif re.search(r'\bholiday\b', text, re.IGNORECASE):
            actions.append("Note college closure date")

    return actions[:4]

def extract_all_entities(text: str) -> Dict[str, Any]:
    dates = extract_dates(text)
    times = extract_times(text)
    deadline = extract_deadline(text)
    location = extract_location(text)
    department = extract_department(text)
    semester = extract_semester(text)
    requirements = extract_requirements(text)
    actions = extract_actions(text)

    # Event date is the primary date if not the deadline
    event_date = None
    if dates:
        for d in dates:
            if not deadline or d.lower() not in deadline.lower():
                event_date = d
                break
        if not event_date:
            event_date = dates[0]

    event_time = times[0] if times else None

    return {
        "date": event_date,
        "time": event_time,
        "deadline": deadline,
        "location": location,
        "department": department,
        "semester": semester,
        "requirements": requirements,
        "actions": actions
    }
