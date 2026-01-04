'use client';

import {
  DEFAULT_PLANET_FILTERS,
  DEFAULT_PLANET_STATE,
  PLANET_FILTER_VIEWS,
  TODO_STATUS_FILTERS,
  type InputTypeFilter,
  type PlanetFiltersState,
  type PlanetUiState,
  type TodoStatusFilter,
} from '@/types/planetState';
import { ISLAND_IDS, type IslandId } from './islandNames';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const PLANET_STATE_STORAGE_KEY = 'flua_planet_state';

const isValidView = (value: unknown): value is PlanetFiltersState['view'] =>
  PLANET_FILTER_VIEWS.includes(value as PlanetFiltersState['view']);

const isValidInputTypeFilter = (value: unknown): value is InputTypeFilter =>
  value === 'all' || value === 'text' || value === 'checkbox';

const isValidTodoStatusFilter = (value: unknown): value is TodoStatusFilter =>
  TODO_STATUS_FILTERS.includes(value as TodoStatusFilter);

const isValidMoonPhase = (value: unknown): value is PlanetFiltersState['phase'] =>
  value === null ||
  value === 'luaNova' ||
  value === 'luaCrescente' ||
  value === 'luaCheia' ||
  value === 'luaMinguante';

const isValidIsland = (value: unknown): value is PlanetFiltersState['island'] => {
  if (value === null) return true;
  return ISLAND_IDS.includes(value as IslandId);
};

const normalizeNumber = (value: unknown, min: number, max: number): number | null => {
  if (!Number.isFinite(value)) return null;
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return null;
  if (numeric < min || numeric > max) return null;
  return numeric;
};

const normalizeFilters = (input: Partial<PlanetFiltersState> | null | undefined): PlanetFiltersState => {
  const raw = input ?? {};

  return {
    view: isValidView(raw.view) ? raw.view : DEFAULT_PLANET_FILTERS.view,
    inputType: isValidInputTypeFilter(raw.inputType) ? raw.inputType : DEFAULT_PLANET_FILTERS.inputType,
    todoStatus: isValidTodoStatusFilter(raw.todoStatus)
      ? raw.todoStatus
      : DEFAULT_PLANET_FILTERS.todoStatus,
    phase: isValidMoonPhase(raw.phase) ? raw.phase : DEFAULT_PLANET_FILTERS.phase,
    island: isValidIsland(raw.island) ? raw.island : DEFAULT_PLANET_FILTERS.island,
    month: normalizeNumber(raw.month, 1, 12),
    year: normalizeNumber(raw.year, 1900, 2200),
  };
};

export const normalizePlanetState = (input: unknown): PlanetUiState => {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PLANET_STATE };
  }

  const raw = input as Record<string, unknown>;

  return {
    filters: normalizeFilters(raw.filters as PlanetFiltersState),
    showIslands: Boolean(raw.showIslands),
    isFiltersPanelOpen: Boolean(raw.isFiltersPanelOpen),
  };
};

export const hasCustomPlanetState = (state: PlanetUiState): boolean => {
  const filters = state.filters;
  const defaults = DEFAULT_PLANET_FILTERS;

  return (
    state.showIslands ||
    state.isFiltersPanelOpen ||
    filters.view !== defaults.view ||
    filters.inputType !== defaults.inputType ||
    filters.todoStatus !== defaults.todoStatus ||
    filters.phase !== defaults.phase ||
    filters.island !== defaults.island ||
    filters.month !== defaults.month ||
    filters.year !== defaults.year
  );
};

export const loadPlanetState = (): PlanetUiState => {
  const { getValue } = useLocalStorage<PlanetUiState>(PLANET_STATE_STORAGE_KEY, DEFAULT_PLANET_STATE);
  const parsed = getValue();
  return normalizePlanetState(parsed);
};

export const savePlanetState = (state: PlanetUiState) => {
  const { setValue } = useLocalStorage<PlanetUiState>(PLANET_STATE_STORAGE_KEY, DEFAULT_PLANET_STATE);
  setValue(state);
};
