from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class OrganizationRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["organizations"]

    async def create(self, org_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        org_data["created_at"] = now
        org_data["updated_at"] = now
        result = await self.collection.insert_one(org_data)
        org_data["_id"] = result.inserted_id
        return org_data

    async def get_by_id(self, org_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(org_id)})

    async def get_by_nit(self, nit: str) -> Optional[dict]:
        return await self.collection.find_one({"nit": nit})

    async def update(self, org_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(org_id)}, {"$set": update_data}
        )
        return await self.get_by_id(org_id)

    async def delete(self, org_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(org_id)})
        return result.deleted_count == 1

    async def list_all(self, page: int = 1, page_size: int = 20, search: str = "") -> tuple[list[dict], int]:
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"nit": {"$regex": search, "$options": "i"}},
            ]
        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("name", 1)
        orgs = await cursor.to_list(length=page_size)
        return orgs, total
