from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class AIRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.sessions = db["ai_chat_sessions"]
        self.suggestions = db["ai_suggestions"]

    async def create_session(self, user_id: str, title: str = "Nueva sesión") -> dict:
        doc = {
            "user_id": user_id,
            "title": title,
            "messages": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = await self.sessions.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def get_session(self, session_id: str) -> Optional[dict]:
        return await self.sessions.find_one({"_id": ObjectId(session_id)})

    async def add_message(self, session_id: str, role: str, content: str) -> Optional[dict]:
        message = {"role": role, "content": content, "timestamp": datetime.now(timezone.utc).isoformat()}
        await self.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )
        return await self.get_session(session_id)

    async def list_sessions(self, user_id: str, limit: int = 20) -> list[dict]:
        cursor = self.sessions.find({"user_id": user_id}).sort("updated_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def delete_session(self, session_id: str) -> bool:
        result = await self.sessions.delete_one({"_id": ObjectId(session_id)})
        return result.deleted_count > 0

    async def save_suggestion(self, user_id: str, module: str, suggestion: str, context: dict) -> dict:
        doc = {
            "user_id": user_id,
            "module": module,
            "suggestion": suggestion,
            "context": context,
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.suggestions.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc
