'use client';

/**
 * 🎯 TodoPanelContext - Context interno para subcomponentes
 * 
 * Elimina prop drilling entre SavedTodosPanel e seus filhos.
 * NÃO é um context global - é scoped ao componente.
 */

import { createContext, useContext, type ReactNode, type Dispatch } from 'react';
import { type SavedTodo, type IslandId, type MoonPhase, type IslandNames } from '@/client/storage';
import type { 
  TodoPanelState, 
  TodoPanelAction,
  TodoView,
  InputTypeFilter,
  TodoStatusFilter,
} from './types';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface TodoPanelContextValue {
  // Data
  todos: SavedTodo[];
  filteredTodos: SavedTodo[];
  displayedTodos: SavedTodo[];
  
  // State (from useReducer)
  state: TodoPanelState;
  dispatch: Dispatch<TodoPanelAction>;
  
  // View
  view: TodoView;
  onViewChange?: (view: TodoView) => void;
  
  // Filters
  selectedPhase?: MoonPhase | null;
  selectedIsland?: IslandId | null;
  inputTypeFilter: InputTypeFilter;
  todoStatusFilter: TodoStatusFilter;
  onInputTypeFilterChange?: (filter: InputTypeFilter) => void;
  onTodoStatusFilterChange?: (filter: TodoStatusFilter) => void;
  
  // Islands
  islandNames?: IslandNames;
  islandIds?: IslandId[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  
  // Actions
  canEdit: boolean;
  onToggleComplete: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
  onUpdate?: (todoId: string, updates: Partial<SavedTodo>) => void;
  
  // Drag
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  
  // Touch
  onTouchStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  
  // Batch
  onBatchDelete?: (todoIds: string[]) => void;
  onBatchAssignPhase?: (todoIds: string[], phase: MoonPhase) => void;
  onBatchAssignIsland?: (todoIds: string[], islandId: IslandId) => void;
  
  // Selection helpers
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;
  
  // Editing helpers
  startEditing: (todoId: string, text: string, category?: string, dueDate?: string) => void;
  cancelEditing: () => void;
  setBatchIsland: (island: IslandId | '') => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TodoPanelContext = createContext<TodoPanelContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface TodoPanelProviderProps {
  value: TodoPanelContextValue;
  children: ReactNode;
}

export function TodoPanelProvider({ value, children }: TodoPanelProviderProps) {
  return (
    <TodoPanelContext.Provider value={value}>
      {children}
    </TodoPanelContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para acessar o context do TodoPanel.
 * Deve ser usado apenas dentro de subcomponentes do SavedTodosPanel.
 */
export function useTodoPanelContext(): TodoPanelContextValue {
  const context = useContext(TodoPanelContext);
  
  if (!context) {
    throw new Error(
      'useTodoPanelContext deve ser usado dentro de um SavedTodosPanel. ' +
      'Este hook é para subcomponentes internos apenas.'
    );
  }
  
  return context;
}

// ============================================================================
// SELECTOR HOOKS (para evitar re-renders desnecessários)
// ============================================================================

/**
 * Seletor para dados de seleção
 */
export function useTodoSelection() {
  const { 
    state, 
    toggleSelect, 
    selectAll, 
    clearSelection, 
    setSelectionMode 
  } = useTodoPanelContext();
  
  return {
    isSelectionMode: state.isSelectionMode,
    selectedTodoIds: state.selectedTodoIds,
    selectedCount: state.selectedTodoIds.length,
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectionMode,
  };
}

/**
 * Seletor para dados de edição
 */
export function useTodoEditing() {
  const { state, dispatch, startEditing, cancelEditing, canEdit } = useTodoPanelContext();
  
  return {
    isEditMode: state.isEditMode,
    editingTodoId: state.editingTodoId,
    editingText: state.editingText,
    editingCategory: state.editingCategory,
    editingDueDate: state.editingDueDate,
    canEdit,
    startEditing,
    cancelEditing,
    setEditMode: (enabled: boolean) => dispatch({ type: 'SET_EDIT_MODE', payload: enabled }),
    updateEditing: (updates: Partial<{ text: string; category: string; dueDate: string }>) =>
      dispatch({ type: 'UPDATE_EDITING', payload: updates }),
  };
}

/**
 * Seletor para dados de paginação
 */
export function useTodoPagination() {
  const { currentPage, totalPages, setPage, filteredTodos, displayedTodos } = useTodoPanelContext();
  
  return {
    currentPage,
    totalPages,
    setPage,
    totalItems: filteredTodos.length,
    displayedCount: displayedTodos.length,
  };
}

/**
 * Seletor para ações em batch
 */
export function useTodoBatchActions() {
  const { 
    state, 
    onBatchDelete, 
    onBatchAssignPhase, 
    onBatchAssignIsland,
    clearSelection,
    setBatchIsland,
    islandIds,
    islandNames,
  } = useTodoPanelContext();
  
  return {
    selectedTodoIds: state.selectedTodoIds,
    batchIsland: state.batchIsland,
    setBatchIsland,
    islandIds,
    islandNames,
    handleBatchDelete: () => {
      if (state.selectedTodoIds.length > 0 && onBatchDelete) {
        onBatchDelete(state.selectedTodoIds);
        clearSelection();
      }
    },
    handleBatchAssignPhase: (phase: MoonPhase) => {
      if (state.selectedTodoIds.length > 0 && onBatchAssignPhase) {
        onBatchAssignPhase(state.selectedTodoIds, phase);
      }
    },
    handleBatchAssignIsland: () => {
      if (state.batchIsland && state.selectedTodoIds.length > 0 && onBatchAssignIsland) {
        onBatchAssignIsland(state.selectedTodoIds, state.batchIsland as IslandId);
      }
    },
  };
}
