'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';

export type IslandId =
  | 'ilha1'
  | 'ilha2'
  | 'ilha3'
  | 'ilha4'
  | 'ilha5'
  | 'ilha6'
  | 'ilha7'
  | 'ilha8'
  | 'ilha9'
  | 'ilha10';
export type IslandNames = Record<IslandId, string>;

export const ISLAND_IDS: IslandId[] = [
  'ilha1',
  'ilha2',
  'ilha3',
  'ilha4',
  'ilha5',
  'ilha6',
  'ilha7',
  'ilha8',
  'ilha9',
  'ilha10',
];

export const MAX_ISLANDS = ISLAND_IDS.length;

export const DEFAULT_ISLAND_NAMES: IslandNames = {
  ilha1: 'Ilha 1',
  ilha2: 'Ilha 2',
  ilha3: 'Ilha 3',
  ilha4: 'Ilha 4',
  ilha5: 'Ilha 5',
  ilha6: 'Ilha 6',
  ilha7: 'Ilha 7',
  ilha8: 'Ilha 8',
  ilha9: 'Ilha 9',
  ilha10: 'Ilha 10',
};

export const ISLAND_NAMES_STORAGE_KEY = 'flua_island_names';
export const ISLAND_IDS_STORAGE_KEY = 'flua_island_ids';

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

const normalizeIslandIds = (value: unknown): IslandId[] => {
  if (!Array.isArray(value)) return ['ilha1'];
  const ids = value.filter((item): item is IslandId => ISLAND_IDS.includes(item as IslandId));
  const unique = Array.from(new Set(ids));
  return unique.length > 0 ? unique : ['ilha1'];
};

export const loadIslandIds = (): IslandId[] => {
  const { getValue } = useLocalStorage<IslandId[]>(ISLAND_IDS_STORAGE_KEY, ['ilha1']);
  const parsed = getValue();
  return normalizeIslandIds(parsed);
};

export const saveIslandIds = (ids: IslandId[]) => {
  const { setValue } = useLocalStorage<IslandId[]>(ISLAND_IDS_STORAGE_KEY, ['ilha1']);
  setValue(ids);
};

export const getIslandLabel = (
  islandId: IslandId | null | undefined,
  names?: IslandNames
): string | null => {
  if (!islandId) return null;
  return (names ?? DEFAULT_ISLAND_NAMES)[islandId] ?? DEFAULT_ISLAND_NAMES[islandId];
};
