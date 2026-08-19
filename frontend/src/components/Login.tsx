import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '@pokedex/backend';
import type { AuthSession } from '@pokedex/backend';

interface LoginProps {
  onSuccess: (session: AuthSession) => void;
}

/**
 * Pantalla de login: valida credenciales contra el servidor
 * FastAPI usando el módulo `@pokedex/backend` (nunca fetch
 * directo desde los componentes).
 */
export function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError(null);
    try {
      const session = await login({
        username: username.trim(),
        password,
      });
      onSuccess(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-card">
        <h2>🎮 Iniciar sesión</h2>
        <p className="login-subtitle">Ingresa para explorar la Pokédex</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-username">Usuario</label>
            <input
              id="login-username"
              type="text"
              value={username}
              autoComplete="username"
              placeholder="admin"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              ❌ {error}
            </p>
          )}

          <button
            className="btn login-submit"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? '⏳ Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-hint">Usuarios de prueba: admin / admin123</p>
      </div>
    </div>
  );
}
