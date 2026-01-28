/**
 * 🪐 Planet State Types
 * @module shared/types/planetState
 *
 * Tipos para o estado do planeta e filtros de visualização.
 * Usados tanto no client quanto no server para sincronização.
 */

import type { MoonPhase } from '@/domains/lunar-cycle/types/moon';
import type { TodoInputType } from './inputs';

/**
 * ID único de ilha
 */
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

/**
 * Visualizações disponíveis no filtro do planeta
 */
export const PLANET_FILTER_VIEWS = [
  'todos',
  'em-aberto',
  'lua-atual',
  'proxima-fase',
  'proximo-ciclo',
] as const;

export type PlanetView = (typeof PLANET_FILTER_VIEWS)[number];

/**
 * Filtro de tipo de input
 */
export type InputTypeFilter = 'all' | TodoInputType;

/**
 * Filtros de status de tarefa
 */
export const TODO_STATUS_FILTERS = ['all', 'completed', 'open'] as const;

export type TodoStatusFilter = (typeof TODO_STATUS_FILTERS)[number];

/**
 * Filtro de categoria
 */
export type CategoryFilter = 'all' | 'Principal' | 'Secundária';

/**
 * Estado dos filtros do planeta
 */
export type PlanetFiltersState = {
  view: PlanetView;
  inputType: InputTypeFilter;
  todoStatus: TodoStatusFilter;
  category: CategoryFilter;
  phase: MoonPhase | null;
  island: IslandId | null;
  month: number | null;
  year: number | null;
};

/**
 * Estado completo da UI do planeta
 */
export type PlanetUiState = {
  filters: PlanetFiltersState;
  showIslands: boolean;
  isFiltersPanelOpen: boolean;
};

/**
 * Valores padrão para os filtros
 */
export const DEFAULT_PLANET_FILTERS: PlanetFiltersState = {
  view: 'todos',
  inputType: 'all',
  todoStatus: 'open',
  category: 'all',
  phase: null,
  island: null,
  month: null,
  year: null,
};

/**
 * Estado padrão do planeta
 */
export const DEFAULT_PLANET_STATE: PlanetUiState = {
  filters: DEFAULT_PLANET_FILTERS,
  showIslands: false,
  isFiltersPanelOpen: false,
};
