from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.core.database import get_database
from app.api.v1.endpoints.auth import get_current_user
from app.repositories.widget_repo import WidgetRepository
from app.schemas.widget import WidgetLayoutUpdate, WidgetLayoutResponse

router = APIRouter(prefix="/widgets", tags=["Widget Layouts"])


async def get_widget_repo() -> WidgetRepository:
    db = await get_database()
    return WidgetRepository(db)


@router.get("/layout", response_model=WidgetLayoutResponse)
async def get_widget_layout(
    organization_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    repo: WidgetRepository = Depends(get_widget_repo),
):
    user_id = current_user["id"]
    layout = await repo.get_or_create_layout(user_id, organization_id)
    return WidgetLayoutResponse(**layout)


@router.put("/layout", response_model=WidgetLayoutResponse)
async def update_widget_layout(
    update: WidgetLayoutUpdate,
    organization_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    repo: WidgetRepository = Depends(get_widget_repo),
):
    user_id = current_user["id"]
    layout = await repo.update_layout(user_id, update.model_dump(exclude_unset=True), organization_id)
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    return WidgetLayoutResponse(**layout)


@router.post("/layout/reset", response_model=WidgetLayoutResponse)
async def reset_widget_layout(
    organization_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    repo: WidgetRepository = Depends(get_widget_repo),
):
    user_id = current_user["id"]
    layout = await repo.reset_layout(user_id, organization_id)
    return WidgetLayoutResponse(**layout)
