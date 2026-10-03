import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if os.getenv("VERCEL"):
    STORAGE_DIR = Path("/tmp/data")
    UPLOAD_DIR = STORAGE_DIR / "uploads"
else:
    STORAGE_DIR = BASE_DIR / "data"
    UPLOAD_DIR = STORAGE_DIR / "uploads"
MODEL_DIR = BASE_DIR / "ml" / "models"

try:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    pass

class Settings(BaseModel):
    PROJECT_NAME: str = "NEXA — AI Notice Intelligence System"
    TAGLINE: str = "Read Less. Know More."
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nexa-super-secret-production-key-2026-b8ff3d")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "nexa_db")
    STORAGE_DIR: Path = STORAGE_DIR
    UPLOAD_DIR: Path = UPLOAD_DIR
    MODEL_DIR: Path = MODEL_DIR

settings = Settings()
