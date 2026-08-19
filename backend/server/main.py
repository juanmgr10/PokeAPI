"""
API del proyecto Pokédex (FastAPI).

Endpoints:
  GET  /            -> mensaje de bienvenida
  GET  /saludo      -> saludo de ejemplo
  GET  /posts       -> proxy de ejemplo a jsonplaceholder
  POST /api/login   -> valida credenciales y devuelve un token de sesión
  POST /api/logout  -> invalida el token de sesión

Ejecutar (desde backend/server/):
  uvicorn main:app --reload --port 8000
"""

import secrets

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="API Pokédex — Login")

JSONPLACEHOLDER_URL = "https://jsonplaceholder.typicode.com/posts"

# ------------------------------------------------------------
# Credenciales fijas de la práctica.
# En un proyecto real irían en una base de datos o variables
# de entorno, con contraseñas hasheadas.
# ------------------------------------------------------------
USERS = {
    "admin": "admin123",
    "estudiante": "12345",
}

# Tokens de sesión activos (en memoria; se pierden al reiniciar).
ACTIVE_TOKENS: set[str] = set()


class LoginRequest(BaseModel):
    username: str
    password: str


class LogoutRequest(BaseModel):
    token: str


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}


@app.get("/saludo")
def saludo():
    return "¡Hola desde FastAPI! 👋"


@app.get("/posts")
async def get_posts():
    async with httpx.AsyncClient() as client:
        response = await client.get(JSONPLACEHOLDER_URL)
        response.raise_for_status()
        return response.json()


@app.post("/api/login")
def api_login(credentials: LoginRequest):
    username = credentials.username.strip()
    expected = USERS.get(username.lower())

    # compare_digest compara de forma constante para no filtrar
    # información por tiempos de respuesta.
    if expected is None or not secrets.compare_digest(
        credentials.password, expected
    ):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = secrets.token_hex(16)
    ACTIVE_TOKENS.add(token)
    return {"success": True, "username": username, "token": token}


@app.post("/api/logout")
def api_logout(body: LogoutRequest):
    ACTIVE_TOKENS.discard(body.token)
    return {"success": True}
