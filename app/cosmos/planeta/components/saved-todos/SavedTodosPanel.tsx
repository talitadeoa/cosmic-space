'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useTodoPanelState } from '@/app/cosmos/planeta/salvos/useTodoPanelState';
import { TodoList } from '@/app/cosmos/planeta/salvos/TodoList';
import { PhaseGroupedTodoList } from '@/app/cosmos/planeta/salvos/PhaseGroupedTodoList';
import { TodoBatchActions } from '@/app/cosmos/planeta/salvos/TodoBatchActions';
import type { SavedTodo, MoonPhase, IslandId } from '@/types/todo';
import type { SavedTodosPanelProps as GroupedProps, TodoView } from '@/app/cosmos/planeta/salvos/types';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '@/app/cosmos/utils/islandNames';

// Hooks extraídos
import { useTodoFiltering } from './hooks/useTodoFiltering';
import { useTodoDragDrop } from './hooks/useTodoDragDrop';
import { useTodoTouch } from './hooks/useTodoTouch';

// Componentes extraídos
import { TodoViewButtons } from './components/TodoViewButtons';
import { TodoPanelHeader } from './components/TodoPanelHeader';
import { TodoPagination } from './components/TodoPagination';
import { TodoModeButtons } from './components/TodoModeButtons';

// ============================================================================
// TYPES
// ============================================================================

interface LegacySavedTodosPanelProps {
  savedTodos: SavedTodo[];
  view?: TodoView;
  onViewChange?: (view: TodoView) => void;
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onTouchStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchEnd?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  onToggleComplete: (todoId: string) => void;
  onDropInside?: () => void;
  onDeleteTodo?: (todoId: string) => void;
  selectedPhase?: MoonPhase | null;
  selectedIsland?: IslandId | null;
  islandNames?: IslandNames;
  inputTypeFilter?: 'all' | 'text' | 'checkbox';
  todoStatusFilter?: 'all' | 'completed' | 'open';
  onInputTypeFilterChange?: (filter: 'all' | 'text' | 'checkbox') => void;
  onTodoStatusFilterChange?: (filter: 'all' | 'completed' | 'open') => void;
  onUpdateTodo?: (todoId: string, updates: Partial<SavedTodo>) => void;
  onBatchDelete?: (todoIds: string[]) => void;
  onBatchAssignPhase?: (todoIds: string[], phase: MoonPhase) => void;
  onBatchAssignIsland?: (todoIds: string[], islandId: IslandId) => void;
  islandIds?: IslandId[];
}

type SavedTodosPanelProps = LegacySavedTodosPanelProps | GroupedProps;

// ============================================================================
// HELPERS
// ============================================================================

function isGroupedProps(props: SavedTodosPanelProps): props is GroupedProps {
  return 'todos' in props && 'drag' in props && 'actions' in props;
}

