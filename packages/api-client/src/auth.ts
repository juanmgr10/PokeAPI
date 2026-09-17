// ============================================================
// MÓDULO api-client — Autenticación (login/registro) contra FastAPI.
// ------------------------------------------------------------
// Único lugar donde se llama al servidor FastAPI desde el
// navegador. Los componentes del frontend solo consumen
// login()/register()/logout(), nunca fetch().
// ============================================================

import { AUTH_API_BASE } from './config';

/** Credenciales que envía el formulario de login o de registro. */
export interface AuthCredentials {
  username: string;
  password: string;
}

/** Sesión devuelta por el servidor tras un login o registro válido. */
export interface AuthSession {
  success: boolean;
  username: string;
  token: string;
}

/** POST a /api/login o /api/register; ambos responden un AuthSession. */
async function postAuth(
  path: 'login' | 'register',
  credentials: AuthCredentials,
  fallbackMessage: string
): Promise<AuthSession> {
  const res = await fetch(`${AUTH_API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    // FastAPI devuelve { detail: "..." } en los errores HTTP.
    let message = `${fallbackMessage} (HTTP ${res.status})`;
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
 * POST /api/login — valida credenciales contra el servidor
 * FastAPI y devuelve la sesión (con token).
 * Lanza un Error con el mensaje del servidor si falla.
 */
export async function login(
  credentials: AuthCredentials
): Promise<AuthSession> {
  return postAuth('login', credentials, 'Error al iniciar sesión');
}

/**
 * POST /api/register — crea un usuario nuevo y devuelve la sesión
 * ya autenticada (con token), igual que login().
 * Lanza un Error con el mensaje del servidor si falla (p. ej. 409
 * si el usuario ya existe).
 */
export async function register(
  credentials: AuthCredentials
): Promise<AuthSession> {
  return postAuth('register', credentials, 'Error al crear la cuenta');
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
