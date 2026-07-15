from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.schemas.widget import DEFAULT_WIDGETS


class WidgetRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.widget_layouts

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if doc is None:
            return None
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def get_layout(self, user_id: str, organization_id: Optional[str] = None) -> Optional[dict]:
        query = {"user_id": user_id}
        if organization_id:
            query["organization_id"] = organization_id
        doc = await self.collection.find_one(query)
        if doc:
            return self._serialize(doc)
        return None

    async def get_or_create_layout(self, user_id: str, organization_id: Optional[str] = None) -> dict:
        existing = await self.get_layout(user_id, organization_id)
        if existing:
            return existing

        now = datetime.now(timezone.utc).isoformat()
        layout_doc = {
            "user_id": user_id,
            "organization_id": organization_id,
            "widgets": DEFAULT_WIDGETS.copy(),
            "columns": 4,
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(layout_doc)
        layout_doc["_id"] = result.inserted_id
        return self._serialize(layout_doc)

    async def update_layout(self, user_id: str, update_data: dict, organization_id: Optional[str] = None) -> Optional[dict]:
        query = {"user_id": user_id}
        if organization_id:
            query["organization_id"] = organization_id

        update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if update_data.get("widgets") is not None:
            update_fields["widgets"] = update_data["widgets"]
        if update_data.get("columns") is not None:
            update_fields["columns"] = update_data["columns"]

        result = await self.collection.update_one(query, {"$set": update_fields})
        if result.matched_count == 0:
            return None
        return await self.get_layout(user_id, organization_id)

    async def reset_layout(self, user_id: str, organization_id: Optional[str] = None) -> dict:
        query = {"user_id": user_id}
        if organization_id:
            query["organization_id"] = organization_id

        now = datetime.now(timezone.utc).isoformat()
        layout_doc = {
            "user_id": user_id,
            "organization_id": organization_id,
            "widgets": DEFAULT_WIDGETS.copy(),
            "columns": 4,
            "updated_at": now,
        }
        await self.collection.update_one(query, {"$set": layout_doc}, upsert=True)
        return await self.get_layout(user_id, organization_id)
