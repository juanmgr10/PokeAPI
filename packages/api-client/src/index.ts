

export {
  fetchPokemonPage,
  fetchPokemonByType,
  fetchPokemon,
  fetchPokemonDetails,
  fetchEvolutionChain,
} from './pokeApi';

export { POKEAPI_BASE } from './config';

export { login, register, logout } from './auth';
export type { AuthCredentials, AuthSession } from './auth';

export { getFavorites, addFavorite, removeFavorite } from './favorites';

export type {
  EvolutionChain,
  EvolutionDetail,
  EvolutionNode,
  Pokemon,
  PokemonListItem,
  PokemonSpecies,
  PokemonSprites,
  PokemonStat,
  PokemonType,
  TypeResponse,
} from './types/pokemon';
