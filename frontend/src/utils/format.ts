// ============================================================
// Utilidades de formato para la UI.
// ============================================================

/** Capitaliza la primera letra de una cadena. */
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/** Formatea un ID como número de Pokédex (ej. 25 -> #025). */
export const formatId = (id: number): string =>
  `#${String(id).padStart(3, '0')}`;
