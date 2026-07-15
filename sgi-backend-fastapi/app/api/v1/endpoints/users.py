from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_database
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.auth import hash_password
from app.repositories.user_repo import UserRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Usuarios"])


def _user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        organization_id=user.get("organization_id"),
        roles=user.get("roles", []),
        is_active=user.get("is_active", True),
        created_at=user["created_at"],
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)

    existing = await user_repo.get_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este email",
        )

    user_doc = {
        "email": data.email,
        "full_name": data.full_name,
        "hashed_password": hash_password(data.password),
        "organization_id": data.organization_id,
        "roles": [],
        "is_active": True,
    }
    user = await user_repo.create(user_doc)
    return _user_response(user)


@router.get("", response_model=list[UserResponse])
async def list_users(
    page: int = 1,
    page_size: int = 50,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    users, _ = await user_repo.list_users(page, page_size)
    return [_user_response(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return _user_response(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    updated = await user_repo.update(user_id, update_data)
    return _user_response(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await user_repo.delete(user_id)
