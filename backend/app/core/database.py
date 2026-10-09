import json
import uuid
import asyncio
from copy import deepcopy
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
                        if k == "$or":
                            if not any(all(doc.get(field) == value for field, value in branch.items()) for branch in v):
                                match = False
                                break
                            continue
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
                    results.append(deepcopy(doc))
            
            if sort:
                for key, direction in reversed(sort):
                    reverse = (direction == -1 or direction == "desc")
                    results.sort(key=lambda x: (x.get(key) is not None, x.get(key) if isinstance(x.get(key), (int, float)) else str(x.get(key) or "")), reverse=reverse)
            
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


class MongoCollection:
    """Expose the same document interface as the local store."""
    def __init__(self, collection):
        self.collection = collection

    async def find(self, query=None, sort=None, limit=None):
        cursor = self.collection.find(query or {})
        if sort:
            cursor = cursor.sort(sort)
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(length=limit)

    async def find_one(self, query):
        return await self.collection.find_one(query)

    async def insert_one(self, document):
        doc = deepcopy(document)
        doc.setdefault("_id", str(uuid.uuid4()))
        doc.setdefault("id", doc["_id"])
        doc.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        doc.setdefault("updated_at", doc["created_at"])
        await self.collection.insert_one(doc)
        return doc

    async def update_one(self, query, update):
        update.setdefault("$set", {})["updated_at"] = datetime.now(timezone.utc).isoformat()
        return (await self.collection.update_one(query, update)).matched_count

    async def delete_one(self, query):
        return (await self.collection.delete_one(query)).deleted_count

    async def count_documents(self, query=None):
        return await self.collection.count_documents(query or {})

    async def distinct(self, key):
        return await self.collection.distinct(key)


class DatabaseManager:
    def __init__(self):
        self.is_mongodb: bool = False
        self.is_postgres: bool = False
        self._mongo_client = None
        self._mongo_db = None
        self._collections: Dict[str, Any] = {}

    async def initialize(self):
        if settings.DATABASE_URL:
            from app.core.postgres import initialize_postgres
            await initialize_postgres(settings.DATABASE_URL)
            self.is_postgres = True
            return
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
                await self._mongo_db.users.create_index("email", unique=True)
                print("Connected to MongoDB database successfully.")
                return
            except Exception:
                self.is_mongodb = False
                raise RuntimeError("MongoDB connection failed. Check the connection and network access settings.")

        self.is_mongodb = False
        print("Using local persistent document database.")

    def get_collection(self, name: str):
        if self.is_postgres:
            from app.core.postgres import PostgresCollection
            return PostgresCollection(settings.DATABASE_URL, name)
        if self.is_mongodb and self._mongo_db is not None:
            return MongoCollection(self._mongo_db[name])
        
        if name not in self._collections:
            file_path = settings.STORAGE_DIR / f"{name}.json"
            self._collections[name] = LocalCollection(name, file_path)
        return self._collections[name]

    @property
    def is_durable(self):
        return self.is_mongodb or self.is_postgres

db_manager = DatabaseManager()

def get_db():
    return db_manager
