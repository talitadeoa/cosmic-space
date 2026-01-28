'use client';

import type { TodoItem as ParsedTodoItem } from '@/app/cosmos/planeta/salvos/TodoInput';
import type { TodoInputType } from '@/types/inputs';
import { MOON_PHASE_LABELS, MOON_PHASES, type MoonPhase } from '@/types/moon';
import { useLocalStorage } from './use-local-storage';
import { type IslandId, ISLAND_IDS } from './islands';

export type { MoonPhase } from '@/types/moon';
export type { IslandId } from './islands';

export type SavedTodo = ParsedTodoItem & {
  phase?: MoonPhase;
  islandId?: IslandId;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  version?: number | null;
  parentId?: string | null;
};

export const TODOS_STORAGE_KEY = 'flua_todos_salvos';

export const phaseLabels: Record<MoonPhase, string> = MOON_PHASE_LABELS;
export const phaseOrder: MoonPhase[] = [...MOON_PHASES];

export const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === 'luaNova' ||
  phase === 'luaCrescente' ||
  phase === 'luaCheia' ||
  phase === 'luaMinguante';

export const isValidIsland = (island: unknown): island is IslandId =>
  ISLAND_IDS.includes(island as IslandId);

const isValidInputType = (inputType: unknown): inputType is TodoInputType =>
  inputType === 'text' || inputType === 'checkbox';

const normalizeTimestamp = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return undefined;
};

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return undefined;
};

const normalizeStoredTodo = (item: SavedTodo, idx: number): SavedTodo => {
  const inputType = isValidInputType(item.inputType) ? item.inputType : 'checkbox';
  const createdAt = normalizeTimestamp(item.createdAt);
  const updatedAt = normalizeTimestamp(item.updatedAt ?? item.createdAt);
  const deletedAt = normalizeTimestamp(item.deletedAt ?? undefined);
  const version = Number.isFinite(item.version) ? Number(item.version) : null;
  const category = normalizeText(item.category);
  const dueDate = normalizeText(item.dueDate);
  const parentId = normalizeText(item.parentId);

  return {
    id: typeof item.id === 'string' ? item.id : `todo-${idx}`,
    text: typeof item.text === 'string' ? item.text : '',
    completed: inputType === 'checkbox' ? Boolean(item.completed) : false,
    depth: Number.isFinite(item.depth) ? Number(item.depth) : 0,
    inputType,
    category,
    dueDate,
    islandId: isValidIsland(item.islandId) ? item.islandId : undefined,
    phase: isValidPhase(item.phase) ? item.phase : undefined,
    createdAt,
    updatedAt,
    deletedAt: deletedAt ?? null,
    version,
    parentId: parentId ?? null,
  };
};

/**
 * Carrega todos os todos do localStorage.
 */
export function loadSavedTodos(): SavedTodo[] {
  const { getValue } = useLocalStorage<SavedTodo[]>(TODOS_STORAGE_KEY, []);
  const parsed = getValue();

  return Array.isArray(parsed)
    ? parsed
        .map(normalizeStoredTodo)
        .filter((item) => item.text.trim().length > 0 && !item.deletedAt)
    : [];
}

/**
 * Salva todos os todos no localStorage.
 */
export function saveSavedTodos(todos: SavedTodo[]): void {
  const { setValue } = useLocalStorage<SavedTodo[]>(TODOS_STORAGE_KEY, []);
  setValue(todos);
}
