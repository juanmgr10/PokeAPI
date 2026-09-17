# Servidor FastAPI — Pokédex (con PostgreSQL)

Usuarios y favoritos se guardan en PostgreSQL vía SQLAlchemy 2.0 async +
Alembic. Las sesiones (tokens) siguen en memoria: se pierden al
reiniciar el servidor, igual que en la versión original.

## Con Docker (recomendado)

Desde la **raíz del repo**:

```bash
cp .env.example .env
docker compose up --build
```

Levanta `db` (Postgres 17) y `api` (FastAPI en `:8000`, con
`--reload`). Al arrancar, `api` aplica las migraciones de Alembic y
siembra los usuarios de prueba si la tabla `users` está vacía.

Después, en otra terminal levanta el frontend: `npm run dev` (en la
raíz del monorepo). El proxy de Vite sigue redirigiendo `/api/*` a
`http://localhost:8000`, sin cambios.

Para inspeccionar la base de datos:

```bash
docker compose exec db psql -U pokedex -d pokedex
```

## Sin Docker (venv local)

Requiere una instancia de Postgres accesible (por ejemplo, solo el
servicio `db` de compose: `docker compose up db`).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL=postgresql+asyncpg://pokedex:pokedex@localhost:5432/pokedex
alembic upgrade head
uvicorn main:app --reload --port 8000
```

## Migraciones

```bash
# nueva migración a partir de cambios en app/models.py
alembic revision --autogenerate -m "descripción"

# aplicar migraciones pendientes
alembic upgrade head
```

Revisa siempre el archivo autogenerado en `alembic/versions/` antes de
darlo por bueno.

## Endpoints

- `GET /`, `GET /saludo`, `GET /posts` — ejemplos originales de la práctica.
- `POST /api/register` — body `{ "username": "...", "password": "..." }`; crea el usuario y responde `{ success, username, token }`, o `409` si ya existe.
- `POST /api/login` — body `{ "username": "admin", "password": "admin123" }`; responde `{ "success": true, "username": ..., "token": ... }` o `401` con `detail`.
- `POST /api/logout` — body `{ "token": "..." }`; invalida el token.
- `GET /api/favorites` — requiere `Authorization: Bearer <token>`; responde `{ "pokemon_ids": [...] }`.
- `PUT /api/favorites/{pokemon_id}` — añade un favorito (idempotente).
- `DELETE /api/favorites/{pokemon_id}` — quita un favorito.

Documentación interactiva: `http://localhost:8000/docs`.

## Credenciales de prueba

Sembradas automáticamente al arrancar (`SEED_DEMO_USERS=true` por defecto):

- `admin` / `admin123`
- `estudiante` / `12345`
