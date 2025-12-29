'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';

export type IslandId = 'ilha1' | 'ilha2' | 'ilha3' | 'ilha4';
export type IslandNames = Record<IslandId, string>;

export const ISLAND_IDS: IslandId[] = ['ilha1', 'ilha2', 'ilha3', 'ilha4'];

export const DEFAULT_ISLAND_NAMES: IslandNames = {
  ilha1: 'Ilha 1',
  ilha2: 'Ilha 2',
  ilha3: 'Ilha 3',
  ilha4: 'Ilha 4',
};

export const ISLAND_NAMES_STORAGE_KEY = 'flua_island_names';

const sanitizeIslandName = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

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

export const saveIslandNames = (names: IslandNames) => {
  const { setValue } = useLocalStorage(ISLAND_NAMES_STORAGE_KEY, DEFAULT_ISLAND_NAMES);
  setValue(names);
};

export const getIslandLabel = (
  islandId: IslandId | null | undefined,
  names?: IslandNames
): string | null => {
  if (!islandId) return null;
  return (names ?? DEFAULT_ISLAND_NAMES)[islandId] ?? DEFAULT_ISLAND_NAMES[islandId];
};
