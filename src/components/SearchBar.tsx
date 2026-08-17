interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Barra de busqueda (componente controlado).
 * El valor se eleva al componente App, que aplica el debounce
 * con el custom hook `useDebounce` para no saturar la API
 * mientras el usuario escribe.
 */
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="text"
        value={value}
        placeholder="pikachu, charizard, 25..."
        aria-label="Buscar Pokémon por nombre o ID"
        onChange={(e) => onChange(e.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="clear-search"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
        >
          ✕
        </button>
      )}
    </form>
  );
}
