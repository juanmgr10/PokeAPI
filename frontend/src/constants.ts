// ============================================================
// Constantes de la UI (frontend).
// ============================================================

/** Número de Pokémon por página en el grid. */
export const PAGE_SIZE = 20;

/** Total de Pokémon en la PokéAPI (National Pokédex). */
export const TOTAL_POKEMON = 1025;

/** Tipos elementales disponibles para el filtro. */
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
