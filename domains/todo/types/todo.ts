/**
 * Tipos do domínio Todo - Temporário
 * 
 * Estes tipos serão migrados gradualmente
 * Remova os comentários conforme migra cada um
 */

export type IslandId =
  | 'terra'
  | 'agua'
  | 'ar'
  | 'fogo'
  | 'eter'
  | 'corpo'
  | 'mente'
  | 'espírito'
  | 'coração';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  islandId: IslandId;
  phaseDate: string;
  recordedAt: string;
  emotionalState?: string;
}

export interface SavedTodo extends TodoItem {
  userId: string;
  syncedAt?: string;
}

export type TodoStatusFilter = 'all' | 'completed' | 'open';
export type InputTypeFilter = 'all' | 'text' | 'checkbox';

// TODO: Mover validadores para services/validators.ts
export function isValidIsland(value: unknown): value is IslandId {
  const islands: IslandId[] = [
    'terra', 'agua', 'ar', 'fogo', 'eter',
    'corpo', 'mente', 'espírito', 'coração',
  ];
  return typeof value === 'string' && islands.includes(value as IslandId);
}

// Tipos de Ilhas
export type IslandNames = Record<IslandId, string>;
