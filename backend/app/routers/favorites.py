"""
Favoritos del usuario autenticado.

Reemplaza el antiguo almacenamiento en localStorage ("pokedex-favorites")
por una tabla en Postgres ligada al usuario. Cada endpoint devuelve la
lista completa de ids: la respuesta es la fuente de verdad para el
frontend.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.deps import get_current_user
from app.models import Favorite, User
from app.schemas import FavoritesResponse

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


async def _current_favorites(session: AsyncSession, user_id: int) -> list[int]:
    result = await session.scalars(
        select(Favorite.pokemon_id)
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.pokemon_id)
    )
    return list(result)


@router.get("", response_model=FavoritesResponse)
async def list_favorites(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FavoritesResponse:
    return FavoritesResponse(pokemon_ids=await _current_favorites(session, user.id))


@router.put("/{pokemon_id}", response_model=FavoritesResponse)
async def add_favorite(
    pokemon_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FavoritesResponse:
    stmt = (
        pg_insert(Favorite)
        .values(user_id=user.id, pokemon_id=pokemon_id)
        .on_conflict_do_nothing(constraint="uq_user_pokemon")
    )
    await session.execute(stmt)
    await session.commit()
    return FavoritesResponse(pokemon_ids=await _current_favorites(session, user.id))


@router.delete("/{pokemon_id}", response_model=FavoritesResponse)
async def remove_favorite(
    pokemon_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FavoritesResponse:
    await session.execute(
        delete(Favorite).where(
            Favorite.user_id == user.id, Favorite.pokemon_id == pokemon_id
        )
    )
    await session.commit()
    return FavoritesResponse(pokemon_ids=await _current_favorites(session, user.id))
