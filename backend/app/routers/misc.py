"""
Endpoints de ejemplo originales de la práctica (sin cambios de
comportamiento respecto a la versión previa a la base de datos).
"""

import httpx
from fastapi import APIRouter

router = APIRouter()

JSONPLACEHOLDER_URL = "https://jsonplaceholder.typicode.com/posts"


@router.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}


@router.get("/saludo")
def saludo():
    return "¡Hola desde FastAPI! 👋"


@router.get("/posts")
async def get_posts():
    async with httpx.AsyncClient() as client:
        response = await client.get(JSONPLACEHOLDER_URL)
        response.raise_for_status()
        return response.json()
