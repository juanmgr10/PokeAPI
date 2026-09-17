"""
Configuración de la aplicación, leída de variables de entorno (y de un
archivo .env en desarrollo local). Un único objeto `settings` se importa
donde haga falta.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Conexión async a Postgres (driver asyncpg).
    database_url: str = "postgresql+asyncpg://pokedex:pokedex@localhost:5432/pokedex"

    # Orígenes permitidos por CORS. En desarrollo el proxy de Vite hace
    # que esto no sea estrictamente necesario, pero queda listo por si el
    # frontend se sirve desde otro origen (p. ej. detrás de nginx).
    cors_origins: list[str] = ["http://localhost:5173"]

    # Sembrar los usuarios de prueba (admin/estudiante) al arrancar si la
    # tabla `users` está vacía.
    seed_demo_users: bool = True

    # Minutos de validez de un token de sesión emitido por /api/login.
    token_ttl_minutes: int = 480


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
