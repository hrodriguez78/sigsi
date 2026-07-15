from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class CandidateRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["candidates"]
        self.docs_collection = db["candidate_documents"]
        self.tests_collection = db["candidate_tests"]
        self.activities_collection = db["candidate_activities"]

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = data.get("status", "nuevo")
        data["score"] = data.get("score", 0.0)
        data["notes"] = data.get("notes", "")
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_by_id(self, candidate_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(candidate_id)})

    async def update(self, candidate_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(candidate_id)}, {"$set": update_data}
        )
        return await self.get_by_id(candidate_id)

    async def delete(self, candidate_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(candidate_id)})
        if result.deleted_count == 1:
            await self.docs_collection.delete_many({"candidate_id": candidate_id})
            await self.tests_collection.delete_many({"candidate_id": candidate_id})
            await self.activities_collection.delete_many({"candidate_id": candidate_id})
            return True
        return False

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        status: str = "",
        process_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"position_applied": {"$regex": search, "$options": "i"}},
            ]
        if status:
            query["status"] = status
        if process_id:
            query["process_id"] = process_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        candidates = await cursor.to_list(length=page_size)
        return candidates, total

    async def get_pipeline_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$score"},
            }},
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=20)
        stats = {"total": 0, "new": 0, "in_review": 0, "approved": 0,
                 "rejected": 0, "hired": 0, "withdrawn": 0, "avg_score": 0.0}
        total_scores = []
        for r in results:
            status = r["_id"]
            count = r["count"]
            stats["total"] += count
            if status == "nuevo":
                stats["new"] = count
            elif status == "en_revision":
                stats["in_review"] = count
            elif status == "aprobado":
                stats["approved"] = count
            elif status == "rechazado":
                stats["rejected"] = count
            elif status == "contratado":
                stats["hired"] = count
            elif status == "retirado":
                stats["withdrawn"] = count
            if r.get("avg_score"):
                total_scores.append(r["avg_score"])
        if total_scores:
            stats["avg_score"] = round(sum(total_scores) / len(total_scores), 1)
        return stats

    # --- DOCUMENTS ---
    async def add_document(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["verified"] = False
        result = await self.docs_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_documents(self, candidate_id: str) -> list[dict]:
        cursor = self.docs_collection.find({"candidate_id": candidate_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def verify_document(self, doc_id: str, verified_by: str) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        await self.docs_collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": {"verified": True, "verified_by": verified_by, "verified_at": now}},
        )
        return await self.docs_collection.find_one({"_id": ObjectId(doc_id)})

    async def delete_document(self, doc_id: str) -> bool:
        result = await self.docs_collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count == 1

    # --- TESTS ---
    async def add_test(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = "pendiente"
        data["score"] = None
        data["answers"] = []
        data["started_at"] = None
        data["completed_at"] = None
        result = await self.tests_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_tests(self, candidate_id: str) -> list[dict]:
        cursor = self.tests_collection.find({"candidate_id": candidate_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def update_test(self, test_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        if update_data.get("status") == "completado" and not update_data.get("completed_at"):
            update_data["completed_at"] = datetime.now(timezone.utc)
        if update_data.get("status") == "en_curso" and not update_data.get("started_at"):
            update_data["started_at"] = datetime.now(timezone.utc)
        await self.tests_collection.update_one(
            {"_id": ObjectId(test_id)}, {"$set": update_data}
        )
        return await self.tests_collection.find_one({"_id": ObjectId(test_id)})

    async def delete_test(self, test_id: str) -> bool:
        result = await self.tests_collection.delete_one({"_id": ObjectId(test_id)})
        return result.deleted_count == 1

    # --- ACTIVITIES ---
    async def add_activity(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        result = await self.activities_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_activities(self, candidate_id: str) -> list[dict]:
        cursor = self.activities_collection.find({"candidate_id": candidate_id}).sort("created_at", -1)
        return await cursor.to_list(length=200)
