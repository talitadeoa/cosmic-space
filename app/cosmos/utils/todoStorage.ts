'use client';

import type { TodoItem as ParsedTodoItem } from '../components/TodoInput';
import type { TodoInputType } from '@/types/inputs';
import { MOON_PHASE_LABELS, MOON_PHASES, type MoonPhase } from './moonPhases';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type { MoonPhase } from './moonPhases';
export type IslandId = 'ilha1' | 'ilha2' | 'ilha3' | 'ilha4';

export type SavedTodo = ParsedTodoItem & {
  phase?: MoonPhase;
  islandId?: IslandId;
  createdAt?: string;
};

export const TODO_STORAGE_KEY = 'cosmic_space_todos_salvos';

export const phaseLabels: Record<MoonPhase, string> = MOON_PHASE_LABELS;
export const phaseOrder: MoonPhase[] = [...MOON_PHASES];

const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === 'luaNova' ||
  phase === 'luaCrescente' ||
  phase === 'luaCheia' ||
  phase === 'luaMinguante';
const isValidIsland = (island: unknown): island is IslandId =>
  island === 'ilha1' || island === 'ilha2' || island === 'ilha3' || island === 'ilha4';
const isValidInputType = (inputType: unknown): inputType is TodoInputType =>
  inputType === 'text' || inputType === 'checkbox';

const normalizeStoredTodo = (item: SavedTodo, idx: number): SavedTodo => {
  const inputType = isValidInputType(item.inputType) ? item.inputType : 'checkbox';

  return {
    id: typeof item.id === 'string' ? item.id : `todo-${idx}`,
    text: typeof item.text === 'string' ? item.text : '',
    completed: inputType === 'checkbox' ? Boolean(item.completed) : false,
    depth: Number.isFinite(item.depth) ? Number(item.depth) : 0,
    inputType,
    islandId: isValidIsland(item.islandId) ? item.islandId : undefined,
    phase: isValidPhase(item.phase) ? item.phase : undefined,
  };
};

export function loadSavedTodos(): SavedTodo[] {
  const { getValue } = useLocalStorage<SavedTodo[]>(TODO_STORAGE_KEY, []);
  const parsed = getValue();

  return Array.isArray(parsed)
    ? parsed.map(normalizeStoredTodo).filter((item) => item.text.trim().length > 0)
    : [];
}

export function saveSavedTodos(todos: SavedTodo[]) {
  const { setValue } = useLocalStorage<SavedTodo[]>(TODO_STORAGE_KEY, []);
  setValue(todos);
}
