# Servidor FastAPI — Login de la Pokédex

## Ejecutar

```bash
cd backend/server
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Después, en otra terminal levanta el frontend: `npm run dev` (en la raíz del monorepo).
El proxy de Vite redirige `/api/*` a `http://localhost:8000`.

## Endpoints

- `GET /`, `GET /saludo`, `GET /posts` — ejemplos originales de la práctica.
- `POST /api/login` — body `{ "username": "admin", "password": "admin123" }`; responde `{ "success": true, "username": ..., "token": ... }` o `401` con `detail`.
- `POST /api/logout` — body `{ "token": "..." }`; invalida el token.

## Credenciales de prueba

- `admin` / `admin123`
- `estudiante` / `12345`
