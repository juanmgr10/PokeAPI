"""
Fábrica de la aplicación FastAPI.

Ejecutar (desde backend/):
  uvicorn main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import SessionLocal
from app.routers import auth, favorites, misc
from app.seed import seed_demo_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.seed_demo_users:
        async with SessionLocal() as session:
            await seed_demo_users(session)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="API Pokédex", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(misc.router)
    app.include_router(auth.router)
    app.include_router(favorites.router)

    return app


app = create_app()
