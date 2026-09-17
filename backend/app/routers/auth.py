"""
Autenticación: registro, login y logout.

Las credenciales viven en Postgres (tabla `users`, contraseñas con hash
argon2). Los tokens de sesión siguen en memoria -- ver app/security.py.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import User
from app.schemas import AuthResponse, LoginRequest, LogoutRequest, RegisterRequest
from app.security import hash_password, issue_token, revoke_token, verify_password

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    body: RegisterRequest, session: AsyncSession = Depends(get_session)
) -> AuthResponse:
    username = body.username.strip().lower()
    if not username or not body.password:
        raise HTTPException(status_code=422, detail="Usuario y contraseña son obligatorios")

    user = User(username=username, password_hash=hash_password(body.password))
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="El usuario ya existe")

    token = issue_token(user.id)
    return AuthResponse(success=True, username=user.username, token=token)


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: LoginRequest, session: AsyncSession = Depends(get_session)
) -> AuthResponse:
    username = credentials.username.strip().lower()
    user = await session.scalar(select(User).where(User.username == username))

    # verify_password se ejecuta siempre, incluso con user=None, para no
    # filtrar por tiempo de respuesta qué usuarios existen.
    password_hash = user.password_hash if user is not None else None
    if not verify_password(credentials.password, password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = issue_token(user.id)
    return AuthResponse(success=True, username=user.username, token=token)


@router.post("/logout")
def logout(body: LogoutRequest) -> dict[str, bool]:
    revoke_token(body.token)
    return {"success": True}
