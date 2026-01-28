'use client';

import { useLocalStorage } from './use-local-storage';

export type PlanetStateMeta = {
  version: number | null;
  updatedAt: string | null;
};

export const PLANET_STATE_META_KEY = 'flua_planet_state_meta';

const defaultMeta: PlanetStateMeta = {
  version: null,
  updatedAt: null,
};

export const DEFAULT_PLANET_STATE_META: PlanetStateMeta = defaultMeta;

/**
 * Carrega metadados do estado do planeta do localStorage.
 */
export const loadPlanetStateMeta = (): PlanetStateMeta => {
  const { getValue } = useLocalStorage<PlanetStateMeta>(PLANET_STATE_META_KEY, defaultMeta);
  const parsed = getValue();

  if (!parsed || typeof parsed !== 'object') {
    return { ...defaultMeta };
  }

  return {
    version: Number.isFinite(parsed.version) ? parsed.version : null,
    updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
  };
};

/**
 * Salva metadados do estado do planeta no localStorage.
 */
export const savePlanetStateMeta = (meta: PlanetStateMeta): void => {
  const { setValue } = useLocalStorage<PlanetStateMeta>(PLANET_STATE_META_KEY, defaultMeta);
  setValue(meta);
};
