from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class RaciRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["raci_matrices"]

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, matrix_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(matrix_id)})

    async def update(self, matrix_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(matrix_id)}, {"$set": update_data}
        )
        return await self.get_by_id(matrix_id)

    async def delete(self, matrix_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(matrix_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        matrices = await cursor.to_list(length=page_size)
        return matrices, total
