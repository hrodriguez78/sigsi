from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class DailyReportRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["daily_reports"]

    async def _next_report_number(self) -> str:
        count = await self.collection.count_documents({})
        return f"RPT-{count + 1:05d}"

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = data.get("status", "borrador")
        data["report_number"] = await self._next_report_number()
        data["reviewer_comments"] = data.get("reviewer_comments", "")
        data["reviewed_by"] = data.get("reviewed_by")
        if hasattr(data.get("report_date"), "isoformat"):
            data["report_date"] = data["report_date"].isoformat()
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, report_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(report_id)})

    async def update(self, report_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(report_id)}, {"$set": update_data}
        )
        return await self.get_by_id(report_id)

    async def delete(self, report_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(report_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        status: str = "",
        report_type: str = "",
        client_org_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"$or": [
            {"organization_id": org_id},
            {"client_organization_id": org_id},
        ]}
        if search:
            query["$and"] = [{"$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"report_number": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]}]
        if status:
            query["status"] = status
        if report_type:
            query["report_type"] = report_type
        if client_org_id:
            query["client_organization_id"] = client_org_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("report_date", -1)
        items = await cursor.to_list(length=page_size)
        return items, total

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"$or": [
                {"organization_id": org_id},
                {"client_organization_id": org_id},
            ]}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_hours": {"$sum": "$hours_worked"},
            }},
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=20)
        stats = {"total": 0, "draft": 0, "submitted": 0, "reviewed": 0,
                 "approved": 0, "rejected": 0, "total_hours": 0.0,
                 "avg_hours_per_report": 0.0}
        status_map = {
            "borrador": "draft", "enviado": "submitted",
            "revisado": "reviewed", "aprobado": "approved",
            "rechazado": "rejected",
        }
        for r in results:
            key = status_map.get(r["_id"], r["_id"])
            stats[key] = r["count"]
            stats["total"] += r["count"]
            stats["total_hours"] += r.get("total_hours", 0)
        if stats["total"] > 0:
            stats["avg_hours_per_report"] = round(stats["total_hours"] / stats["total"], 1)
        return stats
