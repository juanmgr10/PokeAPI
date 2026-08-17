// ============================================================
// TypeScript interfaces para la PokéAPI
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
  /** URL del sprite. La resuelve la capa de servicios, no los componentes. */
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




export const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
export const PAGE_SIZE = 20;
export const TOTAL_POKEMON = 1025;


export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

/** Utilidad para capitalizar la primera letra de una cadena. */
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/** Formatea un ID como número de Pokédex (ej. 25 -> #025). */
export const formatId = (id: number): string =>
  `#${String(id).padStart(3, '0')}`;
