import 'server-only';
import { getDb } from './db';
import { logger } from './logger';
import { validators } from './validators';
import {
  DEFAULT_PLANET_FILTERS,
  DEFAULT_PLANET_STATE,
  PLANET_FILTER_VIEWS,
  TODO_STATUS_FILTERS,
  type PlanetFiltersState,
  type PlanetUiState,
} from '@/types/planetState';

const isValidView = (value: unknown): value is PlanetFiltersState['view'] =>
  PLANET_FILTER_VIEWS.includes(value as PlanetFiltersState['view']);

const isValidInputTypeFilter = (value: unknown): value is PlanetFiltersState['inputType'] =>
  value === 'all' || validators.todoInputType(value);

const isValidTodoStatusFilter = (value: unknown): value is PlanetFiltersState['todoStatus'] =>
  TODO_STATUS_FILTERS.includes(value as PlanetFiltersState['todoStatus']);

const isValidMonth = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;

const isValidYear = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 1900 && Number(value) <= 2200;

const normalizeFilters = (input: Partial<PlanetFiltersState> | null | undefined): PlanetFiltersState => {
  const raw = input ?? {};

  return {
    view: isValidView(raw.view) ? raw.view : DEFAULT_PLANET_FILTERS.view,
    inputType: isValidInputTypeFilter(raw.inputType) ? raw.inputType : DEFAULT_PLANET_FILTERS.inputType,
    todoStatus: isValidTodoStatusFilter(raw.todoStatus)
      ? raw.todoStatus
      : DEFAULT_PLANET_FILTERS.todoStatus,
    phase: validators.moonPhase(raw.phase) ? raw.phase : DEFAULT_PLANET_FILTERS.phase,
    island: validators.islandId(raw.island) ? raw.island : DEFAULT_PLANET_FILTERS.island,
    month: isValidMonth(raw.month) ? Number(raw.month) : DEFAULT_PLANET_FILTERS.month,
    year: isValidYear(raw.year) ? Number(raw.year) : DEFAULT_PLANET_FILTERS.year,
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

export async function getPlanetState(userId: string | number): Promise<PlanetUiState | null> {
  try {
    const db = getDb();
    const rows = (await db`
      SELECT payload
      FROM planet_state
      WHERE user_id = ${userId}
      LIMIT 1
    `) as any[];

    if (!rows.length) return null;
    const payload = rows[0]?.payload ?? null;
    return normalizePlanetState(payload);
  } catch (error) {
    logger.error('Erro ao buscar estado do Planeta', error);
    throw error;
  }
}

export async function savePlanetState(
  userId: string | number,
  state: PlanetUiState
): Promise<PlanetUiState> {
  try {
    const db = getDb();
    const payload = normalizePlanetState(state);

    const rows = (await db`
      INSERT INTO planet_state (user_id, payload)
      VALUES (${userId}, ${payload})
      ON CONFLICT (user_id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      RETURNING payload
    `) as any[];

    return normalizePlanetState(rows[0]?.payload ?? payload);
  } catch (error) {
    logger.error('Erro ao salvar estado do Planeta', error);
    throw error;
  }
}
