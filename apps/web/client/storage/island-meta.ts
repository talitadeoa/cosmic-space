'use client';

import { useLocalStorage } from './use-local-storage';
import { type IslandId, ISLAND_IDS } from './islands';

export type IslandMeta = Record<
  IslandId,
  {
    version: number | null;
    updatedAt: string | null;
    deletedAt: string | null;
  }
>;

export const ISLAND_META_STORAGE_KEY = 'flua_island_meta';

const createDefaultMeta = (): IslandMeta => ({
  ilha1: { version: null, updatedAt: null, deletedAt: null },
  ilha2: { version: null, updatedAt: null, deletedAt: null },
  ilha3: { version: null, updatedAt: null, deletedAt: null },
  ilha4: { version: null, updatedAt: null, deletedAt: null },
  ilha5: { version: null, updatedAt: null, deletedAt: null },
  ilha6: { version: null, updatedAt: null, deletedAt: null },
  ilha7: { version: null, updatedAt: null, deletedAt: null },
  ilha8: { version: null, updatedAt: null, deletedAt: null },
  ilha9: { version: null, updatedAt: null, deletedAt: null },
  ilha10: { version: null, updatedAt: null, deletedAt: null },
});

export const DEFAULT_ISLAND_META: IslandMeta = createDefaultMeta();

/**
 * Carrega metadados de todas as ilhas do localStorage.
 */
export const loadIslandMeta = (): IslandMeta => {
  const { getValue } = useLocalStorage<IslandMeta>(ISLAND_META_STORAGE_KEY, DEFAULT_ISLAND_META);
  const parsed = getValue();

  if (!parsed || typeof parsed !== 'object') {
    return createDefaultMeta();
  }

  const base = createDefaultMeta();
  (Object.keys(base) as IslandId[]).forEach((id) => {
    const meta = parsed[id];
    base[id] = {
      version: Number.isFinite(meta?.version) ? Number(meta?.version) : null,
      updatedAt: typeof meta?.updatedAt === 'string' ? meta?.updatedAt : null,
      deletedAt: typeof meta?.deletedAt === 'string' ? meta?.deletedAt : null,
    };
  });

  return base;
};

/**
 * Salva metadados de todas as ilhas no localStorage.
 */
export const saveIslandMeta = (meta: IslandMeta): void => {
  const { setValue } = useLocalStorage<IslandMeta>(ISLAND_META_STORAGE_KEY, DEFAULT_ISLAND_META);
  setValue(meta);
};
