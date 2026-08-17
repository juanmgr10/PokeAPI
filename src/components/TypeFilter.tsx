import { POKEMON_TYPES } from '../types/pokemon';

interface TypeFilterProps {
  value: string | null;
  onChange: (type: string | null) => void;
}

/** Selector de filtro por tipo elemental de Pokémon. */
export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <div className="type-filter">
      <label htmlFor="type-filter">Filtrar por tipo:</label>
      <select
        id="type-filter"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      >
        <option value="">Todos los tipos</option>
        {POKEMON_TYPES.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
