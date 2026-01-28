/**
 * @deprecated Importe de @/shared/types ou @/client/storage em vez de @/types/todo
 * Este arquivo será removido em versões futuras.
 */

// Re-export do domain lunar-cycle
export type { MoonPhase } from '@/domains/lunar-cycle/types/moon';

// Re-export de shared/types para inputs
export type { TodoInputType } from '@/shared/types/inputs';

/**
 * ID único de ilha
 * @deprecated Use import de @/client/storage
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
 * @deprecated Use import de @/client/storage
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  inputType: 'text' | 'checkbox';
  category?: string;
  dueDate?: string;
  parentId?: string | null;
}

/**
 * Tipo de ciclo para a fase lunar
 */
export type PhaseCycleType = null | 'current' | 'next';

/**
 * Todo salvo com metadados adicionais
 * @deprecated Use import de @/client/storage
 */
export interface SavedTodo extends TodoItem {
  phase?: import('@/domains/lunar-cycle/types/moon').MoonPhase;
  phaseCycle?: PhaseCycleType;
  phaseDeadline?: string;
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

