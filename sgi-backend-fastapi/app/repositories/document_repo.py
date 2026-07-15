from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class DocumentRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["documents"]

    async def create(self, doc_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        doc_data["created_at"] = now
        doc_data["updated_at"] = now
        doc_data["current_version"] = 1
        doc_data["status"] = "borrador"
        doc_data["versions"] = [
            {
                "version": 1,
                "content": doc_data.pop("content", ""),
                "change_notes": "Versión inicial",
                "created_by": doc_data.pop("owner_id", None),
                "created_at": now,
            }
        ]
        doc_data["approvals"] = []
        result = await self.collection.insert_one(doc_data)
        doc_data["_id"] = result.inserted_id
        return doc_data

    async def get_by_id(self, doc_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(doc_id)})

    async def get_by_code(self, org_id: str, code: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_id": org_id, "code": code})

    async def update(self, doc_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(doc_id)}, {"$set": update_data}
        )
        return await self.get_by_id(doc_id)

    async def add_version(self, doc_id: str, version_data: dict) -> Optional[dict]:
        doc = await self.get_by_id(doc_id)
        if doc is None:
            return None

        new_version_num = doc["current_version"] + 1
        now = datetime.now(timezone.utc)

        version_entry = {
            "version": new_version_num,
            "content": version_data["content"],
            "change_notes": version_data.get("change_notes", ""),
            "created_by": version_data.get("created_by"),
            "created_at": now,
        }

        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$push": {"versions": version_entry},
                "$set": {
                    "current_version": new_version_num,
                    "updated_at": now,
                },
            },
        )
        return await self.get_by_id(doc_id)

    async def add_approval(self, doc_id: str, approval_data: dict) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        approval_entry = {
            "reviewer_id": approval_data["reviewer_id"],
            "status": approval_data.get("status", "aprobado"),
            "comments": approval_data.get("comments", ""),
            "reviewed_at": now,
        }

        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$push": {"approvals": approval_entry},
                "$set": {"updated_at": now},
            },
        )
        return await self.get_by_id(doc_id)

    async def publish(self, doc_id: str) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$set": {
                    "status": "publicado",
                    "published_at": now,
                    "updated_at": now,
                }
            },
        )
        return await self.get_by_id(doc_id)

    async def archive(self, doc_id: str) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$set": {
                    "status": "archivado",
                    "updated_at": now,
                }
            },
        )
        return await self.get_by_id(doc_id)

    async def delete(self, doc_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str = None,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        document_type: str = "",
        status: str = "",
        process_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id} if org_id else {}

        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        if document_type:
            query["document_type"] = document_type

        if status:
            query["status"] = status

        if process_id:
            query["process_id"] = process_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("updated_at", -1)
        docs = await cursor.to_list(length=page_size)
        return docs, total

    async def get_version_content(self, doc_id: str, version: int) -> Optional[dict]:
        doc = await self.get_by_id(doc_id)
        if doc is None:
            return None
        for v in doc.get("versions", []):
            if v["version"] == version:
                return v
        return None
