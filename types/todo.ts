/**
 * 📝 Todo Types - Centralizados
 */

import type { MoonPhase } from './moon';
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
 * Todo item básico (do input)
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  inputType: TodoInputType;
  category?: string;
  dueDate?: string;
}

/**
 * Todo salvo com metadados adicionais
 */
export interface SavedTodo extends TodoItem {
  phase?: MoonPhase;
  islandId?: IslandId;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  version?: number | null;
}

/**
 * Type guards
 */
export function isValidIsland(value: unknown): value is IslandId {
  return (
    typeof value === 'string' &&
    /^ilha([1-9]|10)$/.test(value)
  );
}

export function isValidTodoInputType(value: unknown): value is TodoInputType {
  return value === 'text' || value === 'checkbox';
}

/**
 * Constantes
 */
export const TODO_STORAGE_KEY = 'flua_todos_salvos';

export const ISLAND_IDS: IslandId[] = [
  'ilha1',
  'ilha2',
  'ilha3',
  'ilha4',
  'ilha5',
  'ilha6',
  'ilha7',
  'ilha8',
  'ilha9',
  'ilha10',
];
