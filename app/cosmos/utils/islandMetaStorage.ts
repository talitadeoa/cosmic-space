'use client';

import type { IslandId } from '@/client/storage';

export type IslandMeta = Record<
  IslandId,
  {
    version: number | null;
    updatedAt: string | null;
    deletedAt: string | null;
  }
>;

const ISLAND_META_KEY = 'flua_island_meta';

const defaultMeta = (): IslandMeta => ({
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

export const loadIslandMeta = (): IslandMeta => {
  if (typeof window === 'undefined') return defaultMeta();
  try {
    const stored = window.localStorage.getItem(ISLAND_META_KEY);
    if (!stored) return defaultMeta();
    const parsed = JSON.parse(stored) as Partial<IslandMeta>;
    const base = defaultMeta();
    (Object.keys(base) as IslandId[]).forEach((id) => {
      const meta = parsed[id];
      base[id] = {
        version: Number.isFinite(meta?.version) ? Number(meta?.version) : null,
        updatedAt: typeof meta?.updatedAt === 'string' ? meta?.updatedAt : null,
        deletedAt: typeof meta?.deletedAt === 'string' ? meta?.deletedAt : null,
      };
    });
    return base;
  } catch {
    return defaultMeta();
  }
};

export const saveIslandMeta = (meta: IslandMeta) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ISLAND_META_KEY, JSON.stringify(meta));
};
