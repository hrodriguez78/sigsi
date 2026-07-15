from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class InspectionRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["inspections"]

    async def _next_inspection_number(self) -> str:
        count = await self.collection.count_documents({})
        return f"INS-{count + 1:05d}"

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = data.get("status", "programada")
        data["result"] = data.get("result", "pendiente")
        data["inspection_number"] = await self._next_inspection_number()
        data["findings"] = data.get("findings", [])
        data["corrective_actions"] = data.get("corrective_actions", [])
        data["score"] = data.get("score")
        for key in ("scheduled_date", "completed_date"):
            if hasattr(data.get(key), "isoformat"):
                data[key] = data[key].isoformat()
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, insp_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(insp_id)})

    async def update(self, insp_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(insp_id)}, {"$set": update_data}
        )
        return await self.get_by_id(insp_id)

    async def delete(self, insp_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(insp_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        status: str = "",
        inspection_type: str = "",
        result: str = "",
        client_org_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"$or": [
            {"organization_id": org_id},
            {"client_organization_id": org_id},
        ]}
        if search:
            query["$and"] = [{"$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"inspection_number": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]}]
        if status:
            query["status"] = status
        if inspection_type:
            query["inspection_type"] = inspection_type
        if result:
            query["result"] = result
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
            {"$group": {
                "_id": {"status": "$status", "result": "$result"},
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$score"},
            }},
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=50)
        stats = {"total": 0, "scheduled": 0, "in_progress": 0, "completed": 0,
                 "cancelled": 0, "passed": 0, "failed": 0, "partial": 0,
                 "avg_score": 0.0, "compliance_rate": 0.0}
        scores = []
        for r in results:
            count = r["count"]
            stats["total"] += count
            status = r["_id"].get("status", "")
            result_val = r["_id"].get("result", "")
            if status == "programada":
                stats["scheduled"] += count
            elif status == "en_curso":
                stats["in_progress"] += count
            elif status == "completada":
                stats["completed"] += count
            elif status == "cancelada":
                stats["cancelled"] += count
            if result_val == "aprobado":
                stats["passed"] += count
            elif result_val == "no_aprobado":
                stats["failed"] += count
            elif result_val == "parcial":
                stats["partial"] += count
            if r.get("avg_score") is not None:
                scores.append(r["avg_score"])
        if scores:
            stats["avg_score"] = round(sum(scores) / len(scores), 1)
        if stats["completed"] > 0:
            stats["compliance_rate"] = round(
                (stats["passed"] / stats["completed"]) * 100, 1
            )
        return stats
