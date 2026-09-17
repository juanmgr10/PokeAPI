import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, register } from '@pokedex/api-client';
import type { AuthSession } from '@pokedex/api-client';

interface LoginProps {
  onSuccess: (session: AuthSession) => void;
}

type Mode = 'login' | 'register';

/**
 * Pantalla de login/registro: valida credenciales (o crea una cuenta
 * nueva) contra el servidor FastAPI usando el módulo `@pokedex/api-client`
 * (nunca fetch directo desde los componentes).
 */
export function Login({ onSuccess }: LoginProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    if (isRegister && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const credentials = { username: username.trim(), password };
      const session = isRegister
        ? await register(credentials)
        : await login(credentials);
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
        <h2>{isRegister ? '📝 Crear cuenta' : '🎮 Iniciar sesión'}</h2>
        <p className="login-subtitle">
          {isRegister
            ? 'Regístrate para guardar tus favoritos'
            : 'Ingresa para explorar la Pokédex'}
        </p>

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
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="login-field">
              <label htmlFor="login-confirm-password">
                Confirmar contraseña
              </label>
              <input
                id="login-confirm-password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

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
            {loading
              ? '⏳ Procesando...'
              : isRegister
                ? 'Crear cuenta'
                : 'Ingresar'}
          </button>
        </form>

        <button type="button" className="login-toggle" onClick={toggleMode}>
          {isRegister
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Créala aquí'}
        </button>

        {!isRegister && (
          <p className="login-hint">Usuarios de prueba: admin / admin123</p>
        )}
      </div>
    </div>
  );
}
