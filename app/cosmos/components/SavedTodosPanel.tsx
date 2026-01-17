'use client';

import React, { useCallback, useEffect, } from 'react';
import { useTodoPanelState } from '@/components/todos/useTodoPanelState';
import { TodoList } from '@/components/todos/TodoList';
import { PhaseGroupedTodoList } from '@/components/todos/PhaseGroupedTodoList';
import { TodoFilters } from '@/components/todos/TodoFilters';
import { TodoBatchActions } from '@/components/todos/TodoBatchActions';
import type { SavedTodo, MoonPhase, IslandId } from '../utils/todoStorage';
import {
  isInCurrentCycle,
  isInNextCycle,
  isPhaseOnlyNoDeadline,
  getCurrentCycleStart,
  getCurrentCycleEnd,
  getNextCycleStart,
  getNextCycleEnd,
  toIsoString,
} from '@/lib/phase-cycle-utils';
import { phaseLabels } from '../utils/todoStorage';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '../utils/islandNames';
import type { 
  SavedTodosPanelProps as GroupedProps,
  TodoView,
} from '@/components/todos/types';

// ============================================================================
// LEGACY PROPS (para compatibilidade durante migração)
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

// Suporte a ambos formatos de props
type SavedTodosPanelProps = LegacySavedTodosPanelProps | GroupedProps;

// Type guard para detectar props agrupadas
function isGroupedProps(props: SavedTodosPanelProps): props is GroupedProps {
  return 'todos' in props && 'drag' in props && 'actions' in props;
}

