'use client';

import type { TodoItem as ParsedTodoItem } from '../components/TodoInput';
import type { TodoInputType } from '@/types/inputs';
import { MOON_PHASE_LABELS, MOON_PHASES, type MoonPhase } from './moonPhases';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type { MoonPhase } from './moonPhases';
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

export type SavedTodo = ParsedTodoItem & {
  phase?: MoonPhase;
  islandId?: IslandId;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  version?: number | null;
};

export const TODO_STORAGE_KEY = 'flua_todos_salvos';

export const phaseLabels: Record<MoonPhase, string> = MOON_PHASE_LABELS;
export const phaseOrder: MoonPhase[] = [...MOON_PHASES];

export const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === 'luaNova' ||
  phase === 'luaCrescente' ||
  phase === 'luaCheia' ||
  phase === 'luaMinguante';
export const isValidIsland = (island: unknown): island is IslandId =>
  island === 'ilha1' ||
  island === 'ilha2' ||
  island === 'ilha3' ||
  island === 'ilha4' ||
  island === 'ilha5' ||
  island === 'ilha6' ||
  island === 'ilha7' ||
  island === 'ilha8' ||
  island === 'ilha9' ||
  island === 'ilha10';
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
  };
};

export function loadSavedTodos(): SavedTodo[] {
  const { getValue } = useLocalStorage<SavedTodo[]>(TODO_STORAGE_KEY, []);
  const parsed = getValue();

  return Array.isArray(parsed)
    ? parsed
        .map(normalizeStoredTodo)
        .filter((item) => item.text.trim().length > 0 && !item.deletedAt)
    : [];
}

export function saveSavedTodos(todos: SavedTodo[]) {
  const { setValue } = useLocalStorage<SavedTodo[]>(TODO_STORAGE_KEY, []);
  setValue(todos);
}
