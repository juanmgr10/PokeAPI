#!/bin/sh
# Aplica las migraciones pendientes y arranca uvicorn. Se ejecuta como
# ENTRYPOINT del contenedor `api`; los argumentos del `command` de
# docker-compose (p. ej. --reload) se pasan tal cual a uvicorn.
set -e

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"