// Normaliza props para formato interno
function normalizeProps(props: SavedTodosPanelProps): LegacySavedTodosPanelProps {
  if (!isGroupedProps(props)) {
    return props;
  }
  
  // Converte props agrupadas para formato legacy (interno)
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

const ITEMS_PER_PAGE = 20;

/**
 * SavedTodosPanel Component (Refatorado v2)
 *
 * Exibe lista de tarefas salvas com:
 * - EmptyState quando não há tarefas
 * - Suporte a drag-and-drop
 * - Filtro opcional por fase lunar
 * - Estados visuais para conclusão
 * 
 * Refatorações:
 * - v1: useReducer para gerenciar 14+ estados
 * - v2: Props agrupadas por domínio + Context interno
 * 
 * Aceita tanto props legacy (flat) quanto agrupadas (grouped)
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

  // Usar novo hook ao invés de 14 useState
  const { state, dispatch, startEditing, cancelEditing, toggleSelect, selectAll, clearSelection, setSelectionMode, setPage, setBatchIsland, togglePhaseExpanded, setGroupByPhase } = useTodoPanelState();
  
  const panelRef = React.useRef<HTMLDivElement>(null);
  const selectionTouchActiveRef = React.useRef(false);
  const selectionTouchModeRef = React.useRef<'select' | 'deselect'>('select');
  const lastTouchedIdRef = React.useRef<string | null>(null);

  // Refs para rastrear gestos (sem chamar hooks dentro do map)
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const doubleTapTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const canEdit = Boolean(onUpdateTodo);

  // === Handlers de Filtro ===
  const handleViewChange = useCallback((
    nextView: 'todos' | 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo'
  ) => {
    onViewChange?.(nextView);
    setPage(0);
  }, [onViewChange, setPage]);

  // === Lógica de Filtragem ===
  const getDateForView = (viewType: string): string | undefined => {
    const today = new Date();

    if (viewType === 'lua-atual') {
      const date = new Date(today);
      date.setDate(today.getDate() + 4);
      return date.toISOString().split('T')[0];
    } else if (viewType === 'proxima-fase') {
      const date = new Date(today);
      date.setDate(today.getDate() + 12);
      return date.toISOString().split('T')[0];
    } else if (viewType === 'proximo-ciclo') {
      const date = new Date(today);
      date.setMonth(today.getMonth() + 1);
      date.setDate(1);
      return date.toISOString().split('T')[0];
    }
    return undefined;
  };

  const getNextPhase = (phase: MoonPhase): MoonPhase => {
    const phases: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  /**
   * Filtra tarefas pela cronologia/ciclo lunar
   * Suporta:
   * - 'todos': Todas as tarefas
   * - 'em-aberto': Sem fase, sem prazo, sem ilha
   * - 'lua-atual': Com phaseCycle === 'current'
   * - 'proxima-fase': Com phaseCycle === 'next'
   * - 'proximo-ciclo': Com phaseCycle === 'next' (alias para próxima fase)
   */
  const getFilteredTodosByChronology = (
    todos: SavedTodo[],
    view: string | undefined,
    currentPhase: MoonPhase | null | undefined
  ): SavedTodo[] => {
    if (view === 'todos') return todos;
    
    if (view === 'em-aberto') {
      return todos.filter((todo) => !todo.phase && !todo.dueDate && !todo.islandId);
    }
    
    // Lua atual: apenas tarefas com phaseCycle === 'current'
    if (view === 'lua-atual') {
      return todos.filter((todo) => {
        if (!todo.phase) return false;
        return isInCurrentCycle(todo);
      });
    }
    
    // Próxima fase e próximo ciclo: tarefas com phaseCycle === 'next'
    if (view === 'proxima-fase' || view === 'proximo-ciclo') {
      return todos.filter((todo) => {
        if (!todo.phase) return false;
        return isInNextCycle(todo);
      });
    }

    return todos;
  };

  // Filtrar tarefas
  const phaseFilter = view === 'em-aberto' ? null : selectedPhase;
  const islandFilter = view === 'em-aberto' ? null : selectedIsland;
  let filteredTodos = savedTodos
    .filter((todo) => (phaseFilter ? todo.phase === phaseFilter : true))
    .filter((todo) => (islandFilter ? todo.islandId === islandFilter : true));

  filteredTodos = getFilteredTodosByChronology(filteredTodos, view, selectedPhase);

  // Paginação
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const startIndex = state.currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTodos = filteredTodos.slice(startIndex, endIndex);

  const selectedCount = state.selectedTodoIds.length;
  const allDisplayedSelected =
    displayedTodos.length > 0 && displayedTodos.every((todo) => state.selectedTodoIds.includes(todo.id));

  // === Effects ===
  useEffect(() => {
    setPage(0);
  }, [selectedPhase, selectedIsland, setPage]);

  useEffect(() => {
    dispatch({
      type: 'SELECT_ALL',
      payload: state.selectedTodoIds.filter((id) => savedTodos.some((todo) => todo.id === id)),
    });
  }, [savedTodos]);

  // === Handlers de Edição ===
  const handleToggleEditMode = useCallback(() => {
    if (!canEdit) return;
    dispatch({ type: 'SET_EDIT_MODE', payload: !state.isEditMode });
  }, [canEdit, state.isEditMode]);

  const handleToggleEditOrSelectionMode = useCallback(() => {
    if (!canEdit) return;
    // Ativa/desativa AMBOS os modos simultaneamente
    const isActive = state.isEditMode && state.isSelectionMode;
    dispatch({ type: 'SET_EDIT_MODE', payload: !isActive });
    setSelectionMode(!isActive);
  }, [canEdit, state.isEditMode, state.isSelectionMode, setSelectionMode]);

  const handleStartEditing = useCallback((todo: SavedTodo) => {
    if (!canEdit) return;
    startEditing(todo.id, todo.text, todo.category, todo.dueDate);
  }, [canEdit, startEditing]);

  const handleSaveEditing = useCallback((todo: SavedTodo) => {
    if (!onUpdateTodo) return;
    const trimmedText = state.editingText.trim();
    if (!trimmedText) return;
    onUpdateTodo(todo.id, {
      text: trimmedText,
      category: state.editingCategory.trim() || undefined,
      dueDate: state.editingDueDate || undefined,
    });
    cancelEditing();
  }, [onUpdateTodo, state.editingText, state.editingCategory, state.editingDueDate, cancelEditing]);

  const handleUpdateEditText = useCallback((text: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { text } });
  }, []);

  const handleUpdateEditCategory = useCallback((category: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { category } });
  }, []);

  const handleUpdateEditDueDate = useCallback((dueDate: string) => {
    dispatch({ type: 'UPDATE_EDITING', payload: { dueDate } });
  }, []);

  // === Handlers de Seleção ===
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
  }, [displayedTodos, state.selectedTodoIds]);

  const handleBatchDelete = useCallback(() => {
    if (selectedCount === 0 || !onBatchDelete) return;
    onBatchDelete(state.selectedTodoIds);
    clearSelection();
  }, [selectedCount, onBatchDelete, state.selectedTodoIds, clearSelection]);

  const handleBatchAssignPhase = useCallback((phase: MoonPhase) => {
    if (selectedCount === 0 || !onBatchAssignPhase) return;
    onBatchAssignPhase(state.selectedTodoIds, phase);
  }, [selectedCount, onBatchAssignPhase, state.selectedTodoIds]);

  const handleBatchAssignIsland = useCallback(() => {
    if (!state.batchIsland || selectedCount === 0 || !onBatchAssignIsland) return;
    onBatchAssignIsland(state.selectedTodoIds, state.batchIsland as IslandId);
  }, [state.batchIsland, selectedCount, onBatchAssignIsland, state.selectedTodoIds]);

  const handleBatchMoveToView = useCallback((
    viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo'
  ) => {
    if (selectedCount === 0 || !onUpdateTodo) return;
    handleViewChange(viewType);
    if (viewType === 'em-aberto') {
      state.selectedTodoIds.forEach((id) => {
        onUpdateTodo(id, { dueDate: undefined, phase: undefined, islandId: undefined });
      });
      return;
    }
    const dueDate = getDateForView(viewType);
    if (!dueDate) return;
    state.selectedTodoIds.forEach((id) => {
      onUpdateTodo(id, { dueDate });
    });
  }, [selectedCount, onUpdateTodo, handleViewChange, state.selectedTodoIds]);

  // === Handlers de Drag ===
  const getDragTodoIds = useCallback((todoId: string) => {
    if (state.isSelectionMode && state.selectedTodoIds.includes(todoId) && state.selectedTodoIds.length > 0) {
      return state.selectedTodoIds;
    }
    return [todoId];
  }, [state.isSelectionMode, state.selectedTodoIds]);

  const handleDropOnView = useCallback(
    (viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') =>
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const rawTodoIds = event.dataTransfer.getData('text/todo-ids');
      let todoIds: string[] = [];
      if (rawTodoIds) {
        try {
          const parsed = JSON.parse(rawTodoIds);
          if (Array.isArray(parsed)) {
            todoIds = parsed.filter((id) => typeof id === 'string');
          }
        } catch (error) {
          console.warn('Falha ao ler seleção de to-dos:', error);
        }
      }

      if (todoIds.length === 0) {
        const todoId = event.dataTransfer.getData('text/todo-id');
        if (todoId) todoIds = [todoId];
      }

      if (todoIds.length === 0) return;

      handleViewChange(viewType);

      if (viewType !== 'em-aberto' && onUpdateTodo) {
        const dueDate = getDateForView(viewType);
        if (dueDate) {
          todoIds.forEach((id) => {
            const todo = savedTodos.find((t) => t.id === id);
            if (todo) {
              onUpdateTodo(id, { dueDate });
            }
          });
        }
      } else if (viewType === 'em-aberto' && onUpdateTodo) {
        todoIds.forEach((id) => {
          const todo = savedTodos.find((t) => t.id === id);
          if (todo) {
            onUpdateTodo(id, { dueDate: undefined, phase: undefined, islandId: undefined });
          }
        });
      }

      dispatch({ type: 'SET_VIEW_DROP', payload: null });
    },
    [savedTodos, handleViewChange, onUpdateTodo]
  );

  const handleDragOverView = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // === Handlers de Touch ===
  const handleItemTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleItemTouchEnd = (todoId: string) => (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const duration = Date.now() - touchStartRef.current.time;
    const distX = touch.clientX - touchStartRef.current.x;
    const distY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance >= 40 && duration <= 400) {
      if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 0) {
          onToggleComplete(todoId);
        } else {
          dispatch({ type: 'SET_SWIPE_DELETE', payload: todoId });
        }
      }
    } else if (distance < 30 && duration < 300) {
      const now = Date.now();
      if (lastTapRef.current) {
        const timeSinceLastTap = now - lastTapRef.current.time;
        const distFromLastTap = Math.sqrt(
          Math.pow(touch.clientX - lastTapRef.current.x, 2) +
            Math.pow(touch.clientY - lastTapRef.current.y, 2)
        );

        if (timeSinceLastTap < 300 && distFromLastTap < 50) {
          if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
          const todo = savedTodos.find((t) => t.id === todoId);
          if (todo) handleStartEditing(todo);
          lastTapRef.current = null;
        } else {
          lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        }
      } else {
        lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = setTimeout(() => {
          lastTapRef.current = null;
        }, 500);
      }
    }

    touchStartRef.current = null;
  };

  const applySelectionForId = (todoId: string, mode: 'select' | 'deselect') => {
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
  };

  const handleSelectionTouchStart = (todoId: string, event: React.TouchEvent) => {
    if (!state.isSelectionMode) return;
    event.preventDefault();
    const isSelected = state.selectedTodoIds.includes(todoId);
    const mode: 'select' | 'deselect' = isSelected ? 'deselect' : 'select';
    selectionTouchActiveRef.current = true;
    selectionTouchModeRef.current = mode;
    lastTouchedIdRef.current = todoId;
    applySelectionForId(todoId, mode);
  };

  const handleSelectionTouchMove = (event: React.TouchEvent) => {
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
  };

  const handleSelectionTouchEnd = () => {
    selectionTouchActiveRef.current = false;
    lastTouchedIdRef.current = null;
  };

  // === Render Props ===
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

  const headerLabel = (() => {
    if (view === 'todos') {
      if (selectedPhase && islandLabel) {
        return `todos - ${phaseLabels[selectedPhase]} • ${islandLabel}`;
      }
      if (selectedPhase) {
        return `todos - ${phaseLabels[selectedPhase]}`;
      }
      if (islandLabel) {
        return `todos - ${islandLabel}`;
      }
      return 'todos';
    }
    if (selectedPhase && islandLabel) {
      return `salvos - ${phaseLabels[selectedPhase]} • ${islandLabel}`;
    }
    if (selectedPhase) {
      return `salvos - ${phaseLabels[selectedPhase]}`;
    }
    if (islandLabel) {
      return `salvos - ${islandLabel}`;
    }
    return 'salvos';
  })();

  const headerDescription = (() => {
    if (view === 'todos') {
      if (selectedPhase && islandLabel) {
        return `todos associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
      }
      if (selectedPhase) {
        return `todos associados à fase: ${phaseLabels[selectedPhase]}`;
      }
      if (islandLabel) {
        return `todos associados à ${islandLabel}.`;
      }
      return 'Todas as tarefas salvas.';
    }
    if (selectedPhase && islandLabel) {
      return `salvos associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
    }
    if (selectedPhase) {
      return `salvos associados à fase: ${phaseLabels[selectedPhase]}`;
    }
    if (islandLabel) {
      return `salvos associados à ${islandLabel}.`;
    }
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

          {/* View Buttons */}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleViewChange('todos')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                view === 'todos'
                  ? 'border border-slate-300/80 bg-slate-500/20 text-slate-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-400/60'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onDragOver={handleDragOverView}
              onDrop={handleDropOnView('em-aberto')}
              onDragLeave={() => dispatch({ type: 'SET_VIEW_DROP', payload: null })}
              onDragEnter={() => dispatch({ type: 'SET_VIEW_DROP', payload: 'em-aberto' })}
              onClick={() => handleViewChange('em-aberto')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                state.activeViewDrop === 'em-aberto'
                  ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950'
                  : ''
              } ${
                view === 'em-aberto'
                  ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60'
              }`}
            >
              Em aberto
            </button>
            <button
              type="button"
              onDragOver={handleDragOverView}
              onDrop={handleDropOnView('lua-atual')}
              onDragLeave={() => dispatch({ type: 'SET_VIEW_DROP', payload: null })}
              onDragEnter={() => dispatch({ type: 'SET_VIEW_DROP', payload: 'lua-atual' })}
              onClick={() => handleViewChange('lua-atual')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                state.activeViewDrop === 'lua-atual'
                  ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950'
                  : ''
              } ${
                view === 'lua-atual'
                  ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60'
              }`}
            >
              Lua atual
            </button>
            <button
              type="button"
              onDragOver={handleDragOverView}
              onDrop={handleDropOnView('proxima-fase')}
              onDragLeave={() => dispatch({ type: 'SET_VIEW_DROP', payload: null })}
              onDragEnter={() => dispatch({ type: 'SET_VIEW_DROP', payload: 'proxima-fase' })}
              onClick={() => handleViewChange('proxima-fase')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${
                state.activeViewDrop === 'proxima-fase'
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950'
                  : ''
              } ${
                view === 'proxima-fase'
                  ? 'border border-amber-300/80 bg-amber-500/20 text-amber-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-400/60'
              }`}
              title={
                selectedPhase
                  ? `Próxima fase: ${phaseLabels[getNextPhase(selectedPhase)]}`
                  : 'Próxima fase lunar'
              }
            >
              <span className="text-sm">
                {selectedPhase ? getMoonEmoji(getNextPhase(selectedPhase)) : '🌙'}
              </span>
              <span>Próxima fase</span>
            </button>
            <button
              type="button"
              onDragOver={handleDragOverView}
              onDrop={handleDropOnView('proximo-ciclo')}
              onDragLeave={() => dispatch({ type: 'SET_VIEW_DROP', payload: null })}
              onDragEnter={() => dispatch({ type: 'SET_VIEW_DROP', payload: 'proximo-ciclo' })}
              onClick={() => handleViewChange('proximo-ciclo')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${
                state.activeViewDrop === 'proximo-ciclo'
                  ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950'
                  : ''
              } ${
                view === 'proximo-ciclo'
                  ? 'border border-rose-300/80 bg-rose-500/20 text-rose-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-rose-400/60'
              }`}
            >
              <span>📅</span>
              <span>Próximo ciclo</span>
            </button>
          </div>

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

        {/* Mode Buttons */}
        <div className="flex flex-col items-end gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={handleToggleEditOrSelectionMode}
              aria-pressed={state.isEditMode && state.isSelectionMode}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
                state.isEditMode && state.isSelectionMode
                  ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-300/60'
              }`}
              title={
                state.isEditMode && state.isSelectionMode
                  ? 'Desativar edição e seleção'
                  : 'Ativar edição e seleção'
              }
            >
              ✏️
            </button>
          )}
          <button
            type="button"
            onClick={() => setGroupByPhase(!state.groupByPhase)}
            aria-pressed={state.groupByPhase}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
              state.groupByPhase
                ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-300/60'
            }`}
            title={state.groupByPhase ? 'Ver lista simples' : 'Agrupar por fase lunar'}
          >
            🌙
          </button>
          <TodoFilters
            inputTypeFilter={inputTypeFilter as 'all' | 'text' | 'checkbox'}
            todoStatusFilter={todoStatusFilter as 'all' | 'completed' | 'open'}
            onInputTypeFilterChange={onInputTypeFilterChange}
            onTodoStatusFilterChange={onTodoStatusFilterChange}
          />
        </div>
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

      {/* Todo List - Agrupado por fase ou lista simples */}
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
          onUpdateEditText={handleUpdateEditText}
          onUpdateEditCategory={handleUpdateEditCategory}
          onUpdateEditDueDate={handleUpdateEditDueDate}
          onSaveEdit={handleSaveEditing}
          onCancelEdit={cancelEditing}
          onDelete={onDeleteTodo ?? (() => {})}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchMove={onTouchMove}
          onSelectionTouchStart={handleSelectionTouchStart}
          onSelectionTouchMove={handleSelectionTouchMove}
          onSelectionTouchEnd={handleSelectionTouchEnd}
          emptyTitle={
            selectedPhase
              ? 'Nada salvo nesta fase'
              : islandLabel
                ? 'Nada salvo nesta ilha'
                : 'Nada salvo'
          }
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
          onUpdateEditText={handleUpdateEditText}
          onUpdateEditCategory={handleUpdateEditCategory}
          onUpdateEditDueDate={handleUpdateEditDueDate}
          onSaveEdit={handleSaveEditing}
          onCancelEdit={cancelEditing}
          onDelete={onDeleteTodo ?? (() => {})}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchMove={onTouchMove}
          onSelectionTouchStart={handleSelectionTouchStart}
          onSelectionTouchMove={handleSelectionTouchMove}
          onSelectionTouchEnd={handleSelectionTouchEnd}
          emptyTitle={
            selectedPhase
              ? 'Nada salvo nesta fase'
              : islandLabel
                ? 'Nada salvo nesta ilha'
                : 'Nada salvo'
          }
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
              ({startIndex + 1}-{Math.min(endIndex, filteredTodos.length)} de {filteredTodos.length}
              )
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
