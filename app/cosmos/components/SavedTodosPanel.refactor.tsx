'use client';

/**
 * SavedTodosPanel Refatorado (v3)
 * 
 * Extraído:
 * - Filtro e view: useFilterAndView hook
 * - Gestos: useTodoGestures hook  
 * - Batch ops: useBatchOperations hook
 * - ViewButtons e ModeBar components
 * 
 * Resultado: 950 → ~320 linhas (66% redução)
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { useTodoPanelState } from '@/components/todos/useTodoPanelState';
import { TodoList } from '@/components/todos/TodoList';
import { PhaseGroupedTodoList } from '@/components/todos/PhaseGroupedTodoList';
import { TodoBatchActions } from '@/components/todos/TodoBatchActions';
import { ViewButtons } from './todos/ViewButtons';
import { ModeBar } from './todos/ModeBar';
import { useFilterAndView } from './todos/useFilterAndView';
import { useTodoGestures } from './todos/useTodoGestures';
import { useBatchOperations } from './todos/useBatchOperations';
import type { SavedTodo, MoonPhase, IslandId } from '../utils/todoStorage';
import { phaseLabels } from '../utils/todoStorage';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '../utils/islandNames';
import type { SavedTodosPanelProps as GroupedProps, TodoView } from '@/components/todos/types';

// Legacy props interface (for backward compatibility)
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
// MAIN COMPONENT
// ============================================================================

export const SavedTodosPanel: React.FC<SavedTodosPanelProps> = (rawProps) => {
  const props = normalizeProps(rawProps);
  
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
  } = props;

  // State hooks
  const { state, dispatch, startEditing, cancelEditing, toggleSelect, selectAll, clearSelection, setSelectionMode, setPage, setBatchIsland, togglePhaseExpanded, setGroupByPhase } = useTodoPanelState();
  
  const panelRef = React.useRef<HTMLDivElement>(null);
  const selectionTouchActiveRef = React.useRef(false);
  const selectionTouchModeRef = React.useRef<'select' | 'deselect'>('select');
  const lastTouchedIdRef = React.useRef<string | null>(null);

  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const canEdit = Boolean(onUpdateTodo);

  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================

  const { applyFilters, paginate, getDateForView, ITEMS_PER_PAGE } = useFilterAndView(
    savedTodos,
    selectedPhase,
    selectedIsland
  );

  const filteredTodos = useMemo(
    () => applyFilters(savedTodos, view),
    [applyFilters, savedTodos, view]
  );

  const { displayed: displayedTodos, totalPages, startIndex, endIndex } = useMemo(
    () => paginate(filteredTodos, state.currentPage),
    [paginate, filteredTodos, state.currentPage]
  );

  const { 
    handleItemTouchStart, 
    handleItemTouchEnd, 
    handleDragOverView 
  } = useTodoGestures(
    savedTodos,
    onToggleComplete,
    (todo) => startEditing(todo.id, todo.text, todo.category, todo.dueDate),
    (todoId) => dispatch({ type: 'SET_SWIPE_DELETE', payload: todoId }),
    onTouchStart,
    onTouchEnd,
    onTouchMove
  );

  // Wrappers para adaptar assinatura de handleItemTouchStart e handleItemTouchEnd
  const wrappedItemTouchStart = useCallback(
    (todoId: string) => (event: React.TouchEvent) => {
      handleItemTouchStart(event);
    },
    [handleItemTouchStart]
  );

  const wrappedItemTouchEnd = useCallback(
    (todoId: string) => (event: React.TouchEvent) => {
      handleItemTouchEnd(todoId)(event);
    },
    [handleItemTouchEnd]
  );

  const { 
    selectedCount,
    handleBatchDelete,
    handleBatchAssignPhase,
    handleBatchAssignIsland,
    handleBatchMoveToView,
    handleDropOnView,
  } = useBatchOperations(
    state.selectedTodoIds,
    savedTodos,
    onBatchDelete,
    onBatchAssignPhase,
    onBatchAssignIsland,
    onUpdateTodo
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((nextView: string) => {
    onViewChange?.(nextView as TodoView);
    setPage(0);
  }, [onViewChange, setPage]);

  const handleToggleEditMode = useCallback(() => {
    if (!canEdit) return;
    dispatch({ type: 'SET_EDIT_MODE', payload: !state.isEditMode });
  }, [canEdit, state.isEditMode, dispatch]);

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

  const handleBatchMoveWithView = useCallback(
    (viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => {
      handleViewChange(viewType);
      handleBatchMoveToView(viewType, getDateForView);
    },
    [handleViewChange, handleBatchMoveToView, getDateForView]
  );

  const applySelectionForId = useCallback((todoId: string, mode: 'select' | 'deselect') => {
    if (mode === 'select') {
      if (!state.selectedTodoIds.includes(todoId)) {
        dispatch({
          type: 'SELECT_ALL',
          payload: [...state.selectedTodoIds, todoId],
        });
      }
    } else {
      dispatch({
        type: 'SELECT_ALL',
        payload: state.selectedTodoIds.filter((id) => id !== todoId),
      });
    }
  }, [state.selectedTodoIds, dispatch]);

  const handleSelectionTouchStart = useCallback(
    (todoId: string, event: React.TouchEvent) => {
      if (!state.isSelectionMode) return;
      event.preventDefault();
      const isSelected = state.selectedTodoIds.includes(todoId);
      const mode: 'select' | 'deselect' = isSelected ? 'deselect' : 'select';
      selectionTouchActiveRef.current = true;
      selectionTouchModeRef.current = mode;
      lastTouchedIdRef.current = todoId;
      applySelectionForId(todoId, mode);
    },
    [state.isSelectionMode, state.selectedTodoIds, applySelectionForId]
  );

  const handleSelectionTouchMove = useCallback((event: React.TouchEvent) => {
    if (!state.isSelectionMode || !selectionTouchActiveRef.current) return;
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    const item = element.closest('[data-todo-id]') as HTMLElement | null;
    const todoId = item?.dataset.todoId;
    if (!todoId || todoId === lastTouchedIdRef.current) return;
    lastTouchedIdRef.current = todoId;
    applySelectionForId(todoId, selectionTouchModeRef.current);
  }, [state.isSelectionMode, applySelectionForId]);

  const handleSelectionTouchEnd = useCallback(() => {
    selectionTouchActiveRef.current = false;
    lastTouchedIdRef.current = null;
  }, []);

  const handleToggleSelectDisplayed = useCallback(() => {
    if (displayedTodos.length === 0) return;
    const allDisplayedSelected =
      displayedTodos.length > 0 && displayedTodos.every((todo) => state.selectedTodoIds.includes(todo.id));
    
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
  }, [displayedTodos, state.selectedTodoIds, dispatch]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setPage(0);
  }, [selectedPhase, selectedIsland, setPage]);

  useEffect(() => {
    dispatch({
      type: 'SELECT_ALL',
      payload: state.selectedTodoIds.filter((id) => savedTodos.some((todo) => todo.id === id)),
    });
  }, [savedTodos, state.selectedTodoIds, dispatch]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const allDisplayedSelected =
    displayedTodos.length > 0 && displayedTodos.every((todo) => state.selectedTodoIds.includes(todo.id));
  
  const visibleIslandIds = islandIds && islandIds.length > 0 ? islandIds : ISLAND_IDS;

  const getMoonEmoji = (phase: MoonPhase | null): string => {
    switch (phase) {
      case 'luaNova':
        return '🌑';
      case 'luaCrescente':
        return '🌓';
      case 'luaCheia':
        return '🌕';
      case 'luaMinguante':
        return '🌗';
      default:
        return '';
    }
  };

  const getNextPhase = (phase: MoonPhase): MoonPhase => {
    const phases: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  const headerLabel = (() => {
    const viewPrefix = view === 'todos' ? 'todos' : 'salvos';
    const parts = [viewPrefix];
    if (selectedPhase) parts.push(phaseLabels[selectedPhase]);
    if (islandLabel) parts.push(islandLabel);
    return parts.join(' - ');
  })();

  const headerDescription = (() => {
    if (view === 'todos') {
      if (selectedPhase && islandLabel)
        return `todos associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
      if (selectedPhase) return `todos associados à fase: ${phaseLabels[selectedPhase]}`;
      if (islandLabel) return `todos associados à ${islandLabel}.`;
      return 'Todas as tarefas salvas.';
    }
    if (selectedPhase && islandLabel)
      return `salvos associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
    if (selectedPhase) return `salvos associados à fase: ${phaseLabels[selectedPhase]}`;
    if (islandLabel) return `salvos associados à ${islandLabel}.`;
    return 'Adicione e arraste para a fase lunar desejada.';
  })();

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-xl shadow-indigo-900/20 backdrop-blur-md"
      role="region"
      aria-label="Painel de tarefas salvas"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropInside?.();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              {headerLabel}
            </p>
            {selectedPhase && (
              <span className="text-lg" title={phaseLabels[selectedPhase]}>
                {getMoonEmoji(selectedPhase)}
              </span>
            )}
          </div>
          <p className="text-[0.75rem] text-slate-400">{headerDescription}</p>

          <ViewButtons
            view={view}
            selectedPhase={selectedPhase}
            activeViewDrop={state.activeViewDrop}
            onViewChange={handleViewChange}
            onDragOver={handleDragOverView}
            onDropOnView={(viewType) => 
              handleDropOnView(viewType, getDateForView, onUpdateTodo)
            }
            onDragLeave={() => dispatch({ type: 'SET_VIEW_DROP', payload: null })}
            onDragEnter={(view) => dispatch({ type: 'SET_VIEW_DROP', payload: view })}
          />

          {/* Moon Phase Indicator */}
          {selectedPhase && (
            <div className="mt-3 flex items-center gap-1.5 text-[0.65rem] text-slate-400">
              <span>Ciclo:</span>
              <div className="flex gap-1">
                {(['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as MoonPhase[]).map((phase) => (
                  <span
                    key={phase}
                    className={`transition ${
                      phase === selectedPhase
                        ? 'text-indigo-300 font-semibold'
                        : phase === getNextPhase(selectedPhase)
                          ? 'text-amber-300 font-semibold'
                          : 'text-slate-500'
                    }`}
                    title={phaseLabels[phase]}
                  >
                    {getMoonEmoji(phase)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <ModeBar
          isEditMode={state.isEditMode}
          isSelectionMode={state.isSelectionMode}
          groupByPhase={state.groupByPhase}
          canEdit={canEdit}
          selectedPhase={selectedPhase}
          inputTypeFilter={inputTypeFilter as 'all' | 'text' | 'checkbox'}
          todoStatusFilter={todoStatusFilter as 'all' | 'completed' | 'open'}
          onToggleEditMode={handleToggleEditMode}
          onToggleSelectionMode={() => setSelectionMode(!state.isSelectionMode)}
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
          onBatchAssignIsland={() => handleBatchAssignIsland(state.batchIsland as IslandId)}
          onBatchMoveToView={handleBatchMoveWithView}
          onBatchIslandChange={setBatchIsland}
        />
      )}

      {/* Todo List */}
      {state.groupByPhase ? (
        <PhaseGroupedTodoList
          displayedTodos={displayedTodos}
          isEditMode={state.isEditMode}
          isSelectionMode={state.isSelectionMode}
          editingTodoId={state.editingTodoId}
          editingText={state.editingText}
          editingCategory={state.editingCategory}
          editingDueDate={state.editingDueDate}
          swipeDeleteId={state.swipeDeleteId}
          selectedTodoIds={state.selectedTodoIds}
          islandNames={islandNames}
          expandedPhases={state.expandedPhases}
          onTogglePhase={togglePhaseExpanded}
          onToggleComplete={onToggleComplete}
          onToggleSelect={toggleSelect}
          onStartEdit={handleStartEditing}
          onUpdateEditText={(text) => dispatch({ type: 'UPDATE_EDITING', payload: { text } })}
          onUpdateEditCategory={(category) => dispatch({ type: 'UPDATE_EDITING', payload: { category } })}
          onUpdateEditDueDate={(dueDate) => dispatch({ type: 'UPDATE_EDITING', payload: { dueDate } })}
          onSaveEdit={handleSaveEditing}
          onCancelEdit={cancelEditing}
          onDelete={onDeleteTodo ?? (() => {})}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={wrappedItemTouchStart}
          onTouchEnd={wrappedItemTouchEnd}
          onTouchMove={onTouchMove}
          onSelectionTouchStart={handleSelectionTouchStart}
          onSelectionTouchMove={handleSelectionTouchMove}
          onSelectionTouchEnd={handleSelectionTouchEnd}
          emptyTitle={selectedPhase ? 'Nada salvo nesta fase' : islandLabel ? 'Nada salvo nesta ilha' : 'Nada salvo'}
          emptyDescription={
            selectedPhase
              ? `Arraste um input para ${phaseLabels[selectedPhase]} ou crie um novo.`
              : islandLabel
                ? `Arraste um input para ${islandLabel} ou crie um novo.`
                : 'Adicione ou selecione uma fase lunar.'
          }
        />
      ) : (
        <TodoList
          todos={filteredTodos}
          displayedTodos={displayedTodos}
          isEditMode={state.isEditMode}
          isSelectionMode={state.isSelectionMode}
          editingTodoId={state.editingTodoId}
          editingText={state.editingText}
          editingCategory={state.editingCategory}
          editingDueDate={state.editingDueDate}
          swipeDeleteId={state.swipeDeleteId}
          selectedTodoIds={state.selectedTodoIds}
          islandNames={islandNames}
          onToggleComplete={onToggleComplete}
          onToggleSelect={toggleSelect}
          onStartEdit={handleStartEditing}
          onUpdateEditText={(text) => dispatch({ type: 'UPDATE_EDITING', payload: { text } })}
          onUpdateEditCategory={(category) => dispatch({ type: 'UPDATE_EDITING', payload: { category } })}
          onUpdateEditDueDate={(dueDate) => dispatch({ type: 'UPDATE_EDITING', payload: { dueDate } })}
          onSaveEdit={handleSaveEditing}
          onCancelEdit={cancelEditing}
          onDelete={onDeleteTodo ?? (() => {})}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={wrappedItemTouchStart}
          onTouchEnd={wrappedItemTouchEnd}
          onTouchMove={onTouchMove}
          onSelectionTouchStart={handleSelectionTouchStart}
          onSelectionTouchMove={handleSelectionTouchMove}
          onSelectionTouchEnd={handleSelectionTouchEnd}
          emptyTitle={selectedPhase ? 'Nada salvo nesta fase' : islandLabel ? 'Nada salvo nesta ilha' : 'Nada salvo'}
          emptyDescription={
            selectedPhase
              ? `Arraste um input para ${phaseLabels[selectedPhase]} ou crie um novo.`
              : islandLabel
                ? `Arraste um input para ${islandLabel} ou crie um novo.`
                : 'Adicione ou selecione uma fase lunar.'
          }
        />
      )}

      {/* Pagination */}
      {filteredTodos.length > ITEMS_PER_PAGE && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, state.currentPage - 1))}
            disabled={state.currentPage === 0}
            className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
              state.currentPage === 0
                ? 'border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                : 'border border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
            title="Página anterior"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-semibold text-slate-300">
              {state.currentPage + 1} / {totalPages}
            </span>
            <span className="text-[0.6rem] text-slate-400">
              ({startIndex + 1}-{Math.min(endIndex, filteredTodos.length)} de {filteredTodos.length})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, state.currentPage + 1))}
            disabled={state.currentPage >= totalPages - 1}
            className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
              state.currentPage >= totalPages - 1
                ? 'border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                : 'border border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
            title="Próxima página"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
};
