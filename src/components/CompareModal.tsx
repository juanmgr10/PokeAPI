import type { Pokemon } from '../types/pokemon';
import { capitalize, formatId } from '../types/pokemon';
import { getTypeColor } from '../utils/typeColors';

interface CompareModalProps {
  left: Pokemon;
  right: Pokemon;
  onClose: () => void;
}

/**
 * Modal que compara dos Pokémon lado a lado:
 * sprite, nombre, ID, tipos y estadísticas.
 */
export function CompareModal({ left, right, onClose }: CompareModalProps) {
  const leftTotal = left.stats.reduce((acc, s) => acc + s.base_stat, 0);
  const rightTotal = right.stats.reduce((acc, s) => acc + s.base_stat, 0);

  const renderPanel = (pokemon: Pokemon, total: number) => (
    <div
      className="compare-panel"
      style={{ '--type-color': getTypeColor(pokemon.types[0]?.type.name ?? 'normal') } as React.CSSProperties}
    >
      <img src={pokemon.sprites.front_default ?? undefined} alt={pokemon.name} />
      <h3>
        {capitalize(pokemon.name)} <span>{formatId(pokemon.id)}</span>
      </h3>
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
      <div className="compare-stats">
        {pokemon.stats.map((s) => (
          <div key={s.stat.name} className="compare-stat">
            <span className="stat-label">{s.stat.name.replace('-', ' ')}</span>
            <span className="stat-value">{s.base_stat}</span>
          </div>
        ))}
        <div className="compare-stat total">
          <span className="stat-label">Total</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚔️ Comparación</h2>
          <button className="btn btn-small" onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>
        <div className="compare-container">
          {renderPanel(left, leftTotal)}
          <div className="vs">VS</div>
          {renderPanel(right, rightTotal)}
        </div>
      </div>
    </div>
  );
}
