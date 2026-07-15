from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create(self, user_data: dict) -> dict:
        user_data["created_at"] = datetime.now(timezone.utc)
        user_data["updated_at"] = datetime.now(timezone.utc)
        user_data["is_active"] = True
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data

    async def get_by_email(self, email: str) -> Optional[dict]:
        return await self.collection.find_one({"email": email})

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def update(self, user_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )
        return await self.get_by_id(user_id)

    async def delete(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count == 1

    async def list_users(self, page: int = 1, page_size: int = 20) -> tuple[list[dict], int]:
        total = await self.collection.count_documents({})
        skip = (page - 1) * page_size
        cursor = self.collection.find().skip(skip).limit(page_size).sort("created_at", -1)
        users = await cursor.to_list(length=page_size)
        return users, total
