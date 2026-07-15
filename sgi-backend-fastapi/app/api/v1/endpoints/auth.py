from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_database
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/auth", tags=["Autenticación"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )
    return user


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


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
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
    }
    user = await user_repo.create(user_doc)
    return _user_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    db = await get_database()
    user_repo = UserRepository(db)

    user = await user_repo.get_by_email(data.email)
    if user is None or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )

    access_token = create_access_token(str(user["_id"]), roles=user.get("roles", []))
    return TokenResponse(
        access_token=access_token,
        expires_in=1800,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_response(current_user)
