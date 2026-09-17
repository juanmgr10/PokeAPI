"""
Hash de contraseñas (argon2) y store de tokens de sesión en memoria.

Los tokens siguen viviendo en memoria a propósito (igual que en la
versión original): no se pidió una tabla de sesiones, así que reiniciar
el contenedor cierra las sesiones abiertas. El frontend ya tolera esto
-- logout() ignora los fallos y un 401 simplemente vuelve a la pantalla
de login.
"""

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.config import settings

_hasher = PasswordHasher()

# Hash "dummy" contra el que se verifica cuando el usuario no existe, para
# que el tiempo de respuesta no revele qué usuarios están registrados
# (el mismo motivo por el que la versión original usaba compare_digest).
_DUMMY_HASH = _hasher.hash(secrets.token_hex(16))


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    """Verifica `password` contra `password_hash`.

    Si `password_hash` es None (usuario inexistente), igual se ejecuta un
    hash contra un valor dummy para no filtrar por tiempo de respuesta si
    el usuario existe o no.
    """
    try:
        _hasher.verify(password_hash or _DUMMY_HASH, password)
    except VerifyMismatchError:
        return False
    return password_hash is not None


@dataclass
class TokenInfo:
    user_id: int
    expires_at: datetime


# Tokens de sesión activos (en memoria; se pierden al reiniciar).
ACTIVE_TOKENS: dict[str, TokenInfo] = {}


def issue_token(user_id: int) -> str:
    token = secrets.token_hex(16)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.token_ttl_minutes
    )
    ACTIVE_TOKENS[token] = TokenInfo(user_id=user_id, expires_at=expires_at)
    return token


def revoke_token(token: str) -> None:
    ACTIVE_TOKENS.pop(token, None)


def resolve_token(token: str) -> int | None:
    """Devuelve el user_id del token si es válido y no ha expirado."""
    info = ACTIVE_TOKENS.get(token)
    if info is None:
        return None
    if info.expires_at < datetime.now(timezone.utc):
        ACTIVE_TOKENS.pop(token, None)
        return None
    return info.user_id
