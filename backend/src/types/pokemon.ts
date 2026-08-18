// ============================================================
// TypeScript interfaces para la PokéAPI
// ------------------------------------------------------------
// Definen el CONTRATO de datos del módulo backend. El frontend
// importa estos tipos desde `@pokedex/backend`.
// ============================================================

/** Item de la lista paginada de Pokémon (`/pokemon?limit=&offset=`). */
export interface PokemonListItem {
  name: string;
  url: string;
}

/** Tipo de un Pokémon (elemento de `pokemon.types`). */
export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

/** Estadística base de un Pokémon (elemento de `pokemon.stats`). */
export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

/** Sprites disponibles de un Pokémon. */
export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  [key: string]: string | null | undefined;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: PokemonSprites;
  types: PokemonType[];
  stats: PokemonStat[];
  species: {
    name: string;
    url: string;
  };
}

/** Respuesta del endpoint `/pokemon-species/{id}` (solo la parte útil). */
export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  /** URL del sprite. La resuelve el backend (capa de servicios), no los componentes. */
  sprite: string | null;
  evolves_to: EvolutionNode[];
  evolution_details: EvolutionDetail[];
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: {
    name: string;
    url: string;
  };
  item: { name: string; url: string } | null;
}

/** Respuesta completa de `/evolution-chain/{id}`. */
export interface EvolutionChain {
  id: number;
  chain: EvolutionNode;
}

/** Respuesta del endpoint `/type/{tipo}` (solo la parte útil). */
export interface TypeResponse {
  id: number;
  name: string;
  pokemon: Array<{
    slot: number;
    pokemon: PokemonListItem;
  }>;
}
