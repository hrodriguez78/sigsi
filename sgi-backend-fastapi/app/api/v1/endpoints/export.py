import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.core.database import get_database
from app.api.v1.endpoints.auth import get_current_user
from app.services.export import EXPORTERS
from app.services.pdf_export import PDF_EXPORTERS

router = APIRouter(prefix="/export", tags=["Exportación"])

COLLECTIONS = {
    "risks": "risks",
    "incidents": "incidents",
    "controls": "controls",
    "audits": "audits",
    "training": "courses",
    "documents": "documents",
    "assets": "assets",
    "raci": "raci_matrices",
}


@router.get("/{module}")
async def export_module(
    module: str,
    format: str = Query("xlsx", pattern="^(xlsx|pdf)$"),
    organization_id: str = Query(None),
    current_user: dict = Depends(get_current_user),
):
    if module not in COLLECTIONS:
        raise HTTPException(status_code=404, detail=f"Módulo '{module}' no soporta exportación")

    db = await get_database()
    collection = COLLECTIONS[module]
    query = {}
    if organization_id:
        query["organization_id"] = organization_id

    cursor = db[collection].find(query).sort("created_at", -1)
    data = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        for key, val in doc.items():
            if isinstance(val, datetime):
                doc[key] = val.strftime("%d/%m/%Y %H:%M")
            elif hasattr(val, "isoformat"):
                doc[key] = val.isoformat()
        data.append(doc)

    ext = format
    if format == "pdf":
        exporter = PDF_EXPORTERS.get(module)
        if not exporter:
            raise HTTPException(status_code=400, detail=f"Módulo '{module}' no soporta exportación PDF")
        buf = exporter(data)
        media_type = "application/pdf"
    else:
        exporter = EXPORTERS.get(module)
        buf = exporter(data)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    filename = f"{module}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"

    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
