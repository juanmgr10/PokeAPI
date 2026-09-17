import { useState } from 'react';
import type { EvolutionNode, Pokemon } from '@pokedex/api-client';
import { capitalize, formatId } from '../utils/format';
import { getTypeColor } from '../utils/typeColors';
import { EvolutionChain } from './EvolutionChain';
import { LoadingSpinner } from './LoadingSpinner';

interface PokemonDetailProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  isInCompare: boolean;
  evolutionChain: EvolutionNode | null;
  isEvolutionLoading: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onAddToCompare: (pokemon: Pokemon) => void;
}

/** Vista de detalle completo de un Pokémon. */
export function PokemonDetail({
  pokemon,
  isFavorite,
  isInCompare,
  evolutionChain,
  isEvolutionLoading,
  onToggleFavorite,
  onBack,
  onAddToCompare,
}: PokemonDetailProps) {
  // Toggle shiny: alterna entre front_default y front_shiny
  const [shiny, setShiny] = useState(false);

  const sprite = shiny
    ? pokemon.sprites.front_shiny ?? pokemon.sprites.front_default
    : pokemon.sprites.front_default;

  return (
    <div className="detail">
      <div className="detail-topbar">
        <button className="btn btn-small" onClick={onBack}>
          ← Volver
        </button>
        <div className="detail-actions">
          <button
            className={`btn btn-small fav-btn-detail ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★ Favorito' : '☆ Favorito'}
          </button>
          <button
            className="btn btn-small"
            onClick={() => onAddToCompare(pokemon)}
            disabled={isInCompare}
          >
            {isInCompare ? '✓ En comparación' : '⚔️ Comparar'}
          </button>
        </div>
      </div>

      <div
        className="detail-card"
        style={{
          '--type-color': getTypeColor(pokemon.types[0]?.type.name ?? 'normal'),
        } as React.CSSProperties}
      >
        <div className="detail-sprite">
          <img src={sprite ?? undefined} alt={`${pokemon.name}${shiny ? ' shiny' : ''}`} />
        </div>

        <h2 className="detail-name">
          {capitalize(pokemon.name)}{' '}
          <span className="detail-id">{formatId(pokemon.id)}</span>
        </h2>

        <div className="tipos">
          {pokemon.types.map((t) => (
            <span
              key={t.slot}
              className="type-badge"
              style={{ backgroundColor: getTypeColor(t.type.name) }}
            >
              {capitalize(t.type.name)}
            </span>
          ))}
        </div>

        <button
          className="btn btn-small shiny-toggle"
          onClick={() => setShiny((s) => !s)}
          aria-pressed={shiny}
        >
          ✨ {shiny ? 'Normal' : 'Shiny'}
        </button>

        <div className="stats">
          <h3>Estadísticas</h3>
          {pokemon.stats.map((s) => (
            <div key={s.stat.name} className="stat-row">
              <span className="stat-label">
                {capitalize(s.stat.name.replace('-', ' '))}
              </span>
              <div className="stat-bar">
                <div
                  className="stat-fill"
                  style={{ width: `${(s.base_stat / 255) * 100}%` }}
                />
              </div>
              <span className="stat-value">{s.base_stat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-evolutions">
        <h3>Cadena de evolución</h3>
        {isEvolutionLoading ? (
          <LoadingSpinner message="Cargando evoluciones..." />
        ) : evolutionChain ? (
          <EvolutionChain chain={evolutionChain} />
        ) : (
          <p className="empty-state">No se encontró cadena de evolución.</p>
        )}
      </div>
    </div>
  );
}
