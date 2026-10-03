# NEXA — AI Notice Intelligence System
### *Read Less. Know More.*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-00F0FF?style=for-the-badge&logo=vercel&logoColor=black)](https://nexa-ai-notice-platform.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Production Deployment
**Host URL:** **[https://nexa-ai-notice-platform.vercel.app](https://nexa-ai-notice-platform.vercel.app)**

---

## 🔑 Pre-Seeded Demo Accounts

Experience NEXA instantly with pre-seeded role-based credentials:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@nexa.edu` | `student123` | Notice Feed, AI Explainability Modal, Deadlines, Task Sync, Notifications |
| **Admin** | `admin@nexa.edu` | `admin123` | Upload Notices (PDF, Images, DOCX, Text), Create Notice, Analytics Intelligence |

---

## 📌 Problem & Solution

### The Campus Problem
Colleges and universities publish hundreds of unformatted, dense circulars, scanned PDFs, and memo images each month. Crucial scholarship deadlines, examination fee cutoffs, and placement requirements get buried in bureaucratic text, causing students to miss life-changing opportunities and incur severe late penalties.

### The NEXA Solution
**NEXA** is an AI-powered college notice intelligence platform that transforms unstructured notices into prioritized, structured, explainable, and actionable student intelligence in seconds.

---

## ✨ Novelty & Standout Features

### 1. 🧠 Transparent & Explainable AI Importance Scoring (0–100)
Unlike opaque "black box" classifiers, NEXA's importance engine computes scores deterministically across 5 orthogonal weighted dimensions:

$$\text{Importance Score} = 0.20 \cdot C + 0.25 \cdot D + 0.20 \cdot A + 0.15 \cdot U + 0.10 \cdot Q + 0.10 \cdot E$$

- **$C$ — Category Criticality (20%)**: High-stakes domains (Examinations, Fees, Registrations, Placements).
- **$D$ — Deadline Proximity (25%)**: Proximity to deadline (<=24 hrs = 100%, <=3 days = 85%, <=7 days = 60%).
- **$A$ — Student Action Required (20%)**: Imperative action verbs ("must submit", "mandatory payment", "compulsory").
- **$U$ — Urgency Signals (15%)**: Explicit urgency terms ("immediate", "strict cutoff", "last date").
- **$Q$ — Consequence Severity (10%)**: Negative consequences ("late fee fine", "disqualified", "not permitted").
- **$E$ — Event Timeline Proximity (10%)**: Imminence of mentioned workshop, drive, or session dates.

### 2. ⚡ Multi-Tier Summaries ("Explain Like I'm 5")
Every notice offers 3 selectable comprehension levels:
- **Executive Takeaway**: 1-2 sentence core message.
- **Action Checklist**: What the student must do step-by-step.
- **Requirements & Documents**: College IDs, fee receipts, resumes, or hall tickets detected by the parser.

### 3. 📄 Multimodal Document Parsing
Supports instant text extraction from:
- **Scanned PDF Documents**: Parsed via PyMuPDF vector and text layout extraction.
- **Office Files**: Native `.docx` text runs and tables.
- **Images & Photos**: Embedded OCR preprocessing.
- **Raw Text & Pasted Circulars**: Instant real-time interactive sandbox analysis.

### 4. ⏱️ Active Deadlines Countdown Center
Categorizes actionable items into:
- **Due Today** ($\le$ 24 hours remaining)
- **Due This Week** (24 – 168 hours remaining)
- **Upcoming** (> 7 days remaining)
- **Completed Archive**

### 5. 📋 Smart Task Sync
Auto-extracts actionable tasks from circulars and lets students add, check off, or track them in their personal dashboard.

### 6. 📊 Real-Time Analytics Intelligence
- Category volume distributions.
- Importance level heatmaps (Critical, High, Medium, Low).
- Timeline velocity of campus communications.

---

## 🏗️ Architecture & Technology Stack

```
nexa-ai-notice-platform/
├── api/
│   ├── index.py              # Serverless entrypoint for Vercel
│   └── requirements.txt      # Serverless dependencies
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI Routers (auth, notices, tasks, deadlines, etc.)
│   │   ├── ai/               # NLP Classifier & Importance Scoring Engine
│   │   ├── core/             # Configuration, Database Manager & Security
│   │   ├── ocr/              # PDF & Document Extractors
│   │   ├── schemas/          # Pydantic Schemas & DTOs
│   │   └── services/         # Business Logic & Document Services
│   └── tests/                # Automated Pytest Suite
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── pages/            # Student, Admin & Auth views
│   │   ├── services/         # Axios API clients
│   │   └── store/            # React Auth context & session storage
│   └── public/               # Logos, hero graphics, and static assets
├── vercel.json               # Production Vercel rewrite configuration
└── requirements.txt          # Python dependencies
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Recharts.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Scikit-learn (TF-IDF), PyMuPDF, Python-JOSE, Passlib.
- **Database**: High-performance persistent document store with automated MongoDB Atlas driver support.
- **Hosting**: Vercel Serverless Edge (Static CDN + Python ASGI runtime).

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r ../requirements.txt

# Run backend development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend interface will be live at: `http://localhost:5173`

---

## 🧪 Testing Suite

### Running Backend Tests
```bash
python -m pytest backend/tests
```
Verifies:
- `test_nlp_and_scoring.py`: TF-IDF categorization, importance scoring boundaries, deadline extraction.
- `test_api_endpoints.py`: End-to-end authentication, notice creation, deadlines, tasks, and analytics.

### Running Frontend Checks
```bash
cd frontend
# TypeScript verification
npm run build

# Code hygiene & linting
npm run lint
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and database connection status |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token |
| `POST` | `/api/auth/register` | Register a new student or faculty account |
| `GET` | `/api/notices` | List notices with filter by category/urgency |
| `POST` | `/api/notices` | Create a new notice (Admin required) |
| `POST` | `/api/notices/upload` | Upload & extract PDF, DOCX, or Image circulars |
| `POST` | `/api/ai/analyze` | Real-time AI classification & importance scoring |
| `GET` | `/api/deadlines` | Grouped deadlines (Due Today / This Week / Upcoming) |
| `GET` | `/api/tasks` | Student actionable task items |
| `GET` | `/api/analytics/dashboard`| Aggregate category, urgency, and timeline metrics |

---

## 📄 License
This project is licensed under the MIT License.

---

<div align="center">

Made with ❤️ by [Anjan Shetty](https://github.com/codexanjan)

[![GitHub](https://img.shields.io/badge/GitHub-codexanjan-181717?style=flat&logo=github)](https://github.com/codexanjan)

</div>

