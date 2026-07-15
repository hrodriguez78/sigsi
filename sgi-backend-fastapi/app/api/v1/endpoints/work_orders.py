from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.database import get_database
from app.schemas.work_order import (
    WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse, WorkOrderListResponse,
    WorkOrderCommentCreate, WorkOrderCommentResponse, WorkOrderStatsResponse,
)
from app.repositories.work_order_repo import WorkOrderRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/work-orders", tags=["Órdenes de Trabajo"])


def _wo_response(wo: dict) -> WorkOrderResponse:
    return WorkOrderResponse(
        id=str(wo["_id"]),
        organization_id=wo["organization_id"],
        client_organization_id=wo["client_organization_id"],
        process_id=wo.get("process_id"),
        order_number=wo.get("order_number", ""),
        title=wo["title"],
        description=wo.get("description", ""),
        order_type=wo["order_type"],
        priority=wo["priority"],
        status=wo["status"],
        assigned_to=wo.get("assigned_to"),
        assigned_to_name=wo.get("assigned_to_name", ""),
        scheduled_date=wo.get("scheduled_date"),
        due_date=wo.get("due_date"),
        completed_at=wo.get("completed_at"),
        location=wo.get("location", ""),
        assets_involved=wo.get("assets_involved", []),
        notes=wo.get("notes", ""),
        resolution_notes=wo.get("resolution_notes", ""),
        comments_count=wo.get("comments_count", 0),
        created_at=wo["created_at"],
        updated_at=wo["updated_at"],
    )


def _comment_response(c: dict) -> WorkOrderCommentResponse:
    return WorkOrderCommentResponse(
        id=str(c["_id"]),
        work_order_id=c["work_order_id"],
        text=c["text"],
        author=c.get("author", ""),
        created_at=c["created_at"],
    )


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(
    data: WorkOrderCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    wo = await repo.create(data.model_dump())
    return _wo_response(wo)


@router.get("", response_model=WorkOrderListResponse)
async def list_work_orders(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    status_filter: str = Query("", alias="status"),
    order_type: str = Query(""),
    priority: str = Query(""),
    client_org_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    items, total = await repo.list_by_organization(
        org_id=organization_id, page=page, page_size=page_size,
        search=search, status=status_filter, order_type=order_type,
        priority=priority, client_org_id=client_org_id,
    )
    return WorkOrderListResponse(
        work_orders=[_wo_response(i) for i in items],
        total=total, page=page, page_size=page_size,
    )


@router.get("/stats", response_model=WorkOrderStatsResponse)
async def get_work_order_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    stats = await repo.get_stats(organization_id)
    return WorkOrderStatsResponse(**stats)


@router.get("/{wo_id}", response_model=WorkOrderResponse)
async def get_work_order(
    wo_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    wo = await repo.get_by_id(wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    return _wo_response(wo)


@router.put("/{wo_id}", response_model=WorkOrderResponse)
async def update_work_order(
    wo_id: str,
    data: WorkOrderUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    wo = await repo.get_by_id(wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    updated = await repo.update(wo_id, update_data)
    return _wo_response(updated)


@router.delete("/{wo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(
    wo_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    wo = await repo.get_by_id(wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    await repo.delete(wo_id)


@router.post("/{wo_id}/comments", response_model=WorkOrderCommentResponse, status_code=201)
async def add_comment(
    wo_id: str,
    data: WorkOrderCommentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    wo = await repo.get_by_id(wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    comment_data = data.model_dump()
    comment_data["work_order_id"] = wo_id
    if not comment_data.get("author"):
        comment_data["author"] = current_user.get("full_name", current_user["id"])
    comment = await repo.add_comment(comment_data)
    return _comment_response(comment)


@router.get("/{wo_id}/comments", response_model=list[WorkOrderCommentResponse])
async def list_comments(
    wo_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = WorkOrderRepository(db)
    comments = await repo.get_comments(wo_id)
    return [_comment_response(c) for c in comments]
