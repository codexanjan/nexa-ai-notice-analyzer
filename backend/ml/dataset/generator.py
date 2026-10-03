import random
import csv
from pathlib import Path
from typing import List, Dict

CATEGORIES = [
    "EXAMINATION", "ASSIGNMENT", "ATTENDANCE", "FEES", "PLACEMENT",
    "SCHOLARSHIP", "EVENT", "HOLIDAY", "ACADEMIC", "ADMINISTRATION",
    "ADMISSION", "WORKSHOP", "INTERNSHIP", "RESULT", "REGISTRATION",
    "HOSTEL", "TRANSPORT", "EMERGENCY", "GENERAL"
]

TEMPLATES = {
    "EXAMINATION": [
        "All students are hereby informed that the {exam_type} will be held on {date} at {time}. Students must carry their hall tickets and college ID cards. Calculators are {allowed}.",
        "Schedule for the semester end examinations commencing from {date}. Examination timings are {time}. Entry into examination halls closes 15 minutes before exam.",
        "Notification regarding mid-term assessment exam for {branch} students scheduled on {date} in {location}. Malpractice will attract severe penalty.",
        "Supplementary and backlog examination time table published. The examination commences on {date}. Check official hall seating list."
    ],
    "ASSIGNMENT": [
        "Students of semester {sem} must submit assignment {num} for {subject} on or before {date}. Late submission will incur a penalty.",
        "Submission deadline for laboratory reports and assignments is {date} at {time}. Submit hard copies directly to faculty cabin.",
        "All students must upload their project milestone assignment on the portal by {date} 11:59 PM.",
        "Continuous assessment assignment 2 is uploaded on portal. Last date of submission is {date}."
    ],
    "ATTENDANCE": [
        "Students with attendance below 75% are hereby warned. Condonation application must be submitted by {date} with valid medical certificates.",
        "Notice regarding attendance shortage: Final shortage list displayed on notice board. Students having shortage cannot appear for semester examination.",
        "Monthly attendance review meeting scheduled on {date} at {time} in {location}. All mentor faculty and defaulting students must attend.",
        "Attendance percentage cutoff notice for semester {sem}. Detained students list will be declared on {date}."
    ],
    "FEES": [
        "Notice regarding payment of semester tuition fee. Last date to pay fee without fine is {date}. Late fee of Rs. 500 applicable after deadline.",
        "Examination fee registration portal is now open. Students must pay the requisite examination fee by {date} through college portal.",
        "Hostel and mess fee dues must be cleared before {date}. Non-payment will lead to cancellation of hostel allotment.",
        "Pending fee clearance notice: Clear all library and tuition fee dues by {date} to obtain no-dues certificate."
    ],
    "PLACEMENT": [
        "Campus recruitment drive by {company} scheduled on {date} at {time} in {location}. Eligible students must register before {date}.",
        "Placement drive briefing and pre-placement talk by {company} on {date}. Shortlisted students must attend in formal dress code with 3 copies of resume.",
        "Online coding test for campus placements with {company} will be conducted on {date} at {time}. Carry laptops and ID card.",
        "Job offer acceptance and documentation session for selected students on {date} in placement cell."
    ],
    "SCHOLARSHIP": [
        "Applications are invited for the merit-cum-means national scholarship. Eligible students must submit verified application by {date}.",
        "State government post-matric scholarship renewal deadline extended to {date}. Submit bank account verification documents to scholarship section.",
        "Alumni endowment scholarship interview scheduled on {date} at {time}. Shortlisted candidates must bring original caste and income certificates.",
        "Notice for fee reimbursement scholarship portal opening. Complete e-KYC and upload marksheets before {date}."
    ],
    "EVENT": [
        "Annual technical symposium and cultural festival scheduled from {date}. Registrations for various events open until {date}.",
        "Annual sports meet inauguration on {date} at {time} in college sports ground. All students are invited to cheer.",
        "College foundation day celebration on {date} in the main auditorium. Chief guest will address the gathering at {time}.",
        "Alumni homecoming meet will be held on {date} at {time}. Join us for networking and keynote lectures."
    ],
    "HOLIDAY": [
        "The college will remain closed on {date} on account of {occasion}. Regular academic classes will resume on the following working day.",
        "Declaration of holiday on {date} following district administration advisory. All scheduled classes stand suspended.",
        "Mid-semester break and festive holidays will be observed from {date} to {end_date}. College offices will reopen on Monday.",
        "Public holiday notice: College will be non-operational on {date}. Library services will be closed."
    ],
    "ACADEMIC": [
        "Academic calendar for the upcoming semester released. Commencement of regular classes from {date}. Attendance is compulsory from day one.",
        "Elective subject selection portal will open on {date} at {time}. Students must finalize their open electives before {date}.",
        "Notice regarding commencement of remedial classes for slow learners starting from {date} in block {location}.",
        "Changes in class timetable for semester {sem} effective from {date}. Revised schedule uploaded on department board."
    ],
    "ADMINISTRATION": [
        "Distribution of permanent student identity cards and smart bus passes will take place from {date} in admin office counter 3.",
        "Notice regarding verification of original certificates and submission of transfer certificates by {date}.",
        "College administrative offices will operate with revised working hours from 9:00 AM to 5:00 PM starting {date}.",
        "Procedure for obtaining migration certificate and transcript copies from administrative registrar section."
    ],
    "ADMISSION": [
        "Notification regarding spot admission counselling for vacant seats in B.Tech on {date} at {time} in seminar hall.",
        "Document verification for newly admitted students will be conducted from {date} to {end_date} at the admissions desk.",
        "Reporting date for candidates allotted through central counselling is {date}. Carry all original certificates.",
        "M.Tech and Ph.D admission entrance interview dates announced for {date} in dean office."
    ],
    "WORKSHOP": [
        "Two-day hands-on workshop on Artificial Intelligence and Machine Learning on {date} at {time} in Lab 4. Register by {date}.",
        "Department of Computer Science is organizing a certified workshop on Cloud Computing on {date}. Limited seats available.",
        "Robotics and IoT training boot-camp will be conducted on {date} in maker lab. Registration fee Rs. 300.",
        "Skill development workshop on Effective Technical Writing and Research Publishing on {date} at {time}."
    ],
    "INTERNSHIP": [
        "Summer internship opportunities at research laboratories and industry partners. Submit application and NOC by {date}.",
        "All final year students must submit their mandatory 6-month internship completion certificate and evaluation report by {date}.",
        "Industrial training and internship orientation session on {date} at {time} in conference hall.",
        "Notice regarding stipend distribution and internship mentor allotment for semester {sem}."
    ],
    "RESULT": [
        "Results for semester end examinations conducted in {season} have been published on college student portal.",
        "Notice regarding revaluation and photocopy of answer scripts for semester {sem}. Last date to apply is {date}.",
        "Grade sheets distribution for graduating batch will commence from {date} at student affairs counter.",
        "Challenge evaluation notification: Students wishing to apply for challenge valuation must pay fee by {date}."
    ],
    "REGISTRATION": [
        "Course registration and subject enrollment for the upcoming semester starts from {date}. Registration closes on {date}.",
        "Final date for examination registration is {date} at {time}. Students who fail to register will not be permitted to appear.",
        "Convocation degree certificate registration portal open until {date}. Register online and choose in-person or postal delivery.",
        "Club and professional student chapter membership registration drive open till {date}."
    ],
    "HOSTEL": [
        "Hostel room allotment and room change applications for next academic year must be submitted by {date}.",
        "Notice regarding hostel gate timings: Hostellers must return to premises before 8:30 PM strictly. Late entry incurs fine.",
        "Hostel maintenance and pest control schedule on {date}. Residents are requested to cooperate.",
        "Mess committee meeting with hostel warden on {date} at {time} in hostel dining hall."
    ],
    "TRANSPORT": [
        "College bus route modifications effective from {date}. Route 14 will now cover additional pickup points.",
        "Renewal of college bus transportation pass for current semester closes on {date}. Carry payment receipt.",
        "Notice: College bus service will leave 30 minutes early on {date} on account of sports day.",
        "Commencement of special shuttle service between metro station and campus starting from {date}."
    ],
    "EMERGENCY": [
        "URGENT: Heavy rainfall warning and cyclone alert. College will remain closed tomorrow. All exams postponed.",
        "EMERGENCY NOTICE: Campus power maintenance shutdown on {date} from {time}. Critical servers on backup power.",
        "Immediate evacuation drill and fire safety awareness session on {date} at {time}. Attendance is mandatory.",
        "Health alert: Emergency first aid medical camp set up at health centre. Students experiencing fever must report immediately."
    ],
    "GENERAL": [
        "Lost and Found: A blue backpack containing books and a calculator was found in {location}. Collect from security office.",
        "Annual campus tree plantation drive on {date} at {time}. Green club invites volunteers.",
        "Library book return notice: Return all issued books before {date} to avoid overdue overdue fines.",
        "Notice regarding cleanliness in campus canteen and ban on single-use plastics across premises."
    ]
}

