import type { Pokemon } from '@pokedex/backend';
import { capitalize, formatId } from '../utils/format';
import { getTypeColor } from '../utils/typeColors';

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onSelect: (pokemon: Pokemon) => void;
  onToggleFavorite: (pokemon: Pokemon) => void;
}

/**
 * Tarjeta del grid. Muestra estrictamente: Imagen, Nombre e ID.
 * Toda la tarjeta es clicable para abrir el detalle.
 */
export function PokemonCard({
  pokemon,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: PokemonCardProps) {
  const typeColor = getTypeColor(pokemon.types[0]?.type.name ?? 'normal');

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      style={{ '--type-color': typeColor } as React.CSSProperties}
      onClick={() => onSelect(pokemon)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(pokemon);
        }
      }}
    >
      <button
        className={`fav-btn ${isFavorite ? 'active' : ''}`}
        aria-label={
          isFavorite
            ? `Quitar a ${pokemon.name} de favoritos`
            : `Agregar a ${pokemon.name} a favoritos`
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(pokemon);
        }}
      >
        {isFavorite ? '★' : '☆'}
      </button>
      <img
        src={pokemon.sprites.front_default ?? undefined}
        alt={pokemon.name}
        loading="lazy"
      />
      <h3 className="card-name">{capitalize(pokemon.name)}</h3>
      <span className="card-id">{formatId(pokemon.id)}</span>
    </div>
  );
}
