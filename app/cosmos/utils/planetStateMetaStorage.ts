'use client';

type PlanetStateMeta = {
  version: number | null;
  updatedAt: string | null;
};

const PLANET_STATE_META_KEY = 'flua_planet_state_meta';

const defaultMeta: PlanetStateMeta = {
  version: null,
  updatedAt: null,
};

export const loadPlanetStateMeta = (): PlanetStateMeta => {
  if (typeof window === 'undefined') return { ...defaultMeta };
  try {
    const stored = window.localStorage.getItem(PLANET_STATE_META_KEY);
    if (!stored) return { ...defaultMeta };
    const parsed = JSON.parse(stored) as PlanetStateMeta;
    return {
      version: Number.isFinite(parsed.version) ? parsed.version : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return { ...defaultMeta };
  }
};

export const savePlanetStateMeta = (meta: PlanetStateMeta) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLANET_STATE_META_KEY, JSON.stringify(meta));
};
