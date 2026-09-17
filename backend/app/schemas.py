"""
Modelos Pydantic de entrada/salida de la API.
"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


class LogoutRequest(BaseModel):
    token: str


class AuthResponse(BaseModel):
    success: bool
    username: str
    token: str


class FavoritesResponse(BaseModel):
    pokemon_ids: list[int]
