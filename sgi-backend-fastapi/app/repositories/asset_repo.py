from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class AssetRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["assets"]

    async def create(self, asset_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        asset_data["created_at"] = now
        asset_data["updated_at"] = now
        result = await self.collection.insert_one(asset_data)
        asset_data["_id"] = result.inserted_id
        return asset_data

    async def get_by_id(self, asset_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(asset_id)})

    async def get_by_code(self, org_id: str, code: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_id": org_id, "code": code})

    async def update(self, asset_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(asset_id)}, {"$set": update_data}
        )
        return await self.get_by_id(asset_id)

    async def delete(self, asset_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(asset_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        asset_type: str = "",
        criticality: str = "",
        status: str = "",
        process_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}},
                {"serial_number": {"$regex": search, "$options": "i"}},
            ]

        if asset_type:
            query["asset_type"] = asset_type

        if criticality:
            query["criticality"] = criticality

        if status:
            query["status"] = status

        if process_id:
            query["process_id"] = process_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("criticality", -1).sort("name", 1)
        assets = await cursor.to_list(length=page_size)
        return assets, total

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_type": [
                        {"$group": {"_id": "$asset_type", "count": {"$sum": 1}}},
                    ],
                    "by_criticality": [
                        {"$group": {"_id": "$criticality", "count": {"$sum": 1}}},
                    ],
                    "by_status": [
                        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
                    ],
                    "avg_cia": [
                        {
                            "$group": {
                                "_id": None,
                                "avg_confidentiality": {"$avg": "$cia.confidentiality"},
                                "avg_integrity": {"$avg": "$cia.integrity"},
                                "avg_availability": {"$avg": "$cia.availability"},
                            }
                        }
                    ],
                }
            },
        ]

        result = await self.collection.aggregate(pipeline).to_list(1)
        if not result:
            return {
                "total": 0,
                "by_type": {},
                "by_criticality": {},
                "by_status": {},
                "avg_cia": {"confidentiality": 0, "integrity": 0, "availability": 0},
            }

        data = result[0]
        return {
            "total": data["total"][0]["count"] if data["total"] else 0,
            "by_type": {item["_id"]: item["count"] for item in data["by_type"]},
            "by_criticality": {item["_id"]: item["count"] for item in data["by_criticality"]},
            "by_status": {item["_id"]: item["count"] for item in data["by_status"]},
            "avg_cia": {
                "confidentiality": round(data["avg_cia"][0]["avg_confidentiality"], 2) if data["avg_cia"] else 0,
                "integrity": round(data["avg_cia"][0]["avg_integrity"], 2) if data["avg_cia"] else 0,
                "availability": round(data["avg_cia"][0]["avg_availability"], 2) if data["avg_cia"] else 0,
            },
        }

    async def get_by_process(self, process_id: str) -> list[dict]:
        cursor = self.collection.find({"process_id": process_id}).sort("name", 1)
        return await cursor.to_list(length=100)
