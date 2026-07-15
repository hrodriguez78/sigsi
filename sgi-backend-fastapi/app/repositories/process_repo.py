from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class ProcessRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["processes"]

    async def create(self, process_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        process_data["created_at"] = now
        process_data["updated_at"] = now
        process_data["status"] = process_data.get("status", "borrador")
        result = await self.collection.insert_one(process_data)
        process_data["_id"] = result.inserted_id
        return process_data

    async def get_by_id(self, process_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(process_id)})

    async def get_by_code(self, org_id: str, code: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_id": org_id, "code": code})

    async def update(self, process_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(process_id)}, {"$set": update_data}
        )
        return await self.get_by_id(process_id)

    async def delete(self, process_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(process_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        process_type: str = "",
        status: str = "",
        parent_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        if process_type:
            query["process_type"] = process_type

        if status:
            query["status"] = status

        if parent_id:
            query["parent_id"] = parent_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("code", 1)
        processes = await cursor.to_list(length=page_size)
        return processes, total

    async def get_children(self, parent_id: str) -> list[dict]:
        cursor = self.collection.find({"parent_id": parent_id}).sort("code", 1)
        return await cursor.to_list(length=100)

    async def get_tree(self, org_id: str) -> list[dict]:
        all_procs = await self.collection.find(
            {"organization_id": org_id}
        ).sort("code", 1).to_list(length=500)

        by_id = {str(p["_id"]): p for p in all_procs}
        roots = []
        for p in all_procs:
            p["children"] = []
        for p in all_procs:
            parent = p.get("parent_id")
            if parent and parent in by_id:
                by_id[parent].setdefault("children", []).append(p)
            else:
                roots.append(p)
        return roots
