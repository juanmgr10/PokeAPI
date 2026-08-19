// ============================================================
// MÓDULO BACKEND — Autenticación (login) contra FastAPI.
// ------------------------------------------------------------
// Único lugar donde se llama al servidor FastAPI desde el
// navegador. Los componentes del frontend solo consumen
// login()/logout(), nunca fetch().
// ============================================================

import { AUTH_API_BASE } from './config';

/** Credenciales que envía el formulario de login. */
export interface AuthCredentials {
  username: string;
  password: string;
}

/** Sesión devuelta por el servidor tras un login válido. */
export interface AuthSession {
  success: boolean;
  username: string;
  token: string;
}

/**
 * POST /api/login — valida credenciales contra el servidor
 * FastAPI y devuelve la sesión (con token).
 * Lanza un Error con el mensaje del servidor si falla.
 */
export async function login(
  credentials: AuthCredentials
): Promise<AuthSession> {
  const res = await fetch(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    // FastAPI devuelve { detail: "..." } en los errores HTTP.
    let message = `Error al iniciar sesión (HTTP ${res.status})`;
    try {
      const data: { detail?: string } = await res.json();
      if (data.detail) message = data.detail;
    } catch {
      // Si la respuesta no es JSON, dejamos el mensaje genérico.
    }
    throw new Error(message);
  }

  return res.json() as Promise<AuthSession>;
}

/**
 * POST /api/logout — invalida el token en el servidor.
 * Si el servidor está caído, el error se ignora (la sesión
 * local se limpia igual en el frontend).
 */
export async function logout(token: string): Promise<void> {
  await fetch(`${AUTH_API_BASE}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}
