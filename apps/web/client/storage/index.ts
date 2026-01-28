/**
 * Client Storage Module
 * Gerencia persistência local usando localStorage e IndexedDB
 */

// Core storage hook
export { useLocalStorage } from './use-local-storage';

// Device identification
export { getDeviceId } from './device-id';

// Sync outbox (IndexedDB)
export {
  addOutboxChange,
  listOutboxChanges,
  removeOutboxChange,
  updateOutboxChangeStatus,
  getMeta,
  setMeta,
  clearAllSyncData,
  type OutboxChange,
  type SyncEntityType,
  type SyncChangeStatus,
} from './sync-outbox';

// Islands
export {
  type IslandId,
  type IslandNames,
  ISLAND_IDS,
  MAX_ISLANDS,
  DEFAULT_ISLAND_NAMES,
} from './islands';

export {
  loadIslandNames,
  saveIslandNames,
  loadIslandIds,
  saveIslandIds,
  getIslandLabel,
  ISLAND_NAMES_STORAGE_KEY,
  ISLAND_IDS_STORAGE_KEY,
} from './island-names';

export {
  loadIslandMeta,
  saveIslandMeta,
  DEFAULT_ISLAND_META,
  ISLAND_META_STORAGE_KEY,
  type IslandMeta,
} from './island-meta';

// Todos
export {
  loadSavedTodos,
  saveSavedTodos,
  isValidPhase,
  isValidIsland,
  phaseLabels,
  phaseOrder,
  TODOS_STORAGE_KEY,
  type SavedTodo,
  type MoonPhase,
} from './todos';

// Planet state
export {
  loadPlanetState,
  loadPlanetStateSync,
  savePlanetState,
  normalizePlanetState,
  hasCustomPlanetState,
  PLANET_STATE_STORAGE_KEY,
} from './planet-state';

export {
  loadPlanetStateMeta,
  savePlanetStateMeta,
  DEFAULT_PLANET_STATE_META,
  PLANET_STATE_META_KEY,
  type PlanetStateMeta,
} from './planet-state-meta';
