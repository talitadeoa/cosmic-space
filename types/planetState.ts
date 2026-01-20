import type { MoonPhase } from '@/types/moon';
import type { IslandId } from '@/lib/islands';
import type { TodoInputType } from '@/types/inputs';

export const PLANET_FILTER_VIEWS = [
  'todos',
  'em-aberto',
  'lua-atual',
  'proxima-fase',
  'proximo-ciclo',
] as const;

export type PlanetView = (typeof PLANET_FILTER_VIEWS)[number];

export type InputTypeFilter = 'all' | TodoInputType;

export const TODO_STATUS_FILTERS = ['all', 'completed', 'open'] as const;

export type TodoStatusFilter = (typeof TODO_STATUS_FILTERS)[number];

export type CategoryFilter = 'all' | 'Principal' | 'Secundária';

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

export type PlanetUiState = {
  filters: PlanetFiltersState;
  showIslands: boolean;
  isFiltersPanelOpen: boolean;
};

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

export const DEFAULT_PLANET_STATE: PlanetUiState = {
  filters: DEFAULT_PLANET_FILTERS,
  showIslands: false,
  isFiltersPanelOpen: false,
};
