interface Gen1ButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

/**
 * Botón "Cargar Gen 1": dispara la carga en paralelo de los 151
 * Pokémon originales usando `Promise.all`.
 */
export function Gen1Button({ onClick, isLoading }: Gen1ButtonProps) {
  return (
    <button
      className="btn gen1-btn"
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? '⏳ Cargando Gen 1...' : '🎮 Cargar Gen 1'}
    </button>
  );
}
