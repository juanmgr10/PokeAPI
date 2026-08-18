import type { EvolutionNode } from '@pokedex/backend';
import { capitalize } from '../utils/format';

interface EvolutionChainProps {
  chain: EvolutionNode;
}

/**
 * Muestra la cadena de evoluciones de un Pokémon.
 * Renderiza de forma recursiva cada etapa con su sprite.
 */
export function EvolutionChain({ chain }: EvolutionChainProps) {
  return (
    <div className="evolution-chain">
      <EvolutionBranch node={chain} />
    </div>
  );
}

function EvolutionBranch({ node }: { node: EvolutionNode }) {
  return (
    <div className="evo-branch">
      <div className="evo-stage">
        {node.sprite ? (
          <img
            src={node.sprite}
            alt={node.species.name}
            loading="lazy"
          />
        ) : (
          <div className="evo-skeleton" aria-hidden="true" />
        )}
        <span className="evo-name">{capitalize(node.species.name)}</span>
      </div>
      {node.evolves_to.length > 0 && (
        <>
          <span className="evo-arrow" aria-hidden="true">
            ➜
          </span>
          <div className="evo-sub-branches">
            {node.evolves_to.map((child, i) => (
              <EvolutionBranch key={`${child.species.name}-${i}`} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
