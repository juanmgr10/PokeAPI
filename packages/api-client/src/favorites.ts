// ============================================================
// MÓDULO api-client — Favoritos del usuario contra FastAPI.
// ------------------------------------------------------------
// Igual que auth.ts: único lugar donde se llama al servidor para
// favoritos. Los componentes del frontend nunca hacen fetch()
// directo, solo consumen estas funciones.
// ============================================================

import { AUTH_API_BASE } from './config';

interface FavoritesResponse {
  pokemon_ids: number[];
}

async function handleResponse(res: Response): Promise<number[]> {
  if (!res.ok) {
    let message = `Error al consultar favoritos (HTTP ${res.status})`;
    try {
      const data: { detail?: string } = await res.json();
      if (data.detail) message = data.detail;
    } catch {
      // Si la respuesta no es JSON, dejamos el mensaje genérico.
    }
    throw new Error(message);
  }
  const data = (await res.json()) as FavoritesResponse;
  return data.pokemon_ids;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET /api/favorites — lista de ids de Pokémon favoritos del usuario. */
export async function getFavorites(token: string): Promise<number[]> {
  const res = await fetch(`${AUTH_API_BASE}/favorites`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** PUT /api/favorites/{id} — añade un favorito (idempotente). */
export async function addFavorite(
  token: string,
  pokemonId: number
): Promise<number[]> {
  const res = await fetch(`${AUTH_API_BASE}/favorites/${pokemonId}`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** DELETE /api/favorites/{id} — quita un favorito. */
export async function removeFavorite(
  token: string,
  pokemonId: number
): Promise<number[]> {
  const res = await fetch(`${AUTH_API_BASE}/favorites/${pokemonId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
