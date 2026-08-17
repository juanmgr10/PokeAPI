import { useState, useEffect, useCallback } from 'react';
import type {
  Pokemon,
  PokemonListItem,
  EvolutionNode,
} from './types/pokemon';
import {
  PAGE_SIZE,
  TOTAL_POKEMON,
  capitalize,
} from './types/pokemon';
import {
  fetchPokemonPage,
  fetchPokemonByType,
  fetchPokemonDetails,
  fetchPokemon,
  fetchEvolutionChain,
} from './services/pokeApi';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SearchBar } from './components/SearchBar';
import { PokemonGrid } from './components/PokemonGrid';
import { PokemonDetail } from './components/PokemonDetail';
import { TypeFilter } from './components/TypeFilter';
import { Gen1Button } from './components/Gen1Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { CompareModal } from './components/CompareModal';

type View = 'grid' | 'detail' | 'compare';

const SEARCH_DELAY_MS = 500;

function App() {
  // ---------------- Vista principal ----------------
  const [view, setView] = useState<View>('grid');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // ---------------- Lista / grid ----------------
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(TOTAL_POKEMON);
  const [gen1Loaded, setGen1Loaded] = useState(false);
  const [isGen1Loading, setIsGen1Loading] = useState(false);

  // ---------------- Búsqueda (con debounce) ----------------
  const [searchInput, setSearchInput] = useState('');
  const debouncedQuery = useDebounce(searchInput, SEARCH_DELAY_MS);
  const searchActive = debouncedQuery.trim() !== '';
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ---------------- Filtro por tipo ----------------
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // ---------------- Favoritos (persistidos en localStorage) ----------------
  const [favorites, setFavorites] = useLocalStorage<number[]>(
    'pokedex-favorites',
    []
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ---------------- Comparador ----------------
  const [compareList, setCompareList] = useState<Pokemon[]>([]);

  // ---------------- Evoluciones ----------------
  const [evolutionChain, setEvolutionChain] = useState<EvolutionNode | null>(
    null
  );
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  // ============================================================
  // Carga del grid: página normal (20) o filtrada por tipo.
  // Usa Promise.all para traer los detalles en paralelo.
  // ============================================================
  useEffect(() => {
    // La búsqueda y el modo Gen 1 tienen su propia lógica.
    if (searchActive || gen1Loaded) return;

    let cancelled = false;
    setListLoading(true);
    setListError(null);

    async function load() {
      try {
        let items: PokemonListItem[] = [];

        // El servicio valida el endpoint y devuelve el response verificado
        if (selectedType) {
          items = await fetchPokemonByType(selectedType);
          setTotalResults(items.length);
          items = items.slice(offset, offset + PAGE_SIZE);
        } else {
          items = await fetchPokemonPage(PAGE_SIZE, offset);
          setTotalResults(TOTAL_POKEMON);
        }

        // Detalles en paralelo con Promise.all (dentro del servicio)
        const details = await fetchPokemonDetails(items);

        if (!cancelled) setPokemonList(details);
      } catch (err) {
        if (!cancelled) {
          setListError(
            err instanceof Error ? err.message : 'Error desconocido'
          );
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [offset, selectedType, gen1Loaded, searchActive]);

  // ============================================================
  // Búsqueda: se dispara con el valor ya "debounceado".
  // Si existe -> detalle. Si no -> mensaje de error claro.
  // ============================================================
  useEffect(() => {
    if (!searchActive) {
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    // El servicio valida el endpoint y lanza el error si no existe
    fetchPokemon(debouncedQuery.trim())
      .then((data) => {
        if (!cancelled) {
          setSelectedPokemon(data);
          setView('detail');
          setSearchLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSearchError(
            err instanceof Error ? err.message : 'Error desconocido'
          );
          setSearchLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchActive]);

  // ============================================================
  // Evoluciones: al cambiar el Pokémon seleccionado, se consulta
  // /pokemon-species/{id} -> /evolution-chain/{id}
  // ============================================================
  useEffect(() => {
    // Capturamos el Pokémon en una constante para preservar el
    // narrowing de tipo dentro de la clausura asíncrona.
    const current = selectedPokemon;
    if (!current) {
      setEvolutionChain(null);
      setEvolutionLoading(false);
      return;
    }
    const currentId = current.id;

    let cancelled = false;
    setEvolutionLoading(true);
    setEvolutionChain(null);

    async function loadEvolution() {
      // El servicio encadena species -> evolution-chain y devuelve la
      // cadena con sprites ya resueltos (o null si algo falla).
      const chain = await fetchEvolutionChain(currentId);
      if (!cancelled) {
        setEvolutionChain(chain);
        setEvolutionLoading(false);
      }
    }

    loadEvolution();
    return () => {
      cancelled = true;
    };
  }, [selectedPokemon]);

  // ============================================================
  // "Cargar Gen 1": carga los 151 Pokémon originales con Promise.all
  // (peticiones simultáneas, nunca secuenciales en un bucle for).
  // ============================================================
  const loadGen1 = useCallback(async () => {
    setIsGen1Loading(true);
    setListError(null);
    setGen1Loaded(false);
    setSelectedType(null);
    setShowFavoritesOnly(false);
    setOffset(0);

    try {
      // El servicio valida los endpoints y carga los 151 en paralelo
      const listRes = await fetchPokemonPage(151, 0);
      const details = await fetchPokemonDetails(listRes);

      setPokemonList(details);
      setGen1Loaded(true);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGen1Loading(false);
    }
  }, []);

  // ============================================================
  // Handlers
  // ============================================================

  const handleSelect = useCallback((pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('grid');
    setSelectedPokemon(null);
    // Si veníamos de una búsqueda, la limpiamos para volver al grid.
    if (searchInput !== '') setSearchInput('');
  }, [searchInput]);

  const handleTypeChange = useCallback((type: string | null) => {
    setGen1Loaded(false);
    setShowFavoritesOnly(false);
    setSelectedType(type);
    setOffset(0);
  }, []);

  const handlePage = useCallback((dir: 1 | -1) => {
    // Paginar siempre sale del modo Gen 1.
    setGen1Loaded(false);
    setShowFavoritesOnly(false);
    setOffset((prev) => Math.max(0, prev + dir * PAGE_SIZE));
  }, []);

  const toggleFavorite = useCallback(
    (pokemon: Pokemon) => {
      setFavorites((prev) =>
        prev.includes(pokemon.id)
          ? prev.filter((id) => id !== pokemon.id)
          : [...prev, pokemon.id]
      );
    },
    [setFavorites]
  );

  const handleAddToCompare = useCallback((pokemon: Pokemon) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === pokemon.id)) return prev;
      const next = [...prev, pokemon];
      return next.slice(-2); // Máximo 2, si se añade un 3º se descarta el más antiguo
    });
  }, []);

  const removeFromCompare = useCallback((id: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  // ============================================================
  // Render
  // ============================================================

  const displayList = showFavoritesOnly
    ? pokemonList.filter((p) => favorites.includes(p.id))
    : pokemonList;

  const pageCount = Math.ceil(totalResults / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const hasNextPage =
    !gen1Loaded && !showFavoritesOnly && currentPage < pageCount;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Pokédex</h1>
        <p className="subtitle">
          Explora, busca y compara Pokémon de la PokéAPI
        </p>
      </header>

      {view === 'detail' && selectedPokemon ? (
        <PokemonDetail
          pokemon={selectedPokemon}
          isFavorite={favorites.includes(selectedPokemon.id)}
          isInCompare={compareList.some((p) => p.id === selectedPokemon.id)}
          evolutionChain={evolutionChain}
          isEvolutionLoading={evolutionLoading}
          onToggleFavorite={() => toggleFavorite(selectedPokemon)}
          onBack={handleBack}
          onAddToCompare={handleAddToCompare}
        />
      ) : (
        <main className="main">
          {/* ---------- Barra de herramientas ---------- */}
          <div className="toolbar">
            <SearchBar value={searchInput} onChange={setSearchInput} />
            <Gen1Button onClick={loadGen1} isLoading={isGen1Loading} />
          </div>

          <div className="filters">
            <TypeFilter value={selectedType} onChange={handleTypeChange} />
            <button
              className={`btn btn-small ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => {
                setGen1Loaded(false);
                setShowFavoritesOnly((s) => !s);
              }}
              aria-pressed={showFavoritesOnly}
            >
              {showFavoritesOnly ? '★ Mostrando favoritos' : '☆ Favoritos'}
            </button>
            {gen1Loaded && <span className="badge">Gen 1 cargado (151)</span>}
            {selectedType && (
              <span className="badge type-badge-static">
                Tipo: {capitalize(selectedType)}
              </span>
            )}
          </div>

          {/* ---------- Barra del comparador ---------- */}
          {compareList.length > 0 && (
            <div className="compare-bar">
              {compareList.map((p) => (
                <span key={p.id} className="compare-chip">
                  <img
                    src={p.sprites.front_default ?? undefined}
                    alt={p.name}
                  />
                  {capitalize(p.name)}
                  <button
                    className="chip-remove"
                    onClick={() => removeFromCompare(p.id)}
                    aria-label={`Quitar a ${p.name} de la comparación`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                className="btn btn-small"
                disabled={compareList.length < 2}
                onClick={() => setView('compare')}
              >
                ⚔️ Comparar
              </button>
              <button className="btn btn-small" onClick={clearCompare}>
                Limpiar
              </button>
            </div>
          )}

          {/* ---------- Área de contenido ---------- */}
          {searchActive ? (
            <div className="content-area">
              {searchLoading ? (
                <LoadingSpinner message="Buscando..." />
              ) : searchError ? (
                <ErrorMessage message={searchError} />
              ) : (
                <p className="empty-state">Escribe para buscar un Pokémon.</p>
              )}
            </div>
          ) : listLoading && pokemonList.length === 0 ? (
            <div className="content-area">
              <LoadingSpinner />
            </div>
          ) : listError ? (
            <div className="content-area">
              <ErrorMessage message={listError} />
            </div>
          ) : (
            <div className="content-area">
              <PokemonGrid
                pokemonList={displayList}
                favorites={favorites}
                onSelect={handleSelect}
                onToggleFavorite={toggleFavorite}
              />

              {/* ---------- Paginación ---------- */}
              {!gen1Loaded && !showFavoritesOnly && (
                <div className="pagination">
                  <button
                    className="btn btn-small"
                    onClick={() => handlePage(-1)}
                    disabled={offset === 0}
                  >
                    ← Anterior
                  </button>
                  <span className="page-info">
                    Página {currentPage} de {pageCount}
                  </span>
                  <button
                    className="btn btn-small"
                    onClick={() => handlePage(1)}
                    disabled={!hasNextPage}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              {gen1Loaded && (
                <p className="gen1-note">
                  Mostrando los 151 Pokémon originales. Usa la paginación o un
                  filtro para volver al modo normal.
                </p>
              )}
              {showFavoritesOnly && (
                <p className="gen1-note">
                  {favorites.length > 0
                    ? `Mostrando ${favorites.length} favoritos de esta vista.`
                    : 'Aún no tienes favoritos marcados.'}
                </p>
              )}
            </div>
          )}
        </main>
      )}

      {/* ---------- Modal de comparación ---------- */}
      {view === 'compare' && compareList.length === 2 && (
        <CompareModal
          left={compareList[0]}
          right={compareList[1]}
          onClose={() => setView('grid')}
        />
      )}
    </div>
  );
}

export default App;
