from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId


class OrgChartRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.org_positions

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if doc is None:
            return None
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def list_positions(self, organization_id: str) -> List[dict]:
        cursor = self.collection.find({"organization_id": organization_id}).sort("level", 1)
        docs = await cursor.to_list(length=200)
        return [self._serialize(d) for d in docs]

    async def get_position(self, position_id: str) -> Optional[dict]:
        doc = await self.collection.find_one({"_id": ObjectId(position_id)})
        return self._serialize(doc)

    async def create_position(self, organization_id: str, data: dict) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        parent_id = data.get("parent_id")
        level = 0
        if parent_id:
            parent = await self.get_position(parent_id)
            if parent:
                level = parent.get("level", 0) + 1

        sibling_count = await self.collection.count_documents({
            "organization_id": organization_id,
            "parent_id": parent_id,
        })

        doc = {
            "organization_id": organization_id,
            "name": data["name"],
            "description": data.get("description"),
            "parent_id": parent_id,
            "holder_name": data.get("holder_name"),
            "holder_email": data.get("holder_email"),
            "level": level,
            "order": sibling_count,
            "department": data.get("department"),
            "responsibilities": data.get("responsibilities", []),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return self._serialize(doc)

    async def update_position(self, position_id: str, data: dict) -> Optional[dict]:
        update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
        for key in ["name", "description", "holder_name", "holder_email", "department", "responsibilities", "order"]:
            if key in data and data[key] is not None:
                update_fields[key] = data[key]

        if "parent_id" in data:
            new_parent = data["parent_id"]
            update_fields["parent_id"] = new_parent
            current = await self.get_position(position_id)
            if current:
                new_level = 0
                if new_parent:
                    parent = await self.get_position(new_parent)
                    if parent:
                        new_level = parent.get("level", 0) + 1
                update_fields["level"] = new_level
                await self._update_children_levels(position_id, new_level)

        await self.collection.update_one({"_id": ObjectId(position_id)}, {"$set": update_fields})
        return await self.get_position(position_id)

    async def _update_children_levels(self, parent_id: str, parent_level: int):
        cursor = self.collection.find({"parent_id": parent_id})
        async for child in cursor:
            child_level = parent_level + 1
            await self.collection.update_one(
                {"_id": child["_id"]},
                {"$set": {"level": child_level}}
            )
            await self._update_children_levels(str(child["_id"]), child_level)

    async def delete_position(self, position_id: str) -> bool:
        position = await self.get_position(position_id)
        if not position:
            return False

        children = await self.collection.find({"parent_id": position_id}).to_list(length=100)
        for child in children:
            await self.collection.update_one(
                {"_id": child["_id"]},
                {"$set": {"parent_id": position.get("parent_id"), "level": position.get("level", 0)}}
            )

        result = await self.collection.delete_one({"_id": ObjectId(position_id)})
        return result.deleted_count > 0

    async def build_tree(self, organization_id: str) -> Optional[dict]:
        positions = await self.list_positions(organization_id)
        if not positions:
            return None

        pos_map = {p["id"]: {**p, "children": []} for p in positions}
        root = None

        for pid, node in pos_map.items():
            parent_id = node.get("parent_id")
            if parent_id and parent_id in pos_map:
                pos_map[parent_id]["children"].append(node)
            elif not parent_id:
                root = node

        for node in pos_map.values():
            node["children"].sort(key=lambda x: x.get("order", 0))

        return root
