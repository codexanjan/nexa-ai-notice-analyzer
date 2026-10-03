import json
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from pathlib import Path
from app.core.config import settings

# In-memory + persisted fallback document collection
class LocalCollection:
    def __init__(self, name: str, file_path: Path):
        self.name = name
        self.file_path = file_path
        self._lock = asyncio.Lock()
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = []
        else:
            self._data = []

    def _save(self):
        try:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, default=str, indent=2)
        except Exception as e:
            print(f"[LocalCollection {self.name}] Save error: {e}")

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List[tuple]] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        async with self._lock:
            results = []
            for doc in self._data:
                match = True
                if query:
                    for k, v in query.items():
                        if k == "_id" and doc.get("_id") != v and doc.get("id") != v:
                            match = False
                            break
                        elif k != "_id":
                            if isinstance(v, dict):
                                # handle operators like $in, $gte, etc.
                                if "$in" in v and doc.get(k) not in v["$in"]:
                                    match = False
                                    break
                                if "$ne" in v and doc.get(k) == v["$ne"]:
                                    match = False
                                    break
                            elif doc.get(k) != v:
                                match = False
                                break
                if match:
                    results.append(dict(doc))
            
            if sort:
                for key, direction in reversed(sort):
                    reverse = (direction == -1 or direction == "desc")
                    results.sort(key=lambda x: str(x.get(key, "") or ""), reverse=reverse)
            
            if limit:
                results = results[:limit]
            return results

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        results = await self.find(query=query, limit=1)
        return results[0] if results else None

    async def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            doc = dict(document)
            if "_id" not in doc:
                doc["_id"] = str(uuid.uuid4())
            if "id" not in doc:
                doc["id"] = doc["_id"]
            if "created_at" not in doc:
                doc["created_at"] = datetime.now(timezone.utc).isoformat()
            if "updated_at" not in doc:
                doc["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._data.append(doc)
            self._save()
            return doc

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> int:
        async with self._lock:
            matched = 0
            for doc in self._data:
                match = True
                for k, v in query.items():
                    if (k == "_id" or k == "id") and doc.get("_id") != v and doc.get("id") != v:
                        match = False
                        break
                    elif k != "_id" and k != "id" and doc.get(k) != v:
                        match = False
                        break
                if match:
                    matched += 1
                    if "$set" in update:
                        for uk, uv in update["$set"].items():
                            doc[uk] = uv
                    else:
                        for uk, uv in update.items():
                            if not uk.startswith("$"):
                                doc[uk] = uv
                    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
                    self._save()
                    break
            return matched

    async def delete_one(self, query: Dict[str, Any]) -> int:
        async with self._lock:
            for idx, doc in enumerate(self._data):
                match = True
                for k, v in query.items():
                    if (k == "_id" or k == "id") and doc.get("_id") != v and doc.get("id") != v:
                        match = False
                        break
                    elif k != "_id" and k != "id" and doc.get(k) != v:
                        match = False
                        break
                if match:
                    self._data.pop(idx)
                    self._save()
                    return 1
            return 0

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        items = await self.find(query=query)
        return len(items)

    async def distinct(self, key: str) -> List[Any]:
        async with self._lock:
            vals = set()
            for doc in self._data:
                if key in doc and doc[key] is not None:
                    vals.add(doc[key])
            return list(vals)


class DatabaseManager:
    def __init__(self):
        self.is_mongodb: bool = False
        self._mongo_client = None
        self._mongo_db = None
        self._collections: Dict[str, Any] = {}

    async def initialize(self):
        if settings.MONGODB_URI:
            try:
                import motor.motor_asyncio
                self._mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=2000
                )
                # quick ping check
                await self._mongo_client.admin.command('ping')
                self._mongo_db = self._mongo_client[settings.DATABASE_NAME]
                self.is_mongodb = True
                print("Connected to MongoDB database successfully.")
                return
            except Exception as e:
                print(f"MongoDB connection failed: {e}. Falling back to high-performance local document store.")
                self.is_mongodb = False

        self.is_mongodb = False
        print("Using local persistent document database.")

    def get_collection(self, name: str):
        if self.is_mongodb and self._mongo_db is not None:
            return self._mongo_db[name]
        
        if name not in self._collections:
            file_path = settings.STORAGE_DIR / f"{name}.json"
            self._collections[name] = LocalCollection(name, file_path)
        return self._collections[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager
