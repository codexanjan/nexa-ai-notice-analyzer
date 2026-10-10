import os
from pathlib import Path
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import db_manager
from app.core.security import get_password_hash
from app.services.notice_service import create_notice, get_notices
from app.services.task_service import create_task
from app.services.notification_service import create_notification
from app.api.auth import router as auth_router
from app.api.notices import router as notices_router
from app.api.deadlines import router as deadlines_router
from app.api.tasks import router as tasks_router
from app.api.notifications import router as notifications_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router

SAMPLE_NOTICES = [
    {
        "title": "Internal Assessment Examination Schedule",
        "content": "All students are informed that the internal assessment examination for the current semester will be conducted on Monday at 10 AM in Main Auditorium. Students must carry their college ID cards and hall tickets. Entry closes 15 minutes before the exam.",
        "category": "EXAMINATION",
        "department": "Examination Branch",
        "deadline": "Monday",
        "event_date": "Monday",
        "event_time": "10:00 AM",
        "location": "Main Auditorium"
    },
    {
        "title": "Final Date for Examination Registration and Fee Payment",
        "content": "Final date for examination registration and payment of fee is today at 5 PM. Students who fail to register will not be permitted to appear for the semester examination. Late submission will incur a severe penalty.",
        "category": "REGISTRATION",
        "department": "Administrative Block",
        "deadline": "today at 5 PM",
        "event_date": "today",
        "event_time": "5:00 PM",
        "location": "Counter 3"
    },
    {
        "title": "Google Campus Placement Drive 2026",
        "content": "Campus recruitment drive by Google for Software Engineering roles is scheduled on 10 October 2026 at 9:30 AM in Main Auditorium. Eligible final year students must submit their verified resumes on or before Friday.",
        "category": "PLACEMENT",
        "department": "Placement Cell",
        "deadline": "Friday",
        "event_date": "10 October 2026",
        "event_time": "9:30 AM",
        "location": "Main Auditorium"
    },
    {
        "title": "Semester Tuition Fee Due Notice",
        "content": "Notice regarding payment of semester tuition fee. Last date to pay fee without fine is 15 October 2026. A late fee penalty of Rs. 500 will be charged thereafter.",
        "category": "FEES",
        "department": "Accounts Section",
        "deadline": "15 October 2026",
        "event_date": "15 October 2026",
        "event_time": "4:00 PM",
        "location": "Accounts Counter"
    },
    {
        "title": "Declaration of College Holiday",
        "content": "The college will remain closed on Friday on account of National Holiday. All scheduled lectures and laboratory sessions stand suspended. College offices will resume normal working hours on Monday.",
        "category": "HOLIDAY",
        "department": "Registrar Office",
        "deadline": None,
        "event_date": "Friday",
        "location": "Campus"
    },
    {
        "title": "Hands-on Workshop on Generative AI and Deep Learning",
        "content": "Department of Computer Science is organizing a two-day certified workshop on Generative AI on 12 October 2026 at 10:00 AM in CS Lab 3. Students interested in participating may register before 10 October 2026.",
        "category": "WORKSHOP",
        "department": "Computer Science",
        "deadline": "10 October 2026",
        "event_date": "12 October 2026",
        "event_time": "10:00 AM",
        "location": "CS Lab 3"
    }
]

async def seed_initial_data():
    users_col = db_manager.get_collection("users")
    
    # 1. Admin User
    admin = await users_col.find_one({"email": "admin@nexa.edu"})
    if not admin:
        admin_doc = {
            "name": "System Administrator",
            "email": "admin@nexa.edu",
            "password": get_password_hash("admin123"),
            "student_id": "ADM-001",
            "role": "ADMIN"
        }
        admin_doc["demo"] = True
        await users_col.insert_one(admin_doc)

    # 2. Student User
    student = await users_col.find_one({"email": "student@nexa.edu"})
    if not student:
        student_doc = {
            "name": "Alex Chen",
            "email": "student@nexa.edu",
            "password": get_password_hash("student123"),
            "student_id": "CS-2026-042",
            "role": "STUDENT"
        }
        await users_col.insert_one(student_doc)
    bootstrap_email = os.getenv("ADMIN_EMAIL")
    bootstrap_password = os.getenv("ADMIN_PASSWORD")
    if bootstrap_email and bootstrap_password and not await users_col.find_one({"email": bootstrap_email.lower()}):
        await users_col.insert_one({"name": "Institution Administrator", "email": bootstrap_email.lower(), "password": get_password_hash(bootstrap_password), "role": "ADMIN", "demo": False})

    # 3. Seed sample notices if empty
    existing_notices = await get_notices(limit=5)
    if len(existing_notices) == 0:
        created_notices = []
        for sample in SAMPLE_NOTICES:
            doc = await create_notice(sample)
            created_notices.append(doc)
        print(f"Seeded {len(created_notices)} realistic notices.")

        # Seed sample tasks
        if created_notices:
            await create_task({
                "title": "Carry college ID card for Internal Assessment Exam",
                "notice_id": created_notices[0]["_id"],
                "deadline": "Monday",
                "priority": "CRITICAL",
                "status": "Pending"
            })
            await create_task({
                "title": "Submit verified resume to Placement Cell",
                "notice_id": created_notices[2]["_id"],
                "deadline": "Friday",
                "priority": "HIGH",
                "status": "In Progress"
            })

        # Seed sample notification
        if created_notices:
            await create_notification(
                title="🔴 Critical Notice: Internal Assessment Examination",
                message="Internal assessment examination will be held Monday at 10 AM. Carry college ID cards.",
                notice_id=created_notices[0]["_id"],
                importance_score=95,
                notification_type="CRITICAL"
            )

_initialized = False
_init_lock = asyncio.Lock()

async def ensure_initialized():
    global _initialized
    async with _init_lock:
        if not _initialized:
            await db_manager.initialize()
            await seed_initial_data()
            _initialized = True

@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_initialized()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Notice Intelligence System for Colleges. Transforms unstructured notices into prioritized, structured, explainable information.",
    version=settings.VERSION,
    lifespan=lifespan
)

@app.middleware("http")
async def ensure_db_initialized_middleware(request, call_next):
    if not _initialized:
        await ensure_initialized()
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(notices_router, prefix="/api")
app.include_router(deadlines_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

# Also include without /api prefix for flexibility
app.include_router(auth_router)
app.include_router(notices_router)
app.include_router(deadlines_router)
app.include_router(tasks_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(ai_router)

@app.get("/api")
@app.get("/api/")
def api_root():
    return {
        "system": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "api_docs": "/docs"
    }

@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "postgresql" if db_manager.is_postgres else "mongodb" if db_manager.is_mongodb else "local_document_store",
        "durable": db_manager.is_durable or not bool(os.getenv("VERCEL")),
        "mode": "live" if db_manager.is_durable else "demo",
        "model_loaded": True
    }

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/")
    async def root():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target = (frontend_dist / full_path).resolve()
        if target.is_relative_to(frontend_dist.resolve()) and target.is_file():
            return FileResponse(target)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "system": settings.PROJECT_NAME,
            "tagline": settings.TAGLINE,
            "version": settings.VERSION,
            "status": "OPERATIONAL",
            "api_docs": "/docs"
        }
