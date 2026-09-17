"""
Dependencias comunes de FastAPI (autenticación).
"""

from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import User
from app.security import resolve_token


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    session: AsyncSession = Depends(get_session),
) -> User:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")

    token = authorization.removeprefix("Bearer ").strip()
    user_id = resolve_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    return user
