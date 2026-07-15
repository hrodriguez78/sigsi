from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.database import get_database
from app.schemas.candidate import (
    CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse,
    CandidateDocumentCreate, CandidateDocumentResponse,
    CandidateTestCreate, CandidateTestResponse, CandidateTestUpdate,
    CandidateActivityCreate, CandidateActivityResponse, PipelineStats,
)
from app.repositories.candidate_repo import CandidateRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/candidates", tags=["Candidatos"])


def _candidate_response(c: dict) -> CandidateResponse:
    return CandidateResponse(
        id=str(c["_id"]),
        organization_id=c["organization_id"],
        process_id=c["process_id"],
        full_name=c["full_name"],
        email=c["email"],
        phone=c.get("phone", ""),
        position_applied=c["position_applied"],
        cover_letter=c.get("cover_letter", ""),
        source=c.get("source", ""),
        status=c.get("status", "nuevo"),
        notes=c.get("notes", ""),
        score=c.get("score", 0.0),
        documents_count=c.get("documents_count", 0),
        tests_completed=c.get("tests_completed", 0),
        created_at=c["created_at"],
        updated_at=c["updated_at"],
    )


def _doc_response(d: dict) -> CandidateDocumentResponse:
    return CandidateDocumentResponse(
        id=str(d["_id"]),
        candidate_id=d["candidate_id"],
        document_type=d["document_type"],
        file_name=d["file_name"],
        file_url=d.get("file_url", ""),
        file_size=d.get("file_size", 0),
        notes=d.get("notes", ""),
        verified=d.get("verified", False),
        verified_by=d.get("verified_by"),
        verified_at=d.get("verified_at"),
        created_at=d["created_at"],
    )


def _test_response(t: dict) -> CandidateTestResponse:
    return CandidateTestResponse(
        id=str(t["_id"]),
        candidate_id=t["candidate_id"],
        test_type=t["test_type"],
        test_name=t["test_name"],
        max_score=t.get("max_score", 100.0),
        score=t.get("score"),
        status=t.get("status", "pendiente"),
        instructions=t.get("instructions", ""),
        duration_minutes=t.get("duration_minutes", 60),
        questions=t.get("questions", []),
        answers=t.get("answers", []),
        started_at=t.get("started_at"),
        completed_at=t.get("completed_at"),
        created_at=t["created_at"],
        updated_at=t["updated_at"],
    )


def _activity_response(a: dict) -> CandidateActivityResponse:
    return CandidateActivityResponse(
        id=str(a["_id"]),
        candidate_id=a["candidate_id"],
        activity_type=a["activity_type"],
        description=a["description"],
        performed_by=a.get("performed_by", ""),
        created_at=a["created_at"],
    )


# ── CANDIDATES CRUD ──────────────────────────────────────────────

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    data: CandidateCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.create(data.model_dump())
    return _candidate_response(candidate)


@router.get("", response_model=CandidateListResponse)
async def list_candidates(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    status_filter: str = Query("", alias="status"),
    process_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidates, total = await repo.list_by_organization(
        org_id=organization_id, page=page, page_size=page_size,
        search=search, status=status_filter, process_id=process_id,
    )
    # Enrich with doc/test counts
    enriched = []
    for c in candidates:
        docs = await repo.get_documents(str(c["_id"]))
        tests = await repo.get_tests(str(c["_id"]))
        c["documents_count"] = len(docs)
        c["tests_completed"] = len([t for t in tests if t.get("status") == "completado"])
        enriched.append(c)
    return CandidateListResponse(
        candidates=[_candidate_response(c) for c in enriched],
        total=total, page=page, page_size=page_size,
    )


@router.get("/pipeline-stats", response_model=PipelineStats)
async def get_pipeline_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    stats = await repo.get_pipeline_stats(organization_id)
    return PipelineStats(**stats)


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    docs = await repo.get_documents(candidate_id)
    tests = await repo.get_tests(candidate_id)
    candidate["documents_count"] = len(docs)
    candidate["tests_completed"] = len([t for t in tests if t.get("status") == "completado"])
    return _candidate_response(candidate)


@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: str,
    data: CandidateUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    updated = await repo.update(candidate_id, update_data)
    return _candidate_response(updated)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    await repo.delete(candidate_id)


# ── DOCUMENTS ────────────────────────────────────────────────────

@router.post("/{candidate_id}/documents", response_model=CandidateDocumentResponse, status_code=201)
async def add_document(
    candidate_id: str,
    data: CandidateDocumentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    doc_data = data.model_dump()
    doc_data["candidate_id"] = candidate_id
    doc = await repo.add_document(doc_data)
    return _doc_response(doc)


@router.get("/{candidate_id}/documents", response_model=list[CandidateDocumentResponse])
async def list_documents(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    docs = await repo.get_documents(candidate_id)
    return [_doc_response(d) for d in docs]


@router.put("/documents/{doc_id}/verify", response_model=CandidateDocumentResponse)
async def verify_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    doc = await repo.verify_document(doc_id, current_user.get("full_name", current_user["id"]))
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return _doc_response(doc)


@router.delete("/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    deleted = await repo.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Documento no encontrado")


# ── TESTS ────────────────────────────────────────────────────────

@router.post("/{candidate_id}/tests", response_model=CandidateTestResponse, status_code=201)
async def add_test(
    candidate_id: str,
    data: CandidateTestCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    test_data = data.model_dump()
    test_data["candidate_id"] = candidate_id
    test = await repo.add_test(test_data)
    return _test_response(test)


@router.get("/{candidate_id}/tests", response_model=list[CandidateTestResponse])
async def list_tests(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    tests = await repo.get_tests(candidate_id)
    return [_test_response(t) for t in tests]


@router.put("/tests/{test_id}", response_model=CandidateTestResponse)
async def update_test(
    test_id: str,
    data: CandidateTestUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    test = await repo.tests_collection.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    updated = await repo.update_test(test_id, update_data)
    return _test_response(updated)


@router.delete("/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    deleted = await repo.delete_test(test_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")


# ── ACTIVITIES (TRACEABILITY) ───────────────────────────────────

@router.post("/{candidate_id}/activities", response_model=CandidateActivityResponse, status_code=201)
async def add_activity(
    candidate_id: str,
    data: CandidateActivityCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    act_data = data.model_dump()
    act_data["candidate_id"] = candidate_id
    if not act_data.get("performed_by"):
        act_data["performed_by"] = current_user.get("full_name", current_user["id"])
    act = await repo.add_activity(act_data)
    return _activity_response(act)


@router.get("/{candidate_id}/activities", response_model=list[CandidateActivityResponse])
async def list_activities(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = CandidateRepository(db)
    acts = await repo.get_activities(candidate_id)
    return [_activity_response(a) for a in acts]
