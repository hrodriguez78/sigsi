from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentVersionCreate,
    DocumentApprovalCreate,
    DocumentResponse,
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentVersionResponse,
)
from app.repositories.document_repo import DocumentRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documentos"])


def _doc_response(doc: dict) -> DocumentResponse:
    return DocumentResponse(
        id=str(doc["_id"]),
        organization_id=doc["organization_id"],
        title=doc["title"],
        code=doc["code"],
        description=doc.get("description", ""),
        document_type=doc.get("document_type", "otro"),
        process_id=doc.get("process_id"),
        current_version=doc.get("current_version", 1),
        status=doc.get("status", "borrador"),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        published_at=doc.get("published_at"),
    )


def _doc_detail_response(doc: dict) -> DocumentDetailResponse:
    versions = [
        DocumentVersionResponse(
            version=v["version"],
            content=v["content"],
            change_notes=v.get("change_notes", ""),
            created_by=v.get("created_by"),
            created_at=v["created_at"],
        )
        for v in doc.get("versions", [])
    ]

    return DocumentDetailResponse(
        id=str(doc["_id"]),
        organization_id=doc["organization_id"],
        title=doc["title"],
        code=doc["code"],
        description=doc.get("description", ""),
        document_type=doc.get("document_type", "otro"),
        process_id=doc.get("process_id"),
        current_version=doc.get("current_version", 1),
        status=doc.get("status", "borrador"),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        published_at=doc.get("published_at"),
        content=doc.get("versions", [{}])[-1].get("content", "") if doc.get("versions") else "",
        versions=versions,
        approvals=doc.get("approvals", []),
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: DocumentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)

    existing = await repo.get_by_code(data.organization_id, data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un documento con código '{data.code}'",
        )

    doc_data = data.model_dump()
    doc_data["owner_id"] = current_user.get("email", "")
    doc = await repo.create(doc_data)
    return _doc_response(doc)


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    document_type: str = Query(""),
    status_filter: str = Query("", alias="status"),
    process_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    docs, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        document_type=document_type,
        status=status_filter,
        process_id=process_id,
    )
    return DocumentListResponse(
        documents=[_doc_response(d) for d in docs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
async def get_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return _doc_detail_response(doc)


@router.get("/{doc_id}/versions/{version}")
async def get_document_version(
    doc_id: str,
    version: int,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    v = await repo.get_version_content(doc_id, version)
    if v is None:
        raise HTTPException(status_code=404, detail="Versión no encontrada")
    return v


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: str,
    data: DocumentUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No se enviaron campos para actualizar"
        )

    if "code" in update_data:
        existing = await repo.get_by_code(doc["organization_id"], update_data["code"])
        if existing and str(existing["_id"]) != doc_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un documento con código '{update_data['code']}'",
            )

    updated = await repo.update(doc_id, update_data)
    return _doc_response(updated)


@router.post("/{doc_id}/versions", response_model=DocumentResponse)
async def add_version(
    doc_id: str,
    data: DocumentVersionCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    if doc["status"] == "archivado":
        raise HTTPException(
            status_code=400,
            detail="No se pueden agregar versiones a un documento archivado",
        )

    version_data = data.model_dump()
    version_data["created_by"] = current_user.get("email", "")
    updated = await repo.add_version(doc_id, version_data)
    return _doc_response(updated)


@router.post("/{doc_id}/approve")
async def approve_document(
    doc_id: str,
    data: DocumentApprovalCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    approval_data = data.model_dump()
    approval_data["status"] = "aprobado"
    updated = await repo.add_approval(doc_id, approval_data)
    return _doc_response(updated)


@router.post("/{doc_id}/reject")
async def reject_document(
    doc_id: str,
    data: DocumentApprovalCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    approval_data = data.model_dump()
    approval_data["status"] = "rechazado"
    updated = await repo.add_approval(doc_id, approval_data)
    return _doc_response(updated)


@router.post("/{doc_id}/publish", response_model=DocumentResponse)
async def publish_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    if doc["status"] not in ("aprobado", "borrador"):
        raise HTTPException(
            status_code=400,
            detail=f"No se puede publicar un documento en estado '{doc['status']}'",
        )

    updated = await repo.publish(doc_id)
    return _doc_response(updated)


@router.post("/{doc_id}/archive", response_model=DocumentResponse)
async def archive_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    updated = await repo.archive(doc_id)
    return _doc_response(updated)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    await repo.delete(doc_id)
