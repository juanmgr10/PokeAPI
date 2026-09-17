"""
Motor async de SQLAlchemy y dependencia de sesión para FastAPI.

El esquema NO se crea aquí (nada de Base.metadata.create_all): lo
gobiernan las migraciones de Alembic (ver alembic/).
"""

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

engine = create_async_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    """Dependencia de FastAPI: entrega una sesión y la cierra al terminar."""
    async with SessionLocal() as session:
        yield session
