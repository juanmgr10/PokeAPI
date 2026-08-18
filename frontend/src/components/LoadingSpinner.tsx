interface LoadingSpinnerProps {
  message?: string;
}

/** Indicador visual de carga mientras se espera la respuesta de la API. */
export function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
