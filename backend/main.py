"""
Punto de entrada para `uvicorn main:app`. La aplicación real vive en
app/main.py; este archivo solo existe para mantener el comando de
arranque documentado en el README.
"""

from app.main import app

__all__ = ["app"]
