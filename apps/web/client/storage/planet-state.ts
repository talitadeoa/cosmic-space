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
import { type IslandId, ISLAND_IDS } from './islands';
import { useLocalStorage } from './use-local-storage';

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
    category: raw.category === 'Principal' || raw.category === 'Secundária' ? raw.category : 'all',
    phase: isValidMoonPhase(raw.phase) ? raw.phase : DEFAULT_PLANET_FILTERS.phase,
    island: isValidIsland(raw.island) ? raw.island : DEFAULT_PLANET_FILTERS.island,
    month: normalizeNumber(raw.month, 1, 12),
    year: normalizeNumber(raw.year, 1900, 2200),
  };
};

/**
 * Normaliza e valida estado do planeta vindo do localStorage.
 */
export const normalizePlanetState = (input: unknown): PlanetUiState => {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PLANET_STATE };
  }

  const raw = input as Partial<PlanetUiState>;

  return {
    filters: normalizeFilters(raw.filters),
    showIslands: typeof raw.showIslands === 'boolean' ? raw.showIslands : DEFAULT_PLANET_STATE.showIslands,
    isFiltersPanelOpen:
      typeof raw.isFiltersPanelOpen === 'boolean'
        ? raw.isFiltersPanelOpen
        : DEFAULT_PLANET_STATE.isFiltersPanelOpen,
  };
};

/**
 * Verifica se o estado do planeta tem customizações.
 */
export const hasCustomPlanetState = (state: PlanetUiState): boolean => {
  const filters = state.filters;
  const defaults = DEFAULT_PLANET_FILTERS;

  return (
    state.showIslands ||
    state.isFiltersPanelOpen ||
    filters.view !== defaults.view ||
    filters.inputType !== defaults.inputType ||
    filters.todoStatus !== defaults.todoStatus ||
    filters.category !== defaults.category ||
    filters.phase !== defaults.phase ||
    filters.island !== defaults.island ||
    filters.month !== defaults.month ||
    filters.year !== defaults.year
  );
};

/**
 * Carrega o estado do planeta usando hook de localStorage.
 */
export const loadPlanetState = (): PlanetUiState => {
  const { getValue } = useLocalStorage<PlanetUiState>(PLANET_STATE_STORAGE_KEY, DEFAULT_PLANET_STATE);
  const parsed = getValue();
  return normalizePlanetState(parsed);
};

/**
 * Carrega o estado do planeta diretamente do localStorage sem usar hooks.
 * Use isto para inicialização do estado, não para sincronização reativa.
 */
export const loadPlanetStateSync = (): PlanetUiState => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PLANET_STATE };
  }

  try {
    const stored = window.localStorage.getItem(PLANET_STATE_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PLANET_STATE };
    const parsed = JSON.parse(stored);
    return normalizePlanetState(parsed);
  } catch (error) {
    console.warn('Erro ao carregar estado do Planeta do localStorage:', error);
    return { ...DEFAULT_PLANET_STATE };
  }
};

/**
 * Salva o estado do planeta no localStorage.
 */
export const savePlanetState = (state: PlanetUiState): void => {
  // Não persistir 'view' no localStorage - é apenas estado de UI transitório
  const { filters, ...rest } = state;
  const stateToSave: PlanetUiState = {
    ...rest,
    filters: {
      ...filters,
      view: 'todos' as const, // Sempre salvar como 'todos' para não persistir a view entre sessões
    },
  };
  const { setValue } = useLocalStorage<PlanetUiState>(PLANET_STATE_STORAGE_KEY, DEFAULT_PLANET_STATE);
  setValue(stateToSave);
};
