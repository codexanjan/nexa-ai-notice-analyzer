import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

@pytest.fixture(autouse=True)
def isolated_database(tmp_path, monkeypatch):
    from app.core.config import settings
    from app.core.database import db_manager
    import app.main as main
    monkeypatch.setattr(settings, "STORAGE_DIR", tmp_path)
    monkeypatch.setattr(settings, "MONGODB_URI", "")
    monkeypatch.setattr(settings, "DATABASE_URL", "")
    db_manager._collections.clear()
    db_manager.is_mongodb = False
    db_manager.is_postgres = False
    main._initialized = False
    yield
    db_manager._collections.clear()
    main._initialized = False
