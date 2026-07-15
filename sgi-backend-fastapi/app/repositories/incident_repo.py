from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class IncidentRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["incidents"]
        self.comments = db["incident_comments"]

    async def create(self, incident_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        incident_data["created_at"] = now
        incident_data["updated_at"] = now
        incident_data["status"] = "abierto"
        result = await self.collection.insert_one(incident_data)
        incident_data["_id"] = result.inserted_id
        return incident_data

    async def get_by_id(self, incident_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(incident_id)})

    async def update(self, incident_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        if update_data.get("status") == "cerrado" and not update_data.get("resolved_at"):
            update_data["resolved_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(incident_id)}, {"$set": update_data}
        )
        return await self.get_by_id(incident_id)

    async def delete(self, incident_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(incident_id)})
        await self.comments.delete_many({"incident_id": incident_id})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        incident_type: str = "",
        severity: str = "",
        status: str = "",
        priority: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        if incident_type:
            query["incident_type"] = incident_type
        if severity:
            query["severity"] = severity
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        incidents = await cursor.to_list(length=page_size)
        return incidents, total

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_type": [{"$group": {"_id": "$incident_type", "count": {"$sum": 1}}}],
                    "by_severity": [{"$group": {"_id": "$severity", "count": {"$sum": 1}}}],
                    "by_status": [{"$group": {"_id": "$status", "count": {"$sum": 1}}}],
                    "open_count": [
                        {"$match": {"status": {"$in": ["abierto", "en_investigacion"]}}},
                        {"$count": "count"},
                    ],
                    "resolution_times": [
                        {"$match": {"resolved_at": {"$exists": True}}},
                        {
                            "$project": {
                                "hours": {
                                    "$divide": [
                                        {"$subtract": ["$resolved_at", "$created_at"]},
                                        3600000,
                                    ]
                                }
                            }
                        },
                        {"$group": {"_id": None, "avg_hours": {"$avg": "$hours"}}},
                    ],
                }
            },
        ]

        result = await self.collection.aggregate(pipeline).to_list(1)
        if not result:
            return {
                "total": 0,
                "by_type": {},
                "by_severity": {},
                "by_status": {},
                "avg_resolution_hours": 0,
                "open_count": 0,
            }

        data = result[0]
        return {
            "total": data["total"][0]["count"] if data["total"] else 0,
            "by_type": {item["_id"]: item["count"] for item in data["by_type"]},
            "by_severity": {item["_id"]: item["count"] for item in data["by_severity"]},
            "by_status": {item["_id"]: item["count"] for item in data["by_status"]},
            "avg_resolution_hours": round(
                data["resolution_times"][0]["avg_hours"], 1
            ) if data["resolution_times"] else 0,
            "open_count": data["open_count"][0]["count"] if data["open_count"] else 0,
        }

    async def add_comment(self, comment_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        comment_data["created_at"] = now
        result = await self.comments.insert_one(comment_data)
        comment_data["_id"] = result.inserted_id
        return comment_data

    async def get_comments(self, incident_id: str) -> list[dict]:
        cursor = self.comments.find({"incident_id": incident_id}).sort("created_at", 1)
        return await cursor.to_list(length=200)
