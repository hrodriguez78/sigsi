from fastapi import APIRouter, Depends, Query
from typing import List

from app.core.database import get_database
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(tags=["Búsqueda Global"])


@router.get("/search", response_model=List[dict])
async def global_search(
    q: str = Query(..., min_length=2, max_length=100),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_id = current_user.get("organization_id")
    query = {"$text": {"$search": q}}
    org_query = {"organization_id": org_id} if org_id else {}
    text_query = {**org_query, "name": {"$regex": q, "$options": "i"}}

    results = []

    for collection, route_prefix, title_field, desc_field in [
        ("processes", "processes", "name", "description"),
        ("assets", "assets", "name", "description"),
        ("documents", "documents", "title", "description"),
        ("risks", "risks", "name", "description"),
        ("controls", "controls", "name", "description"),
        ("incidents", "incidents", "title", "description"),
        ("audits", "audits", "title", "scope"),
        ("courses", "training", "title", "description"),
    ]:
        cursor = db[collection].find(text_query).limit(5)
        async for doc in cursor:
            results.append({
                "module": collection,
                "id": str(doc["_id"]),
                "title": doc.get(title_field, doc.get("name", "")),
                "description": doc.get(desc_field, "")[:100] if doc.get(desc_field) else "",
                "route": f"/{route_prefix}/{doc['_id']}",
            })

    return results[:30]
