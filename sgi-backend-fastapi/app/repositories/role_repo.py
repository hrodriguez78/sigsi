from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class RoleRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["roles"]

    async def create(self, role_data: dict) -> dict:
        role_data["created_at"] = datetime.now(timezone.utc)
        role_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.insert_one(role_data)
        role_data["_id"] = result.inserted_id
        return role_data

    async def get_by_id(self, role_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(role_id)})

    async def get_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"name": name})

    async def get_by_names(self, names: list[str]) -> list[dict]:
        cursor = self.collection.find({"name": {"$in": names}})
        return await cursor.to_list(length=100)

    async def update(self, role_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(role_id)}, {"$set": update_data}
        )
        return await self.get_by_id(role_id)

    async def delete(self, role_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(role_id)})
        return result.deleted_count > 0

    async def list_roles(self, page: int = 1, page_size: int = 50) -> tuple[list[dict], int]:
        total = await self.collection.count_documents({})
        skip = (page - 1) * page_size
        cursor = self.collection.find().skip(skip).limit(page_size).sort("name", 1)
        roles = await cursor.to_list(length=page_size)
        return roles, total

    async def list_all(self) -> list[dict]:
        cursor = self.collection.find().sort("name", 1)
        return await cursor.to_list(length=100)
