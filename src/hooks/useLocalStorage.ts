import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para persistir estado en `localStorage`.
 * Devuelve una tupla `[value, setValue]` igual que `useState`,
 * pero cualquier cambio también se guarda en localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Si localStorage no está disponible, ignoramos silenciosamente.
    }
  }, [key, value]);

  // Permite limpiar la entrada guardada
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(initialValue);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
}
