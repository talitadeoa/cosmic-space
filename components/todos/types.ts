/**
 * 🎯 Todo Panel Types
 * 
 * Tipos e interfaces para o SavedTodosPanel refatorado
 */

import type { SavedTodo, IslandId, MoonPhase } from '@/types';

/**
 * Tipos de view disponíveis
 */
export type TodoView = 'todos' | 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo';

/**
 * Filtros de tipo de input
 */
export type InputTypeFilter = 'all' | 'text' | 'checkbox';

/**
 * Filtros de status do todo
 */
export type TodoStatusFilter = 'all' | 'completed' | 'open';

/**
 * State do painel de todos (para useReducer)
 */
export interface TodoPanelState {
  // Edição
  isEditMode: boolean;
  editingTodoId: string | null;
  editingText: string;
  editingCategory: string;
  editingDueDate: string;
  
  // Seleção em batch
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  batchIsland: IslandId | '';
  
  // UI
  swipeDeleteId: string | null;
  currentPage: number;
  activeViewDrop: string | null;
}

/**
 * Ações do reducer
 */
export type TodoPanelAction =
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'START_EDITING'; payload: { todoId: string; text: string; category?: string; dueDate?: string } }
  | { type: 'UPDATE_EDITING'; payload: Partial<{ text: string; category: string; dueDate: string }> }
  | { type: 'CANCEL_EDITING' }
  | { type: 'SET_SELECTION_MODE'; payload: boolean }
  | { type: 'TOGGLE_SELECT'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_BATCH_ISLAND'; payload: IslandId | '' }
  | { type: 'SET_SWIPE_DELETE'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_VIEW_DROP'; payload: string | null }
  | { type: 'RESET' };

/**
 * Props para subcomponentes
 */
export interface TodoFiltersProps {
  inputTypeFilter: InputTypeFilter;
  todoStatusFilter: TodoStatusFilter;
  onInputTypeFilterChange?: (filter: InputTypeFilter) => void;
  onTodoStatusFilterChange?: (filter: TodoStatusFilter) => void;
}

export interface TodoListItemProps {
  todo: SavedTodo;
  isSelected: boolean;
  isEditing: boolean;
  editingText: string;
  isSelectionMode: boolean;
  onToggleComplete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onStartEdit: (todo: SavedTodo) => void;
  onUpdateEdit: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete?: (id: string) => void;
  onDragStart: (id: string) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export interface TodoBatchActionsProps {
  selectedCount: number;
  islandIds?: IslandId[];
  batchIsland: IslandId | '';
  onBatchIslandChange: (island: IslandId | '') => void;
  onBatchDelete?: () => void;
  onBatchAssignPhase?: (phase: MoonPhase) => void;
  onBatchAssignIsland?: (island: IslandId) => void;
  onClearSelection: () => void;
}

/**
 * Constantes
 */
export const ITEMS_PER_PAGE = 20;

export const VIEW_LABELS: Record<TodoView, string> = {
  'todos': 'Todos',
  'em-aberto': 'Em aberto',
  'lua-atual': 'Lua atual',
  'proxima-fase': 'Próxima fase',
  'proximo-ciclo': 'Próximo ciclo',
};
