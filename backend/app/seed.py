"""
Siembra idempotente de los usuarios de prueba de la práctica.

Se ejecuta en el lifespan de la app si SEED_DEMO_USERS=true (default).
No pisa usuarios ya existentes, así que es seguro correrlo en cada
arranque.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.security import hash_password

DEMO_USERS = {
    "admin": "admin123",
    "estudiante": "12345",
}


async def seed_demo_users(session: AsyncSession) -> None:
    for username, password in DEMO_USERS.items():
        existing = await session.scalar(select(User).where(User.username == username))
        if existing is not None:
            continue
        session.add(User(username=username, password_hash=hash_password(password)))
    await session.commit()