BRANCHES = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical", "AI & Data Science"]
COMPANIES = ["Google", "Microsoft", "Amazon", "Infosys", "TCS", "Accenture", "Wipro", "Cognizant", "Deloitte"]
LOCATIONS = ["Main Auditorium", "Seminar Hall 1", "Room 302", "CS Lab 3", "Campus Ground", "Admin Block", "Library Hall"]
DATES = ["Monday", "Tuesday", "Friday", "10 October 2026", "15 November 2026", "tomorrow", "today at 5 PM", "next Monday"]
TIMES = ["10:00 AM", "2:00 PM", "9:30 AM", "11:00 AM", "3:30 PM", "5:00 PM"]
OCCASIONS = ["National Holiday", "Festival", "Gandhi Jayanti", "Independence Day", "Local Election"]

def generate_sample(category: str, sample_id: int) -> Dict[str, str]:
    template = random.choice(TEMPLATES[category])
    text = template.format(
        exam_type=random.choice(["Internal Assessment Examination", "Semester End Exam", "Midterm Assessment"]),
        date=random.choice(DATES),
        end_date="20 October 2026",
        time=random.choice(TIMES),
        branch=random.choice(BRANCHES),
        location=random.choice(LOCATIONS),
        allowed=random.choice(["strictly prohibited", "permitted only for engineering math"]),
        sem=random.choice(["III", "IV", "V", "VI", "VII"]),
        num=random.choice(["1", "2", "3", "4"]),
        subject=random.choice(["Machine Learning", "Data Structures", "Operating Systems", "Computer Networks"]),
        company=random.choice(COMPANIES),
        occasion=random.choice(OCCASIONS),
        season=random.choice(["May/June 2026", "Nov/Dec 2025"])
    )
    title = f"{category.capitalize()}: {text[:40].strip()}..."
    return {
        "notice_id": f"NOT-{sample_id:05d}",
        "title": title,
        "content": text,
        "category": category,
        "date": random.choice(DATES),
        "deadline": random.choice(["2026-10-15", "tomorrow", "Friday", None])
    }

def generate_dataset(output_path: Path, count: int = 2500):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    samples = []
    per_cat = max(1, count // len(CATEGORIES))
    sample_id = 1
    for cat in CATEGORIES:
        for _ in range(per_cat):
            samples.append(generate_sample(cat, sample_id))
            sample_id += 1
    
    # Fill remainder
    while len(samples) < count:
        cat = random.choice(CATEGORIES)
        samples.append(generate_sample(cat, sample_id))
        sample_id += 1

    random.shuffle(samples)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["notice_id", "title", "content", "category", "date", "deadline"])
        writer.writeheader()
        writer.writerows(samples)
    print(f"Generated {len(samples)} synthetic notices saved to {output_path}")

if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "notices.csv"
    generate_dataset(out, count=2500)
