from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_database
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    UserRoleAssign,
    UserRoleResponse,
    PERMISSIONS,
)
from app.repositories.role_repo import RoleRepository
from app.repositories.user_repo import UserRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles y Permisos"])


def _role_response(role: dict) -> RoleResponse:
    return RoleResponse(
        id=str(role["_id"]),
        name=role["name"],
        description=role["description"],
        permissions=role.get("permissions", []),
        created_at=role["created_at"],
        updated_at=role["updated_at"],
    )


@router.get("/permissions")
async def list_permissions():
    return {"permissions": PERMISSIONS}


@router.get("", response_model=list[RoleResponse])
async def list_roles(
    page: int = 1,
    page_size: int = 50,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    role_repo = RoleRepository(db)
    roles, total = await role_repo.list_roles(page, page_size)
    return [_role_response(r) for r in roles]


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    data: RoleCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    role_repo = RoleRepository(db)

    existing = await role_repo.get_by_name(data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe el rol '{data.name}'",
        )

    invalid_perms = [p for p in data.permissions if p not in PERMISSIONS]
    if invalid_perms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Permisos inválidos: {', '.join(invalid_perms)}",
        )

    role_doc = {
        "name": data.name,
        "description": data.description,
        "permissions": data.permissions,
    }
    role = await role_repo.create(role_doc)
    return _role_response(role)


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    role_repo = RoleRepository(db)
    role = await role_repo.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return _role_response(role)


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    data: RoleUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    role_repo = RoleRepository(db)

    role = await role_repo.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    update_fields = data.model_dump(exclude_unset=True)

    if "permissions" in update_fields:
        invalid_perms = [p for p in update_fields["permissions"] if p not in PERMISSIONS]
        if invalid_perms:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Permisos inválidos: {', '.join(invalid_perms)}",
            )

    updated = await role_repo.update(role_id, update_fields)
    return _role_response(updated)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    role_repo = RoleRepository(db)
    role = await role_repo.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if role["name"] in ("admin", "user"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden eliminar los roles base",
        )
    await role_repo.delete(role_id)


@router.get("/users/{user_id}", response_model=UserRoleResponse)
async def get_user_roles(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserRoleResponse(
        user_id=user_id,
        roles=user.get("roles", []),
    )


@router.put("/users/{user_id}", response_model=UserRoleResponse)
async def assign_user_roles(
    user_id: str,
    data: UserRoleAssign,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    user_repo = UserRepository(db)
    role_repo = RoleRepository(db)

    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.role_names:
        existing_roles = await role_repo.get_by_names(data.role_names)
        existing_names = {r["name"] for r in existing_roles}
        invalid = set(data.role_names) - existing_names
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roles inexistentes: {', '.join(invalid)}",
            )

    await user_repo.update(user_id, {"roles": data.role_names})
    return UserRoleResponse(user_id=user_id, roles=data.role_names)