function normalizeProps(props: SavedTodosPanelProps): LegacySavedTodosPanelProps {
  if (!isGroupedProps(props)) {
    return props;
  }

  return {
    savedTodos: props.todos,
    view: props.view?.current ?? 'todos',
    onViewChange: props.view?.onChange,
    onDragStart: props.drag.onStart,
    onDragEnd: props.drag.onEnd,
    onDropInside: props.drag.onDropInside,
    onTouchStart: props.touch?.onStart,
    onTouchEnd: props.touch?.onEnd,
    onTouchMove: props.touch?.onMove,
    onToggleComplete: props.actions.onToggleComplete,
    onDeleteTodo: props.actions.onDelete,
    onUpdateTodo: props.actions.onUpdate,
    onBatchDelete: props.batch?.onDelete,
    onBatchAssignPhase: props.batch?.onAssignPhase,
    onBatchAssignIsland: props.batch?.onAssignIsland,
    selectedPhase: props.filters?.selectedPhase,
    selectedIsland: props.filters?.selectedIsland,
    inputTypeFilter: props.filters?.inputType ?? 'all',
    todoStatusFilter: props.filters?.todoStatus ?? 'all',
    onInputTypeFilterChange: props.filters?.onInputTypeChange,
    onTodoStatusFilterChange: props.filters?.onTodoStatusChange,
    islandNames: props.islands?.names,
    islandIds: props.islands?.ids,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SavedTodosPanel Component (Refatorado v3)
 *
 * Exibe lista de tarefas salvas com:
 * - EmptyState quando não há tarefas
 * - Suporte a drag-and-drop
 * - Filtro por fase lunar e ilha
 * - Estados visuais para conclusão
 * - Agrupamento por fase
 * - Paginação
 *
 * Refatorações:
 * - v1: useReducer para gerenciar 14+ estados
 * - v2: Props agrupadas por domínio
 * - v3: Extração de hooks (filtering, drag, touch) e subcomponentes
 */
export const SavedTodosPanel: React.FC<SavedTodosPanelProps> = (rawProps) => {
  // Normaliza props para formato interno
  const {
    savedTodos,
    view = 'todos',
    onViewChange,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onToggleComplete,
    onDropInside,
    onDeleteTodo,
    selectedPhase,
    selectedIsland,
    islandNames,
    inputTypeFilter = 'all',
    todoStatusFilter = 'all',
    onInputTypeFilterChange,
    onTodoStatusFilterChange,
    onUpdateTodo,
    onBatchDelete,
    onBatchAssignPhase,
    onBatchAssignIsland,
    islandIds,
  } = normalizeProps(rawProps);

  // Estado centralizado
  const {
    state,
    dispatch,
    startEditing,
    cancelEditing,
    toggleSelect,
    clearSelection,
    setSelectionMode,
    setPage,
    setBatchIsland,
    togglePhaseExpanded,
    setGroupByPhase,
  } = useTodoPanelState();

  const panelRef = useRef<HTMLDivElement>(null);
  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const canEdit = Boolean(onUpdateTodo);
  const visibleIslandIds = islandIds && islandIds.length > 0 ? islandIds : ISLAND_IDS;

  // === Filtering Hook ===
  const { filteredTodos, displayedTodos, totalPages, startIndex, endIndex } = useTodoFiltering({
    todos: savedTodos,
    view,
    selectedPhase,
    selectedIsland,
    currentPage: state.currentPage,
    todoStatusFilter: (todoStatusFilter as 'all' | 'open' | 'completed') || 'all',
  });

  // === Drag & Drop Hook ===
  const {
    handleDropOnView,
    handleDragOverView,
    handleDragEnterView,
    handleDragLeaveView,
    getDateForView,
    getPhaseCycleForView,
  } = useTodoDragDrop({
    savedTodos,
    selectedTodoIds: state.selectedTodoIds,
    isSelectionMode: state.isSelectionMode,
    selectedPhase,
    selectedIsland,
    onUpdateTodo,
    onViewChange,
    onClearSelection: clearSelection,
    onDropInside,
    setViewDrop: (v) => dispatch({ type: 'SET_VIEW_DROP', payload: v }),
  });

  // === Handlers de Edição ===
  const handleStartEditing = useCallback(
    (todo: SavedTodo) => {
      if (!canEdit) return;
      startEditing(todo.id, todo.text, todo.category, todo.dueDate);
    },
    [canEdit, startEditing]
  );

  const handleSaveEditing = useCallback(
    (todo: SavedTodo) => {
      if (!onUpdateTodo) return;
      const trimmedText = state.editingText.trim();
      if (!trimmedText) return;
      onUpdateTodo(todo.id, {
        text: trimmedText,
        category: state.editingCategory.trim() || undefined,
        dueDate: state.editingDueDate || undefined,
      });
      cancelEditing();
    },
    [onUpdateTodo, state.editingText, state.editingCategory, state.editingDueDate, cancelEditing]
  );

  // === Touch Hook ===
  const {
    handleItemTouchStart,
    handleItemTouchEnd,
    handleSelectionTouchStart,
    handleSelectionTouchMove,
    handleSelectionTouchEnd,
  } = useTodoTouch({
    savedTodos,
    selectedTodoIds: state.selectedTodoIds,
    isSelectionMode: state.isSelectionMode,
    onToggleComplete,
    onStartEditing: handleStartEditing,
    onSetSwipeDelete: (id) => dispatch({ type: 'SET_SWIPE_DELETE', payload: id }),
    onUpdateSelection: (ids) => dispatch({ type: 'SELECT_ALL', payload: ids }),
  });

  // === Handlers de View ===
  const handleViewChange = useCallback(
    (nextView: TodoView) => {
      onViewChange?.(nextView);
      setPage(0);
    },
    [onViewChange, setPage]
  );

  // === Handlers de Modo ===
  const handleToggleEditOrSelectionMode = useCallback(() => {
    if (!canEdit) return;
    const isActive = state.isEditMode && state.isSelectionMode;
    dispatch({ type: 'SET_EDIT_MODE', payload: !isActive });
    setSelectionMode(!isActive);
  }, [canEdit, state.isEditMode, state.isSelectionMode, setSelectionMode, dispatch]);

  // === Handlers de Edição de Texto ===
  const handleUpdateEditText = useCallback((text: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { text } });
  }, [dispatch]);

  const handleUpdateEditCategory = useCallback((category: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { category } });
  }, [dispatch]);

  const handleUpdateEditDueDate = useCallback((dueDate: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { dueDate } });
  }, [dispatch]);

  // === Handlers de Seleção em Lote ===
  const selectedCount = state.selectedTodoIds.length;
  const allDisplayedSelected =
    displayedTodos.length > 0 &&
    displayedTodos.every((todo) => state.selectedTodoIds.includes(todo.id));

  const handleToggleSelectDisplayed = useCallback(() => {
    if (displayedTodos.length === 0) return;

    if (allDisplayedSelected) {
      const newSelected = state.selectedTodoIds.filter(
        (id) => !displayedTodos.some((todo) => todo.id === id)
      );
      dispatch({ type: 'SELECT_ALL', payload: newSelected });
      return;
    }

    const displayedIds = displayedTodos.map((todo) => todo.id);
    const newSelected = Array.from(new Set([...state.selectedTodoIds, ...displayedIds]));
    dispatch({ type: 'SELECT_ALL', payload: newSelected });
  }, [displayedTodos, state.selectedTodoIds, allDisplayedSelected, dispatch]);

  const handleBatchDelete = useCallback(() => {
    if (selectedCount === 0 || !onBatchDelete) return;
    onBatchDelete(state.selectedTodoIds);
    clearSelection();
  }, [selectedCount, onBatchDelete, state.selectedTodoIds, clearSelection]);

  const handleBatchAssignPhase = useCallback(
    (phase: MoonPhase) => {
      if (selectedCount === 0 || !onBatchAssignPhase) return;
      onBatchAssignPhase(state.selectedTodoIds, phase);
    },
    [selectedCount, onBatchAssignPhase, state.selectedTodoIds]
  );

  const handleBatchAssignIsland = useCallback(() => {
    if (!state.batchIsland || selectedCount === 0 || !onBatchAssignIsland) return;
    onBatchAssignIsland(state.selectedTodoIds, state.batchIsland as IslandId);
  }, [state.batchIsland, selectedCount, onBatchAssignIsland, state.selectedTodoIds]);

  const handleBatchMoveToView = useCallback(
    (viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => {
      if (selectedCount === 0 || !onUpdateTodo) return;
      handleViewChange(viewType);

      if (viewType === 'em-aberto') {
        state.selectedTodoIds.forEach((id) => {
          onUpdateTodo(id, {
            dueDate: undefined,
            phase: undefined,
            islandId: undefined,
            phaseCycle: undefined,
          });
        });
        return;
      }

      const dueDate = getDateForView(viewType);
      if (!dueDate) return;

      const phaseCycleValue = getPhaseCycleForView(viewType);

      state.selectedTodoIds.forEach((id) => {
        const todo = savedTodos.find((t) => t.id === id);
        if (!todo) return;

        const updates: Partial<SavedTodo> = {
          dueDate,
          phaseCycle: phaseCycleValue,
        };

        if (!todo.phase && selectedPhase) {
          updates.phase = selectedPhase;
        } else if (todo.phase) {
          updates.phase = todo.phase;
        }

        if (!todo.islandId && selectedIsland) {
          updates.islandId = selectedIsland;
        } else if (todo.islandId) {
          updates.islandId = todo.islandId;
        }

        onUpdateTodo(id, updates);
      });
    },
    [
      selectedCount,
      onUpdateTodo,
      handleViewChange,
      state.selectedTodoIds,
      savedTodos,
      selectedPhase,
      selectedIsland,
      getDateForView,
      getPhaseCycleForView,
    ]
  );

  // === Effects ===
  useEffect(() => {
    setPage(0);
  }, [selectedPhase, selectedIsland, setPage]);

  useEffect(() => {
    dispatch({
      type: 'SELECT_ALL',
      payload: state.selectedTodoIds.filter((id) => savedTodos.some((todo) => todo.id === id)),
    });
  }, [savedTodos, dispatch]);

  // === Empty State Config ===
  const emptyTitle = selectedPhase
    ? 'Nada salvo nesta fase'
    : islandLabel
      ? 'Nada salvo nesta ilha'
      : 'Nada salvo';

  const emptyDescription = selectedPhase
    ? `Arraste um input para ${phaseLabels[selectedPhase]} ou crie um novo.`
    : islandLabel
      ? `Arraste um input para ${islandLabel} ou crie um novo.`
      : 'Adicione ou selecione uma fase lunar.';

  // === Shared List Props ===
  const sharedListProps = {
    isEditMode: state.isEditMode,
    isSelectionMode: state.isSelectionMode,
    editingTodoId: state.editingTodoId,
    editingText: state.editingText,
    editingCategory: state.editingCategory,
    editingDueDate: state.editingDueDate,
    swipeDeleteId: state.swipeDeleteId,
    selectedTodoIds: state.selectedTodoIds,
    islandNames,
    onToggleComplete,
    onToggleSelect: toggleSelect,
    onStartEdit: handleStartEditing,
    onUpdateEditText: handleUpdateEditText,
    onUpdateEditCategory: handleUpdateEditCategory,
    onUpdateEditDueDate: handleUpdateEditDueDate,
    onSaveEdit: handleSaveEditing,
    onCancelEdit: cancelEditing,
    onDelete: onDeleteTodo ?? (() => {}),
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onSelectionTouchStart: handleSelectionTouchStart,
    onSelectionTouchMove: handleSelectionTouchMove,
    onSelectionTouchEnd: handleSelectionTouchEnd,
    emptyTitle,
    emptyDescription,
  };

  // === Render ===
  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-xl shadow-indigo-900/20 backdrop-blur-md"
      role="region"
      aria-label="Painel de tarefas salvas"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDropInside?.();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <TodoPanelHeader view={view} selectedPhase={selectedPhase} islandLabel={islandLabel} />

          <TodoViewButtons
            currentView={view}
            activeViewDrop={state.activeViewDrop}
            selectedPhase={selectedPhase}
            onViewChange={handleViewChange}
            onDragOver={handleDragOverView}
            onDrop={handleDropOnView}
            onDragEnter={handleDragEnterView}
            onDragLeave={handleDragLeaveView}
          />
        </div>

        <TodoModeButtons
          canEdit={canEdit}
          isEditMode={state.isEditMode}
          isSelectionMode={state.isSelectionMode}
          groupByPhase={state.groupByPhase}
          inputTypeFilter={inputTypeFilter as 'all' | 'text' | 'checkbox'}
          todoStatusFilter={todoStatusFilter as 'all' | 'completed' | 'open'}
          onToggleEditOrSelectionMode={handleToggleEditOrSelectionMode}
          onToggleGroupByPhase={() => setGroupByPhase(!state.groupByPhase)}
          onInputTypeFilterChange={onInputTypeFilterChange}
          onTodoStatusFilterChange={onTodoStatusFilterChange}
        />
      </div>

      {/* Selection Mode Toolbar */}
      {state.isSelectionMode && (
        <TodoBatchActions
          isSelectionMode={state.isSelectionMode}
          selectedCount={selectedCount}
          allDisplayedSelected={allDisplayedSelected}
          batchIsland={state.batchIsland as IslandId | ''}
          visibleIslandIds={visibleIslandIds}
          islandNames={islandNames}
          onToggleSelectDisplayed={handleToggleSelectDisplayed}
          onClearSelection={clearSelection}
          onBatchDelete={handleBatchDelete}
          onBatchAssignPhase={handleBatchAssignPhase}
          onBatchAssignIsland={handleBatchAssignIsland}
          onBatchMoveToView={handleBatchMoveToView}
          onBatchIslandChange={setBatchIsland}
        />
      )}

      {/* Todo List */}
      {state.groupByPhase ? (
        <PhaseGroupedTodoList
          displayedTodos={displayedTodos}
          expandedPhases={state.expandedPhases}
          onTogglePhase={togglePhaseExpanded}
          {...sharedListProps}
        />
      ) : (
        <TodoList todos={filteredTodos} displayedTodos={displayedTodos} {...sharedListProps} />
      )}

      {/* Pagination */}
      {filteredTodos.length > 20 && (
        <TodoPagination
          currentPage={state.currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredTodos.length}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
