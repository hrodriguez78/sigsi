from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


RISK_LEVELS = {
    (1, 2): "bajo",
    (3, 4): "medio",
    (5, 8): "medio",
    (9, 12): "alto",
    (13, 25): "critico",
}

PROBABILITY_LABELS = ["Raro", "Improbable", "Posible", "Probable", "Casi seguro"]
IMPACT_LABELS = ["Insignificante", "Menor", "Moderado", "Mayor", "Catastrófico"]


def calculate_risk_level(probability: int, impact: int) -> str:
    score = probability * impact
    if score <= 2:
        return "bajo"
    elif score <= 8:
        return "medio"
    elif score <= 12:
        return "alto"
    else:
        return "critico"


def calculate_risk_score(probability: int, impact: int) -> int:
    return probability * impact


class RiskRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["risks"]
        self.treatments = db["risk_treatments"]

    async def create(self, risk_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        risk_data["created_at"] = now
        risk_data["updated_at"] = now
        risk_data["status"] = risk_data.get("status", "identificado")
        prob = risk_data.get("probability", 1)
        impact = risk_data.get("impact", 1)
        risk_data["risk_level"] = calculate_risk_level(prob, impact)
        risk_data["risk_score"] = calculate_risk_score(prob, impact)
        result = await self.collection.insert_one(risk_data)
        risk_data["_id"] = result.inserted_id
        return risk_data

    async def get_by_id(self, risk_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": ObjectId(risk_id)})

    async def get_by_code(self, org_id: str, code: str) -> Optional[dict]:
        return await self.collection.find_one({"organization_id": org_id, "code": code})

    async def update(self, risk_id: str, update_data: dict) -> Optional[dict]:
        risk = await self.get_by_id(risk_id)
        if risk is None:
            return None

        prob = update_data.get("probability", risk.get("probability", 1))
        imp = update_data.get("impact", risk.get("impact", 1))
        update_data["risk_level"] = calculate_risk_level(prob, imp)
        update_data["risk_score"] = calculate_risk_score(prob, imp)
        update_data["updated_at"] = datetime.now(timezone.utc)

        await self.collection.update_one(
            {"_id": ObjectId(risk_id)}, {"$set": update_data}
        )
        return await self.get_by_id(risk_id)

    async def delete(self, risk_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(risk_id)})
        await self.treatments.delete_many({"risk_id": risk_id})
        return result.deleted_count == 1

    async def list_by_organization(
        self,
        org_id: str,
        page: int = 1,
        page_size: int = 20,
        search: str = "",
        category: str = "",
        risk_level: str = "",
        status: str = "",
        asset_id: str = "",
        process_id: str = "",
    ) -> tuple[list[dict], int]:
        query = {"organization_id": org_id}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
            ]
        if category:
            query["category"] = category
        if risk_level:
            query["risk_level"] = risk_level
        if status:
            query["status"] = status
        if asset_id:
            query["asset_id"] = asset_id
        if process_id:
            query["process_id"] = process_id

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = self.collection.find(query).skip(skip).limit(page_size).sort("risk_score", -1)
        risks = await cursor.to_list(length=page_size)
        return risks, total

    async def get_matrix(self, org_id: str) -> dict:
        risks = await self.collection.find(
            {"organization_id": org_id},
            {"name": 1, "probability": 1, "impact": 1, "code": 1}
        ).to_list(length=500)

        matrix = [[0] * 5 for _ in range(5)]
        risks_by_cell = {}

        for r in risks:
            p = r.get("probability", 1) - 1
            i = r.get("impact", 1) - 1
            matrix[p][i] += 1
            key = f"{p+1},{i+1}"
            risks_by_cell.setdefault(key, []).append(r.get("code", str(r["_id"])))

        return {
            "matrix": matrix,
            "labels_probability": PROBABILITY_LABELS,
            "labels_impact": IMPACT_LABELS,
            "risks_by_cell": risks_by_cell,
        }

    async def get_stats(self, org_id: str) -> dict:
        pipeline = [
            {"$match": {"organization_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_level": [{"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}],
                    "by_category": [{"$group": {"_id": "$category", "count": {"$sum": 1}}}],
                    "by_status": [{"$group": {"_id": "$status", "count": {"$sum": 1}}}],
                    "avg_score": [{"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}],
                    "top_risks": [
                        {"$sort": {"risk_score": -1}},
                        {"$limit": 5},
                        {"$project": {"code": 1, "name": 1, "risk_score": 1, "risk_level": 1}},
                    ],
                }
            },
        ]

        result = await self.collection.aggregate(pipeline).to_list(1)
        if not result:
            return {
                "total": 0,
                "by_level": {},
                "by_category": {},
                "by_status": {},
                "avg_score": 0,
                "top_risks": [],
            }

        data = result[0]
        return {
            "total": data["total"][0]["count"] if data["total"] else 0,
            "by_level": {item["_id"]: item["count"] for item in data["by_level"]},
            "by_category": {item["_id"]: item["count"] for item in data["by_category"]},
            "by_status": {item["_id"]: item["count"] for item in data["by_status"]},
            "avg_score": round(data["avg_score"][0]["avg"], 2) if data["avg_score"] else 0,
            "top_risks": [
                {"code": r["code"], "name": r["name"], "score": r["risk_score"], "level": r["risk_level"]}
                for r in data["top_risks"]
            ],
        }

    async def create_treatment(self, treatment_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        treatment_data["created_at"] = now
        treatment_data["updated_at"] = now
        treatment_data["status"] = "pendiente"
        result = await self.treatments.insert_one(treatment_data)
        treatment_data["_id"] = result.inserted_id
        return treatment_data

    async def get_treatments(self, risk_id: str) -> list[dict]:
        cursor = self.treatments.find({"risk_id": risk_id}).sort("created_at", -1)
        return await cursor.to_list(length=50)

    async def update_treatment(self, treatment_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.treatments.update_one(
            {"_id": ObjectId(treatment_id)}, {"$set": update_data}
        )
        return await self.treatments.find_one({"_id": ObjectId(treatment_id)})
