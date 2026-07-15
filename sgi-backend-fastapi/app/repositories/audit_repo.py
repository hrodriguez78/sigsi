from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class AuditRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.audits = db["audits"]
        self.findings = db["audit_findings"]
        self.corrective_actions = db["corrective_actions"]
        self.checklist = db["audit_checklist"]

    async def create_audit(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = "planificada"
        result = await self.audits.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_audit(self, audit_id: str) -> Optional[dict]:
        return await self.audits.find_one({"_id": ObjectId(audit_id)})

    async def update_audit(self, audit_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.audits.update_one({"_id": ObjectId(audit_id)}, {"$set": update_data})
        return await self.get_audit(audit_id)

    async def delete_audit(self, audit_id: str) -> bool:
        result = await self.audits.delete_one({"_id": ObjectId(audit_id)})
        findings = await self.findings.find({"audit_id": audit_id}).to_list(1000)
        finding_ids = [str(f["_id"]) for f in findings]
        await self.findings.delete_many({"audit_id": audit_id})
        if finding_ids:
            await self.corrective_actions.delete_many({"finding_id": {"$in": finding_ids}})
        await self.checklist.delete_many({"audit_id": audit_id})
        return result.deleted_count == 1

    async def list_audits(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        audit_type: str = "",
        status: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"scope": {"$regex": search, "$options": "i"}},
            ]
        if audit_type:
            query["audit_type"] = audit_type
        if status:
            query["status"] = status

        total = await self.audits.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.audits.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        audits = await cursor.to_list(length=page_size)
        return audits, total

    async def get_audit_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_type": [{"$group": {"_id": "$audit_type", "count": {"$sum": 1}}}],
                    "by_status": [{"$group": {"_id": "$status", "count": {"$sum": 1}}}],
                }
            },
        ]

        result = await self.audits.aggregate(pipeline).to_list(1)

        all_findings = await self.findings.find(
            {"organization_id": org_id}
        ).to_list(1000)
        findings_summary = {}
        for f in all_findings:
            ft = f.get("finding_type", "otro")
            findings_summary[ft] = findings_summary.get(ft, 0) + 1

        data = result[0] if result else {}
        return {
            "total": data.get("total", [{}])[0].get("count", 0) if data.get("total") else 0,
            "by_type": {item["_id"]: item["count"] for item in data.get("by_type", [])},
            "by_status": {item["_id"]: item["count"] for item in data.get("by_status", [])},
            "findings_summary": findings_summary,
        }

    async def create_finding(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = "abierta"
        result = await self.findings.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_finding(self, finding_id: str) -> Optional[dict]:
        return await self.findings.find_one({"_id": ObjectId(finding_id)})

    async def update_finding(self, finding_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.findings.update_one(
            {"_id": ObjectId(finding_id)}, {"$set": update_data}
        )
        return await self.get_finding(finding_id)

    async def list_findings(self, audit_id: str) -> list[dict]:
        cursor = self.findings.find({"audit_id": audit_id}).sort("severity", -1)
        return await cursor.to_list(length=100)

    async def create_corrective_action(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = "abierta"
        result = await self.corrective_actions.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_corrective_action(self, ca_id: str) -> Optional[dict]:
        return await self.corrective_actions.find_one({"_id": ObjectId(ca_id)})

    async def update_corrective_action(self, ca_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.corrective_actions.update_one(
            {"_id": ObjectId(ca_id)}, {"$set": update_data}
        )
        return await self.get_corrective_action(ca_id)

    async def list_corrective_actions(self, finding_id: str) -> list[dict]:
        cursor = self.corrective_actions.find({"finding_id": finding_id}).sort("created_at", -1)
        return await cursor.to_list(length=50)

    async def add_checklist_item(self, data: dict) -> dict:
        result = await self.checklist.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def list_checklist(self, audit_id: str) -> list[dict]:
        cursor = self.checklist.find({"audit_id": audit_id})
        return await cursor.to_list(length=200)

    async def update_checklist_item(self, item_id: str, update_data: dict) -> Optional[dict]:
        await self.checklist.update_one(
            {"_id": ObjectId(item_id)}, {"$set": update_data}
        )
        return await self.checklist.find_one({"_id": ObjectId(item_id)})
