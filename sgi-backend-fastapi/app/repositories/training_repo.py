from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class TrainingRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.courses = db["courses"]
        self.enrollments = db["enrollments"]

    async def create_course(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = data.get("status", "borrador")
        result = await self.courses.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_course(self, course_id: str) -> Optional[dict]:
        return await self.courses.find_one({"_id": ObjectId(course_id)})

    async def update_course(self, course_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.courses.update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
        return await self.get_course(course_id)

    async def delete_course(self, course_id: str) -> bool:
        result = await self.courses.delete_one({"_id": ObjectId(course_id)})
        await self.enrollments.delete_many({"course_id": course_id})
        return result.deleted_count == 1

    async def list_courses(
        self,
        organization_id: str,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = {"organization_id": organization_id}
        if category:
            query["category"] = category
        if status:
            query["status"] = status
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        total = await self.courses.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.courses.find(query).sort("created_at", -1).skip(skip).limit(page_size)
        courses = await cursor.to_list(page_size)

        for c in courses:
            enrolled = await self.enrollments.count_documents({"course_id": str(c["_id"])})
            completed = await self.enrollments.count_documents(
                {"course_id": str(c["_id"]), "status": "completado"}
            )
            c["enrolled_count"] = enrolled
            c["completed_count"] = completed

        return {"total": total, "page": page, "page_size": page_size, "courses": courses}

    async def get_course_stats(self, organization_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": organization_id}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        ]
        cat_cursor = self.courses.aggregate(pipeline)
        by_category = {}
        async for doc in cat_cursor:
            by_category[doc["_id"]] = doc["count"]

        status_pipeline = [
            {"$match": {"organization_id": organization_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
        status_cursor = self.courses.aggregate(status_pipeline)
        by_status = {}
        async for doc in status_cursor:
            by_status[doc["_id"]] = doc["count"]

        total_courses = await self.courses.count_documents({"organization_id": organization_id})

        org_courses = await self.courses.find({"organization_id": organization_id}).to_list(1000)
        course_ids = [str(c["_id"]) for c in org_courses]

        total_enrollments = 0
        completed_enrollments = 0
        scores = []

        if course_ids:
            total_enrollments = await self.enrollments.count_documents(
                {"course_id": {"$in": course_ids}}
            )
            completed_enrollments = await self.enrollments.count_documents(
                {"course_id": {"$in": course_ids}, "status": "completado"}
            )
            score_cursor = self.enrollments.find(
                {"course_id": {"$in": course_ids}, "score": {"$exists": True, "$ne": None}}
            ).projection({"score": 1})
            async for doc in score_cursor:
                scores.append(doc["score"])

        completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        avg_score = sum(scores) / len(scores) if scores else None

        return {
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "completed_enrollments": completed_enrollments,
            "by_category": by_category,
            "by_status": by_status,
            "completion_rate": round(completion_rate, 1),
            "average_score": round(avg_score, 1) if avg_score else None,
        }

    async def enroll_user(self, course_id: str, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["course_id"] = course_id
        data["status"] = "inscrito"
        data["enrolled_at"] = now
        data["started_at"] = None
        data["completed_at"] = None
        data["score"] = None
        data["passed"] = None
        data["certificate_number"] = None
        data["certificate_date"] = None
        result = await self.enrollments.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_enrollments(self, course_id: str) -> list:
        cursor = self.enrollments.find({"course_id": course_id}).sort("enrolled_at", -1)
        return await cursor.to_list(1000)

    async def update_enrollment(self, enrollment_id: str, update_data: dict) -> Optional[dict]:
        await self.enrollments.update_one(
            {"_id": ObjectId(enrollment_id)}, {"$set": update_data}
        )
        return await self.enrollments.find_one({"_id": ObjectId(enrollment_id)})
