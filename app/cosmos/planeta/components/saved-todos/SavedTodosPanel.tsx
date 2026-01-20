'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTodoPanelState } from '@/app/cosmos/planeta/salvos/useTodoPanelState';
import { TodoList } from '@/app/cosmos/planeta/salvos/TodoList';
import { PhaseGroupedTodoList } from '@/app/cosmos/planeta/salvos/PhaseGroupedTodoList';
import { TodoBatchActions } from '@/app/cosmos/planeta/salvos/TodoBatchActions';
import type { SavedTodo, MoonPhase, IslandId } from '@/types/todo';
import type { SavedTodosPanelProps as GroupedProps, TodoView } from '@/app/cosmos/planeta/salvos/types';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '@/app/cosmos/utils/islandNames';
import type { CategoryFilter } from '@/types/planetState';

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
  categoryFilter?: CategoryFilter;
  onCategoryFilterChange?: (filter: CategoryFilter) => void;
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
    categoryFilter: props.filters?.categoryFilter ?? 'all',
    onCategoryFilterChange: props.filters?.onCategoryFilterChange,
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
    categoryFilter = 'all',
    onCategoryFilterChange,
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
  const [activeTodoDropId, setActiveTodoDropId] = useState<string | null>(null);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());

  const panelRef = useRef<HTMLDivElement>(null);
  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const canEdit = Boolean(onUpdateTodo);
  const visibleIslandIds = islandIds && islandIds.length > 0 ? islandIds : ISLAND_IDS;

  // === Filtering Hook ===
  const { filteredTodos, itemsPerPage } = useTodoFiltering({
    todos: savedTodos,
    view,
    selectedPhase,
    selectedIsland,
    currentPage: state.currentPage,
    todoStatusFilter: (todoStatusFilter as 'all' | 'open' | 'completed') || 'all',
    categoryFilter: categoryFilter || 'all',
    inputTypeFilter: inputTypeFilter || 'all',
  });

  const rootFilteredTodos = useMemo(
    () => filteredTodos.filter((todo) => !todo.parentId),
    [filteredTodos]
  );

  const rootTotalPages = Math.ceil(rootFilteredTodos.length / itemsPerPage);
  const currentRootPage = Math.min(state.currentPage, Math.max(rootTotalPages - 1, 0));
  const rootStartIndex = currentRootPage * itemsPerPage;
  const rootEndIndex = Math.min(rootStartIndex + itemsPerPage, rootFilteredTodos.length);
  const rootDisplayedTodos = rootFilteredTodos.slice(rootStartIndex, rootEndIndex);

  const subtasksByParent = useMemo(() => {
    const map: Record<string, SavedTodo[]> = {};
    filteredTodos.forEach((todo) => {
      if (!todo.parentId) return;
      if (!map[todo.parentId]) {
        map[todo.parentId] = [];
      }
      map[todo.parentId]?.push(todo);
    });
    return map;
  }, [filteredTodos]);

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
      startEditing(
        todo.id,
        todo.text,
        todo.category,
        todo.dueDate,
        todo.depth,
        todo.islandId,
        todo.parentId ?? null
      );
    },
    [canEdit, startEditing]
  );

  const handleSaveEditing = useCallback(
    (todo: SavedTodo) => {
      if (!onUpdateTodo) {
        setActiveTodoDropId(null);
        return;
      }
      const trimmedText = state.editingText.trim();
      if (!trimmedText) return;
      onUpdateTodo(todo.id, {
        text: trimmedText,
        category: state.editingCategory.trim() || undefined,
        dueDate: state.editingDueDate || undefined,
        depth: Number.isFinite(state.editingDepth) ? state.editingDepth : 0,
        islandId: state.editingIslandId || undefined,
        parentId: state.editingParentId || null,
      });
      cancelEditing();
    },
    [
      onUpdateTodo,
      state.editingText,
      state.editingCategory,
      state.editingDueDate,
      state.editingDepth,
      state.editingIslandId,
      state.editingParentId,
      cancelEditing,
    ]
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

  const handleUpdateEditDepth = useCallback((depth: number) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { depth } });
  }, [dispatch]);

  const handleUpdateEditIsland = useCallback((islandId: IslandId | '') => {
    dispatch({ type: 'UPDATE_EDITING', payload: { islandId } });
  }, [dispatch]);

  const handleUpdateEditParent = useCallback((parentId: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { parentId } });
  }, [dispatch]);

  // === Handlers de Seleção em Lote ===
  const selectedCount = state.selectedTodoIds.length;
  const allDisplayedSelected =
    rootDisplayedTodos.length > 0 &&
    rootDisplayedTodos.every((todo) => state.selectedTodoIds.includes(todo.id));

  const handleToggleSelectDisplayed = useCallback(() => {
    if (rootDisplayedTodos.length === 0) return;

    if (allDisplayedSelected) {
      const newSelected = state.selectedTodoIds.filter(
        (id) => !rootDisplayedTodos.some((todo) => todo.id === id)
      );
      dispatch({ type: 'SELECT_ALL', payload: newSelected });
      return;
    }

    const displayedIds = rootDisplayedTodos.map((todo) => todo.id);
    const newSelected = Array.from(new Set([...state.selectedTodoIds, ...displayedIds]));
    dispatch({ type: 'SELECT_ALL', payload: newSelected });
  }, [rootDisplayedTodos, state.selectedTodoIds, allDisplayedSelected, dispatch]);

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

  const getDraggedTodoIds = useCallback((event: React.DragEvent): string[] => {
    const rawTodoIds = event.dataTransfer.getData('text/todo-ids');
    if (rawTodoIds) {
      try {
        const parsed = JSON.parse(rawTodoIds);
        if (Array.isArray(parsed)) {
          const ids = parsed.filter((id) => typeof id === 'string');
          if (ids.length > 0) return ids;
        }
      } catch {
        // ignore
      }
    }
    const todoId = event.dataTransfer.getData('text/todo-id');
    return todoId ? [todoId] : [];
  }, []);

  const handleDragStartWithSelection = useCallback(
    (todoId: string) => (event: React.DragEvent) => {
      if (state.isSelectionMode && state.selectedTodoIds.length > 0) {
        event.dataTransfer.setData('text/todo-ids', JSON.stringify(state.selectedTodoIds));
      } else {
        event.dataTransfer.setData('text/todo-id', todoId);
      }
      onDragStart(todoId)(event);
    },
    [state.isSelectionMode, state.selectedTodoIds, onDragStart]
  );

  const handleDropOnTodo = useCallback(
    (target: SavedTodo) => (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!onUpdateTodo) return;

      const todoIds = getDraggedTodoIds(event).filter((id) => id !== target.id);
      if (todoIds.length === 0) {
        setActiveTodoDropId(null);
        return;
      }

      const nextDepth = (Number.isFinite(target.depth) ? Number(target.depth) : 0) + 1;
      todoIds.forEach((id) => {
        onUpdateTodo(id, {
          depth: nextDepth,
          islandId: target.islandId ?? undefined,
          parentId: target.id,
        });
      });

      clearSelection();
      setActiveTodoDropId(null);
      onDropInside?.();
    },
    [getDraggedTodoIds, onUpdateTodo, clearSelection, onDropInside, setActiveTodoDropId]
  );

  const handleDragOverTodo = useCallback(
    (todo: SavedTodo) => (event: React.DragEvent) => {
      event.preventDefault();
      setActiveTodoDropId(todo.id);
    },
    []
  );

  const handleDragLeaveTodo = useCallback(() => {
    setActiveTodoDropId(null);
  }, []);

  const handleToggleExpand = useCallback((todoId: string) => {
    setExpandedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  }, []);

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

  useEffect(() => {
    const maxPageIndex = Math.max(rootTotalPages - 1, 0);
    if (state.currentPage > maxPageIndex) {
      setPage(maxPageIndex);
    }
  }, [rootTotalPages, state.currentPage, setPage]);

  useEffect(() => {
    const validIds = new Set(filteredTodos.map((todo) => todo.id));
    setExpandedTodoIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [filteredTodos]);

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
    editingDepth: state.editingDepth,
    editingIslandId: state.editingIslandId,
    editingParentId: state.editingParentId,
    swipeDeleteId: state.swipeDeleteId,
    selectedTodoIds: state.selectedTodoIds,
    islandNames,
    islandIds,
    expandedTodoIds,
    subtasksByParent,
    onToggleComplete,
    onToggleSelect: toggleSelect,
    onStartEdit: handleStartEditing,
    onUpdateEditText: handleUpdateEditText,
    onUpdateEditCategory: handleUpdateEditCategory,
    onUpdateEditDepth: handleUpdateEditDepth,
    onUpdateEditIsland: handleUpdateEditIsland,
    onUpdateEditParent: handleUpdateEditParent,
    onUpdateEditDueDate: handleUpdateEditDueDate,
    onSaveEdit: handleSaveEditing,
    onCancelEdit: cancelEditing,
    onDelete: onDeleteTodo ?? (() => {}),
    onDragStart: handleDragStartWithSelection,
    onDragEnd,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onSelectionTouchStart: handleSelectionTouchStart,
    onSelectionTouchMove: handleSelectionTouchMove,
    onSelectionTouchEnd: handleSelectionTouchEnd,
    activeTodoDropId,
    onDropTodo: handleDropOnTodo,
    onDragOverTodo: handleDragOverTodo,
    onDragLeaveTodo: handleDragLeaveTodo,
    onToggleExpand: handleToggleExpand,
    emptyTitle,
    emptyDescription,
  };

  // === Render ===
  return (
    <div
      ref={panelRef}
      className="rounded-2xl border-0 bg-transparent p-4 shadow-none backdrop-blur-0"
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
              categoryFilter={categoryFilter}
              onToggleEditOrSelectionMode={handleToggleEditOrSelectionMode}
              onToggleGroupByPhase={() => setGroupByPhase(!state.groupByPhase)}
              onInputTypeFilterChange={onInputTypeFilterChange}
              onTodoStatusFilterChange={onTodoStatusFilterChange}
              onCategoryFilterChange={onCategoryFilterChange}
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
          displayedTodos={rootDisplayedTodos}
          expandedPhases={state.expandedPhases}
          onTogglePhase={togglePhaseExpanded}
          {...sharedListProps}
        />
      ) : (
        <TodoList
          todos={rootFilteredTodos}
          displayedTodos={rootDisplayedTodos}
          {...sharedListProps}
        />
      )}

      {/* Pagination */}
      {rootFilteredTodos.length > 20 && (
        <TodoPagination
          currentPage={currentRootPage}
          totalPages={rootTotalPages}
          startIndex={rootStartIndex}
          endIndex={rootEndIndex}
          totalItems={rootFilteredTodos.length}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
