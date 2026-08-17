import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';

interface PokemonGridProps {
  pokemonList: Pokemon[];
  favorites: number[];
  onSelect: (pokemon: Pokemon) => void;
  onToggleFavorite: (pokemon: Pokemon) => void;
}

/** Contenedor en grid responsive de las tarjetas de Pokémon. */
export function PokemonGrid({
  pokemonList,
  favorites,
  onSelect,
  onToggleFavorite,
}: PokemonGridProps) {
  if (pokemonList.length === 0) {
    return <p className="empty-state">No hay Pokémon para mostrar.</p>;
  }

  return (
    <div className="pokemon-grid">
      {pokemonList.map((pokemon) => (
        <PokemonCard
          key={pokemon.id}
          pokemon={pokemon}
          isFavorite={favorites.includes(pokemon.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
