/**
 * 🎯 Todo Panel Types
 * 
 * Tipos e interfaces para o SavedTodosPanel refatorado.
 * Props agrupadas por domínio para reduzir prop drilling.
 */

import type { SavedTodo, IslandId, MoonPhase } from '@/app/cosmos/utils/todoStorage';
import type { IslandNames } from '@/app/cosmos/utils/islandNames';

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

// ============================================================================
// PROPS AGRUPADAS POR DOMÍNIO
// ============================================================================

/**
 * Configuração de view/visualização
 */
export interface TodoViewConfig {
  current: TodoView;
  onChange?: (view: TodoView) => void;
}

/**
 * Handlers de drag and drop
 */
export interface DragHandlers {
  onStart: (todoId: string) => (event: React.DragEvent) => void;
  onEnd: () => void;
  onDropInside?: () => void;
}

/**
 * Handlers de touch (mobile)
 */
export interface TouchHandlers {
  onStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onEnd?: (todoId: string) => (event: React.TouchEvent) => void;
  onMove?: (event: React.TouchEvent) => void;
}

/**
 * Handlers de ações em batch
 */
export interface BatchHandlers {
  onDelete?: (todoIds: string[]) => void;
  onAssignPhase?: (todoIds: string[], phase: MoonPhase) => void;
  onAssignIsland?: (todoIds: string[], islandId: IslandId) => void;
}

/**
 * Handlers de ações individuais
 */
export interface TodoActionHandlers {
  onToggleComplete: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
  onUpdate?: (todoId: string, updates: Partial<SavedTodo>) => void;
}

/**
 * Configuração de filtros
 */
export interface FilterConfig {
  selectedPhase?: MoonPhase | null;
  selectedIsland?: IslandId | null;
  inputType?: InputTypeFilter;
  todoStatus?: TodoStatusFilter;
  onInputTypeChange?: (filter: InputTypeFilter) => void;
  onTodoStatusChange?: (filter: TodoStatusFilter) => void;
}

/**
 * Configuração de ilhas
 */
export interface IslandConfig {
  names?: IslandNames;
  ids?: IslandId[];
}

/**
 * Props principais do SavedTodosPanel (agrupadas)
 */
export interface SavedTodosPanelProps {
  /** Lista de todos a exibir */
  todos: SavedTodo[];
  
  /** Configuração de view */
  view?: TodoViewConfig;
  
  /** Handlers de drag and drop */
  drag: DragHandlers;
  
  /** Handlers de touch (opcional) */
  touch?: TouchHandlers;
  
  /** Handlers de ações em batch */
  batch?: BatchHandlers;
  
  /** Handlers de ações individuais */
  actions: TodoActionHandlers;
  
  /** Configuração de filtros */
  filters?: FilterConfig;
  
  /** Configuração de ilhas */
  islands?: IslandConfig;
}

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
  
  // Agrupamento por fases lunares
  expandedPhases: Record<MoonPhase | 'sem-fase', boolean>;
  groupByPhase: boolean;
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
  | { type: 'TOGGLE_PHASE_EXPANDED'; payload: MoonPhase | 'sem-fase' }
  | { type: 'SET_GROUP_BY_PHASE'; payload: boolean }
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
