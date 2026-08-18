interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

/** Mensaje de error claro en la UI con opción opcional de reintentar. */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-box" role="alert">
      <p>❌ {message}</p>
      {onRetry && (
        <button className="btn btn-small" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
