/**
 * 📝 Todo Types - Centralizados
 */

import type { MoonPhase } from './moon';
import type { TodoInputType } from './inputs';

export type { MoonPhase };

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
 * Tipo de ciclo para a fase lunar
 * - null: Sem prazo definido (apenas a fase)
 * - 'current': Lua atual (mês atual)
 * - 'next': Próximo ciclo (próximo mês)
 */
export type PhaseCycleType = null | 'current' | 'next';

/**
 * Todo salvo com metadados adicionais
 */
export interface SavedTodo extends TodoItem {
  phase?: MoonPhase;
  phaseCycle?: PhaseCycleType; // Quando a fase é aplicada: mês atual, próximo, ou sem prazo
  phaseDeadline?: string; // Data específica da fase (ISO 8601) - opcional
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

export function isValidPhaseCycle(value: unknown): value is PhaseCycleType {
  return value === null || value === 'current' || value === 'next';
}

// isValidTodoInputType está em ./inputs.ts - usar de lá para evitar duplicação

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
