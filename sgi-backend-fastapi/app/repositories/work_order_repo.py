from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class WorkOrderRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["work_orders"]
        self.comments_collection = db["work_order_comments"]

    async def _next_order_number(self) -> str:
        count = await self.collection.count_documents({})
        return f"OT-{count + 1:05d}"

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = data.get("status", "pendiente")
        data["order_number"] = await self._next_order_number()
        data["resolution_notes"] = data.get("resolution_notes", "")
        data["comments_count"] = 0
        data["assets_involved"] = data.get("assets_involved", [])
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, wo_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(wo_id)})

    async def update(self, wo_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(wo_id)}, {"$set": update_data}
        )
        return await self.get_by_id(wo_id)

    async def delete(self, wo_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(wo_id)})
        if result.deleted_count == 1:
            await self.comments_collection.delete_many({"work_order_id": wo_id})
            return True
        return False

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        status: str = "",
        order_type: str = "",
        priority: str = "",
        client_org_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"$or": [
            {"organization_id": org_id},
            {"client_organization_id": org_id},
        ]}
        if search:
            query["$and"] = [{"$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"order_number": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]}]
        if status:
            query["status"] = status
        if order_type:
            query["order_type"] = order_type
        if priority:
            query["priority"] = priority
        if client_org_id:
            query["client_organization_id"] = client_org_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        items = await cursor.to_list(length=page_size)
        return items, total

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"$or": [
                {"organization_id": org_id},
                {"client_organization_id": org_id},
            ]}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=20)
        stats = {"total": 0, "pending": 0, "scheduled": 0, "in_progress": 0,
                 "on_hold": 0, "completed": 0, "cancelled": 0, "verified": 0,
                 "avg_completion_hours": 0.0, "overdue": 0}
        status_map = {
            "pendiente": "pending", "programada": "scheduled",
            "en_progreso": "in_progress", "en_espera": "on_hold",
            "completada": "completed", "cancelada": "cancelled",
            "verificada": "verified",
        }
        for r in results:
            key = status_map.get(r["_id"], r["_id"])
            stats[key] = r["count"]
            stats["total"] += r["count"]
        return stats

    # --- COMMENTS ---
    async def add_comment(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        result = await self.comments_collection.insert_one(data)
        data["_id"] = result.inserted_id
        await self.collection.update_one(
            {"_id": ObjectId(data["work_order_id"])},
            {"$inc": {"comments_count": 1}},
        )
        return data

    async def get_comments(self, wo_id: str) -> list[dict]:
        cursor = self.comments_collection.find({"work_order_id": wo_id}).sort("created_at", -1)
        return await cursor.to_list(length=200)
