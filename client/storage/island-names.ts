'use client';

import { useLocalStorage } from './use-local-storage';
import { type IslandId, type IslandNames, DEFAULT_ISLAND_NAMES, ISLAND_IDS } from './islands';

export const ISLAND_NAMES_STORAGE_KEY = 'flua_island_names';
export const ISLAND_IDS_STORAGE_KEY = 'flua_island_ids';

const sanitizeIslandName = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeIslandIds = (value: unknown): IslandId[] => {
  if (!Array.isArray(value)) return ['ilha1'];
  const ids = value.filter((item): item is IslandId => ISLAND_IDS.includes(item as IslandId));
  const unique = Array.from(new Set(ids));
  return unique.length > 0 ? unique : ['ilha1'];
};

/**
 * Carrega os nomes das ilhas do localStorage.
 */
export const loadIslandNames = (): IslandNames => {
  const { getValue } = useLocalStorage(ISLAND_NAMES_STORAGE_KEY, DEFAULT_ISLAND_NAMES);
  const parsed = getValue();

  if (!parsed || typeof parsed !== 'object') {
    return { ...DEFAULT_ISLAND_NAMES };
  }

  const nextNames: IslandNames = { ...DEFAULT_ISLAND_NAMES };
  ISLAND_IDS.forEach((islandId) => {
    nextNames[islandId] = sanitizeIslandName(
      (parsed as Record<string, unknown>)[islandId],
      nextNames[islandId]
    );
  });

  return nextNames;
};

/**
 * Salva os nomes das ilhas no localStorage.
 */
export const saveIslandNames = (names: IslandNames): void => {
  const { setValue } = useLocalStorage(ISLAND_NAMES_STORAGE_KEY, DEFAULT_ISLAND_NAMES);
  setValue(names);
};

/**
 * Carrega os IDs das ilhas ativas do localStorage.
 */
export const loadIslandIds = (): IslandId[] => {
  const { getValue } = useLocalStorage<IslandId[]>(ISLAND_IDS_STORAGE_KEY, ['ilha1']);
  const parsed = getValue();
  return normalizeIslandIds(parsed);
};

/**
 * Salva os IDs das ilhas ativas no localStorage.
 */
export const saveIslandIds = (ids: IslandId[]): void => {
  const { setValue } = useLocalStorage<IslandId[]>(ISLAND_IDS_STORAGE_KEY, ['ilha1']);
  setValue(ids);
};

/**
 * Obtém o label de uma ilha pelo ID.
 */
export const getIslandLabel = (
  islandId: IslandId | null | undefined,
  names?: IslandNames
): string | null => {
  if (!islandId) return null;
  return (names ?? DEFAULT_ISLAND_NAMES)[islandId] ?? DEFAULT_ISLAND_NAMES[islandId];
};
