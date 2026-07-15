from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class ControlRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["controls"]
        self.evidence = db["control_evidence"]

    async def create(self, control_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        control_data["created_at"] = now
        control_data["updated_at"] = now
        result = await self.collection.insert_one(control_data)
        control_data["_id"] = result.inserted_id
        return control_data

    async def get_by_id(self, control_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(control_id)})

    async def get_by_control_id(self, org_id: str, control_id: str) -> Optional[dict]:
        return await self.collection.find_one(
            {"organization_id": org_id, "control_id": control_id}
        )

    async def update(self, control_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(control_id)}, {"$set": update_data}
        )
        return await self.get_by_id(control_id)

    async def delete(self, control_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(control_id)})
        await self.evidence.delete_many({"control_id": control_id})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        category: str = "",
        implementation_status: str = "",
        compliance_level: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"control_id": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        if category:
            query["category"] = category
        if implementation_status:
            query["implementation_status"] = implementation_status
        if compliance_level:
            query["compliance_level"] = compliance_level

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("control_id", 1)
        controls = await cursor.to_list(length=page_size)
        return controls, total

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_category": [{"$group": {"_id": "$category", "count": {"$sum": 1}}}],
                    "by_status": [
                        {"$group": {"_id": "$implementation_status", "count": {"$sum": 1}}}
                    ],
                    "by_compliance": [
                        {"$group": {"_id": "$compliance_level", "count": {"$sum": 1}}}
                    ],
                }
            },
        ]

        result = await self.collection.aggregate(pipeline).to_list(1)
        if not result:
            return {
                "total": 0,
                "by_category": {},
                "by_status": {},
                "by_compliance": {},
                "compliance_percentage": 0,
                "implementation_percentage": 0,
            }

        data = result[0]
        total = data["total"][0]["count"] if data["total"] else 0
        by_status = {item["_id"]: item["count"] for item in data["by_status"]}
        by_compliance = {item["_id"]: item["count"] for item in data["by_compliance"]}

        impl_count = by_status.get("implementado", 0) + by_status.get("efectivo", 0)
        comp_count = by_compliance.get("total", 0)

        return {
            "total": total,
            "by_category": {item["_id"]: item["count"] for item in data["by_category"]},
            "by_status": by_status,
            "by_compliance": by_compliance,
            "compliance_percentage": round((comp_count / total * 100) if total else 0, 1),
            "implementation_percentage": round((impl_count / total * 100) if total else 0, 1),
        }

    async def get_soa(self, org_id: str) -> dict:
        all_controls = await self.collection.find(
            {"organization_id": org_id}
        ).sort("control_id", 1).to_list(length=200)

        total = len(all_controls)
        not_applicable = sum(
            1 for c in all_controls if c.get("implementation_status") == "no_aplicable"
        )
        applicable = total - not_applicable
        implemented = sum(
            1 for c in all_controls
            if c.get("implementation_status") in ("implementado", "efectivo")
        )
        effective = sum(
            1 for c in all_controls if c.get("implementation_status") == "efectivo"
        )
        partial = sum(
            1 for c in all_controls if c.get("compliance_level") == "parcial"
        )
        not_impl = applicable - implemented

        return {
            "organization_id": org_id,
            "total_controls": total,
            "applicable_controls": applicable,
            "implemented": implemented,
            "effective": effective,
            "partial": partial,
            "not_implemented": not_impl,
            "compliance_pct": round((implemented / applicable * 100) if applicable else 0, 1),
            "controls": all_controls,
        }

    async def add_evidence(self, evidence_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        evidence_data["created_at"] = now
        result = await self.evidence.insert_one(evidence_data)
        evidence_data["_id"] = result.inserted_id
        return evidence_data

    async def get_evidence(self, control_id: str) -> list[dict]:
        cursor = self.evidence.find({"control_id": control_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)
