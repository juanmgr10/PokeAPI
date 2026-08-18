import type {
  EvolutionNode,
  Pokemon,
  PokemonListItem,
  TypeResponse,
} from './types/pokemon';
import { POKEAPI_BASE } from './config';

/**
 * GET genérico: hace la petición, verifica que el endpoint
 * responda correctamente y lanza un error claro si no.
 */
async function getJson<T>(url: string, errorMessage: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${errorMessage} (HTTP ${res.status})`);
  }
  return res.json() as Promise<T>;
}


/** GET /pokemon?limit=&offset= — lista paginada de Pokémon. */
export async function fetchPokemonPage(
  limit: number,
  offset: number
): Promise<PokemonListItem[]> {
  const data = await getJson<{ results: PokemonListItem[] }>(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    'Error al cargar la lista de Pokémon'
  );
  return data.results;
}

/** GET /type/{type} — lista de Pokémon que pertenecen a un tipo. */
export async function fetchPokemonByType(
  type: string
): Promise<PokemonListItem[]> {
  const data = await getJson<TypeResponse>(
    `${POKEAPI_BASE}/type/${type}`,
    `No se pudo cargar el tipo "${type}"`
  );
  return data.pokemon.map((entry) => entry.pokemon);
}

/** GET /pokemon/{name|id} — un Pokémon concreto (por nombre o ID). */
export async function fetchPokemon(
  nameOrId: string | number
): Promise<Pokemon> {
  const query = String(nameOrId).trim().toLowerCase();
  return getJson<Pokemon>(
    `${POKEAPI_BASE}/pokemon/${query}`,
    `No se encontró "${query}"`
  );
}

/** GET por cada URL de item — detalles completos en paralelo (Promise.all). */
export async function fetchPokemonDetails(
  items: PokemonListItem[]
): Promise<Pokemon[]> {
  return Promise.all(
    items.map((item) =>
      getJson<Pokemon>(item.url, `Error al cargar los datos de ${item.name}`)
    )
  );
}

/** GET /pokemon-species/{id} — especie (para localizar la cadena de evolución). */
async function fetchPokemonSpecies(
  id: number
): Promise<{ evolution_chain: { url: string } }> {
  return getJson(
    `${POKEAPI_BASE}/pokemon-species/${id}`,
    'No se pudo obtener la especie'
  );
}

/** GET /evolution-chain/{id} — cadena de evolución cruda de la API. */
async function fetchEvolutionChainRaw(
  url: string
): Promise<{ chain: EvolutionNode }> {
  return getJson(url, 'No se pudo obtener la evolución');
}

/**
 * Compuesto: obtiene la cadena de evolución de un Pokémon
 * (species → evolution-chain) y resuelve el sprite de cada etapa.
 * Devuelve null si algo falla, sin romper la vista de detalle.
 */
export async function fetchEvolutionChain(
  pokemonId: number
): Promise<EvolutionNode | null> {
  try {
    const species = await fetchPokemonSpecies(pokemonId);
    const { chain } = await fetchEvolutionChainRaw(
      species.evolution_chain.url
    );
    return await resolveChainSprites(chain);
  } catch {
    return null;
  }
}

/** Recorre la cadena y adjunta el sprite de cada etapa (de forma recursiva). */
async function resolveChainSprites(node: EvolutionNode): Promise<EvolutionNode> {
  let sprite: string | null = null;
  try {
    const pokemon = await fetchPokemon(node.species.name);
    sprite = pokemon.sprites.front_default;
  } catch {
    sprite = null;
  }

  return {
    ...node,
    sprite,
    evolves_to: await Promise.all(
      node.evolves_to.map(resolveChainSprites)
    ),
  };
}
