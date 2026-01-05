'use client';

import React from 'react';
import { EmptyState } from './EmptyState';
import type { SavedTodo, MoonPhase, IslandId } from '../utils/todoStorage';
import { phaseLabels } from '../utils/todoStorage';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '../utils/islandNames';

interface SavedTodosPanelProps {
  savedTodos: SavedTodo[];
  view?: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo';
  onViewChange?: (view: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => void;
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onTouchStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchEnd?: () => void;
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

/**
 * SavedTodosPanel Component
 *
 * Exibe lista de tarefas salvass com:
 * - EmptyState quando não há tarefas
 * - Suporte a drag-and-drop
 * - Filtro opcional por fase lunar
 * - Estados visuais para conclusão
 */
export const SavedTodosPanel: React.FC<SavedTodosPanelProps> = ({
  savedTodos,
  view = 'em-aberto',
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
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const filterLabel =
    inputTypeFilter === 'text' ? 'Texto' : inputTypeFilter === 'checkbox' ? 'To-dos' : null;
  const statusLabel =
    inputTypeFilter === 'checkbox' && todoStatusFilter !== 'all'
      ? todoStatusFilter === 'completed'
        ? 'Completas'
        : 'Em aberto'
      : null;
  const canEdit = Boolean(onUpdateTodo);
  const isTextFilter = inputTypeFilter === 'text';
  const isTodoFilter = inputTypeFilter === 'checkbox';
  const isOpenFilter = todoStatusFilter === 'open';
  const isCompletedFilter = todoStatusFilter === 'completed';
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState('');
  const [editingCategory, setEditingCategory] = React.useState('');
  const [editingDueDate, setEditingDueDate] = React.useState('');
  const [swipeDeleteId, setSwipeDeleteId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [activeViewDrop, setActiveViewDrop] = React.useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedTodoIds, setSelectedTodoIds] = React.useState<string[]>([]);
  const [batchIsland, setBatchIsland] = React.useState<IslandId | ''>('');
  const ITEMS_PER_PAGE = 20;
  const selectionTouchActiveRef = React.useRef(false);
  const selectionTouchModeRef = React.useRef<'select' | 'deselect'>('select');
  const lastTouchedIdRef = React.useRef<string | null>(null);

  // Refs para rastrear gestos (sem chamar hooks dentro do map)
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const doubleTapTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTextFilter = () => {
    const nextFilter = inputTypeFilter === 'text' ? 'all' : 'text';
    onInputTypeFilterChange?.(nextFilter);
  };

  const handleTodoFilter = () => {
    const nextFilter = inputTypeFilter === 'checkbox' ? 'all' : 'checkbox';
    onInputTypeFilterChange?.(nextFilter);
  };
  const handleTodoStatusFilter = (status: 'open' | 'completed') => {
    const nextStatus = todoStatusFilter === status ? 'all' : status;
    onTodoStatusFilterChange?.(nextStatus);
  };
  const handleViewChange = (nextView: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => {
    onViewChange?.(nextView);
  };

  /**
   * Calcula a data apropriada baseado na visão/cronologia
   */
  const getDateForView = (viewType: string): string | undefined => {
    const today = new Date();

    if (viewType === 'lua-atual') {
      // Prazo até próxima fase (7 dias)
      const date = new Date(today);
      date.setDate(today.getDate() + 4);
      return date.toISOString().split('T')[0];
    } else if (viewType === 'proxima-fase') {
      // Prazo para próxima fase (12 dias)
      const date = new Date(today);
      date.setDate(today.getDate() + 12);
      return date.toISOString().split('T')[0];
    } else if (viewType === 'proximo-ciclo') {
      // Primeiro dia do próximo mês
      const date = new Date(today);
      date.setMonth(today.getMonth() + 1);
      date.setDate(1);
      return date.toISOString().split('T')[0];
    }

    return undefined;
  };

  /**
   * Handler para quando input é solto em uma visão
   */
  const handleDropOnView =
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

      // Mudar a visão
      handleViewChange(viewType);

      // Se não for em-aberto, atualizar a data do input
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

      setActiveViewDrop(null);
    };

  /**
   * Handler para drag over em visão
   */
  const handleDragOverView = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  /**
   * Calcula a próxima fase lunar
   */
  const getNextPhase = (phase: MoonPhase): MoonPhase => {
    const phases: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  /**
   * Filtra inputs por data de vencimento baseado na fase lunar atual
   * - 'lua-atual': mostra inputs com prazo até a próxima fase lunar
   * - 'proxima-fase': mostra inputs com prazo até o final da próxima fase lunar
   * - 'proximo-ciclo': mostra inputs com prazo para o mês seguinte
   */
  const getFilteredTodosByChronology = (
    todos: SavedTodo[],
    view: string | undefined,
    currentPhase: MoonPhase | null | undefined
  ): SavedTodo[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (view === 'em-aberto') {
      return todos.filter((todo) => !todo.phase && !todo.dueDate && !todo.islandId);
    }
    if (view === 'lua-atual' && currentPhase) {
      // Até próxima fase (aprox. 7-8 dias)
      const nextPhaseDate = new Date(today);
      nextPhaseDate.setDate(today.getDate() + 8);
      const nextPhaseDateStr = nextPhaseDate.toISOString().split('T')[0];

      return todos.filter(
        (todo) => !todo.dueDate || (todo.dueDate >= todayStr && todo.dueDate <= nextPhaseDateStr)
      );
    } else if (view === 'proxima-fase' && currentPhase) {
      // Próxima fase + fim dela (aprox. 8-16 dias)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 8);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 8);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      return todos.filter(
        (todo) => !todo.dueDate || (todo.dueDate >= startStr && todo.dueDate <= endStr)
      );
    } else if (view === 'proximo-ciclo') {
      // Mês seguinte
      const nextMonthStart = new Date(today);
      nextMonthStart.setMonth(today.getMonth() + 1);
      nextMonthStart.setDate(1);

      const nextMonthEnd = new Date(nextMonthStart);
      nextMonthEnd.setMonth(nextMonthStart.getMonth() + 1);
      nextMonthEnd.setDate(0);

      const startStr = nextMonthStart.toISOString().split('T')[0];
      const endStr = nextMonthEnd.toISOString().split('T')[0];

      return todos.filter(
        (todo) => todo.dueDate && todo.dueDate >= startStr && todo.dueDate <= endStr
      );
    }

    return todos;
  };

  const resetEditingState = () => {
    setEditingTodoId(null);
    setEditingText('');
    setEditingCategory('');
    setEditingDueDate('');
  };

  const handleToggleEditMode = () => {
    if (!canEdit) return;
    setIsEditMode((prev) => {
      const next = !prev;
      if (!next) {
        resetEditingState();
      }
      return next;
    });
  };

  const handleStartEditing = (todo: SavedTodo) => {
    if (!canEdit) return;
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
    setEditingCategory(todo.category ?? '');
    setEditingDueDate(todo.dueDate ?? '');
  };

  const handleCancelEditing = () => {
    resetEditingState();
  };

  const handleSaveEditing = (todo: SavedTodo) => {
    if (!onUpdateTodo) return;
    const trimmedText = editingText.trim();
    if (!trimmedText) return;
    onUpdateTodo(todo.id, {
      text: trimmedText,
      category: editingCategory.trim() || undefined,
      dueDate: editingDueDate || undefined,
    });
    resetEditingState();
  };

  // Detectar gestos (swipes e double-tap) sem chamar hooks dentro do map
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

    // Detectar swipes: movement significativo e rápido (< 400ms)
    if (distance >= 40 && duration <= 400) {
      // Swipe horizontal
      if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 0) {
          // Swipe para direita: marcar como completo
          onToggleComplete(todoId);
        } else {
          // Swipe para esquerda: mostrar botão de deletar
          setSwipeDeleteId(todoId);
        }
      }
    }
    // Detectar double-tap: dois toques rápidos e próximos
    else if (distance < 30 && duration < 300) {
      const now = Date.now();
      if (lastTapRef.current) {
        const timeSinceLastTap = now - lastTapRef.current.time;
        const distFromLastTap = Math.sqrt(
          Math.pow(touch.clientX - lastTapRef.current.x, 2) +
            Math.pow(touch.clientY - lastTapRef.current.y, 2)
        );

        if (timeSinceLastTap < 300 && distFromLastTap < 50) {
          // Double-tap detectado: ativar modo edição
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

  // Filtrar tarefas por fase e ilha se estiverem selecionadas
  const islandFilter = view === 'em-aberto' ? null : selectedIsland;
  let filteredTodos = savedTodos
    .filter((todo) => (selectedPhase ? todo.phase === selectedPhase : true))
    .filter((todo) => (islandFilter ? todo.islandId === islandFilter : true));

  // Aplicar filtro de cronologia (datas de vencimento)
  filteredTodos = getFilteredTodosByChronology(filteredTodos, view, selectedPhase);

  // Aplicar paginação
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTodos = filteredTodos.slice(startIndex, endIndex);
  const selectedCount = selectedTodoIds.length;
  const allDisplayedSelected =
    displayedTodos.length > 0 && displayedTodos.every((todo) => selectedTodoIds.includes(todo.id));

  // Reset página se mudar filtro
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedPhase, selectedIsland]);

  React.useEffect(() => {
    setSelectedTodoIds((prev) => prev.filter((id) => savedTodos.some((todo) => todo.id === id)));
  }, [savedTodos]);

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedTodoIds([]);
        setBatchIsland('');
      }
      return next;
    });
  };

  const toggleTodoSelection = (todoId: string) => {
    setSelectedTodoIds((prev) =>
      prev.includes(todoId) ? prev.filter((id) => id !== todoId) : [...prev, todoId]
    );
  };

  const handleToggleSelectDisplayed = () => {
    if (displayedTodos.length === 0) return;
    if (allDisplayedSelected) {
      setSelectedTodoIds((prev) => prev.filter((id) => !displayedTodos.some((todo) => todo.id === id)));
      return;
    }
    const displayedIds = displayedTodos.map((todo) => todo.id);
    setSelectedTodoIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
  };

  const handleBatchDelete = () => {
    if (selectedCount === 0 || !onBatchDelete) return;
    onBatchDelete(selectedTodoIds);
    setSelectedTodoIds([]);
  };

  const handleBatchAssignPhase = (phase: MoonPhase) => {
    if (selectedCount === 0 || !onBatchAssignPhase) return;
    onBatchAssignPhase(selectedTodoIds, phase);
  };

  const handleBatchAssignIsland = () => {
    if (!batchIsland || selectedCount === 0 || !onBatchAssignIsland) return;
    onBatchAssignIsland(selectedTodoIds, batchIsland);
  };

  const handleBatchMoveToView = (
    viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo'
  ) => {
    if (selectedCount === 0 || !onUpdateTodo) return;
    handleViewChange(viewType);
    if (viewType === 'em-aberto') {
      selectedTodoIds.forEach((id) => {
        onUpdateTodo(id, { dueDate: undefined, phase: undefined, islandId: undefined });
      });
      return;
    }
    const dueDate = getDateForView(viewType);
    if (!dueDate) return;
    selectedTodoIds.forEach((id) => {
      onUpdateTodo(id, { dueDate });
    });
  };

  const getDragTodoIds = (todoId: string) => {
    if (isSelectionMode && selectedTodoIds.includes(todoId) && selectedTodoIds.length > 0) {
      return selectedTodoIds;
    }
    return [todoId];
  };

  const applySelectionForId = (todoId: string, mode: 'select' | 'deselect') => {
    setSelectedTodoIds((prev) => {
      const hasId = prev.includes(todoId);
      if (mode === 'select') {
        if (hasId) return prev;
        return [...prev, todoId];
      }
      if (!hasId) return prev;
      return prev.filter((id) => id !== todoId);
    });
  };

  const handleSelectionTouchStart = (todoId: string, event: React.TouchEvent) => {
    if (!isSelectionMode) return;
    event.preventDefault();
    const isSelected = selectedTodoIds.includes(todoId);
    const mode: 'select' | 'deselect' = isSelected ? 'deselect' : 'select';
    selectionTouchActiveRef.current = true;
    selectionTouchModeRef.current = mode;
    lastTouchedIdRef.current = todoId;
    applySelectionForId(todoId, mode);
  };

  const handleSelectionTouchMove = (event: React.TouchEvent) => {
    if (!isSelectionMode || !selectionTouchActiveRef.current) return;
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

  const headerLabel = (() => {
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

  const visibleIslandIds = islandIds && islandIds.length > 0 ? islandIds : ISLAND_IDS;

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
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onDragOver={handleDragOverView}
              onDrop={handleDropOnView('em-aberto')}
              onDragLeave={() => setActiveViewDrop(null)}
              onDragEnter={() => setActiveViewDrop('em-aberto')}
              onClick={() => handleViewChange('em-aberto')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                activeViewDrop === 'em-aberto'
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
              onDragLeave={() => setActiveViewDrop(null)}
              onDragEnter={() => setActiveViewDrop('lua-atual')}
              onClick={() => handleViewChange('lua-atual')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                activeViewDrop === 'lua-atual'
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
              onDragLeave={() => setActiveViewDrop(null)}
              onDragEnter={() => setActiveViewDrop('proxima-fase')}
              onClick={() => handleViewChange('proxima-fase')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${
                activeViewDrop === 'proxima-fase'
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
              onDragLeave={() => setActiveViewDrop(null)}
              onDragEnter={() => setActiveViewDrop('proximo-ciclo')}
              onClick={() => handleViewChange('proximo-ciclo')}
              className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${
                activeViewDrop === 'proximo-ciclo'
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
          {selectedPhase && (
            <div className="mt-3 flex items-center gap-1.5 text-[0.65rem] text-slate-400">
              <span>Ciclo:</span>
              <div className="flex gap-1">
                {['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'].map((phase) => (
                  <span
                    key={phase}
                    className={`transition ${
                      phase === selectedPhase
                        ? 'text-indigo-300 font-semibold'
                        : phase === getNextPhase(selectedPhase)
                          ? 'text-amber-300 font-semibold'
                          : 'text-slate-500'
                    }`}
                    title={phaseLabels[phase as MoonPhase]}
                  >
                    {getMoonEmoji(phase as MoonPhase)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(filterLabel || statusLabel) && (
            <div className="mt-2 flex flex-wrap gap-2 text-[0.6rem] text-slate-300">
              {filterLabel && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                  {filterLabel}
                </span>
              )}
              {statusLabel && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                  {statusLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={handleToggleEditMode}
              aria-pressed={isEditMode}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
                isEditMode
                  ? 'border border-amber-300/80 bg-amber-500/20 text-amber-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60'
              }`}
              title={isEditMode ? 'Sair do modo edição' : 'Editar inputs'}
            >
              ✏️
            </button>
          )}
          <button
            type="button"
            onClick={toggleSelectionMode}
            aria-pressed={isSelectionMode}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
              isSelectionMode
                ? 'border border-emerald-300/80 bg-emerald-500/20 text-emerald-100'
                : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-300/60'
            }`}
            title={isSelectionMode ? 'Sair da seleção múltipla' : 'Selecionar múltiplos inputs'}
          >
            ⬚
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTextFilter}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold transition ${
                isTextFilter
                  ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60'
              }`}
              title="Inputs de texto"
            >
              T
            </button>
            <button
              type="button"
              onClick={handleTodoFilter}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                isTodoFilter
                  ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                  : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60'
              }`}
              title="To-dos (abertas e completas)"
            >
              ✔️
            </button>
          </div>
          {isTodoFilter && (
            <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-1 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-slate-300">
              <button
                type="button"
                onClick={() => handleTodoStatusFilter('open')}
                className={`rounded-full px-2 py-1 transition ${
                  isOpenFilter
                    ? 'bg-indigo-500/30 text-indigo-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mostrar tarefas em aberto"
              >
                Em aberto
              </button>
              <button
                type="button"
                onClick={() => handleTodoStatusFilter('completed')}
                className={`rounded-full px-2 py-1 transition ${
                  isCompletedFilter
                    ? 'bg-indigo-500/30 text-indigo-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mostrar tarefas completas"
              >
                Completas
              </button>
            </div>
          )}
        </div>
      </div>
      {isSelectionMode && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-[0.65rem] text-slate-300">
          <span>{selectedCount === 0 ? 'Nenhum selecionado' : `${selectedCount} selecionado(s)`}</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToggleSelectDisplayed}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500"
            >
              {allDisplayedSelected ? 'Limpar página' : 'Selecionar página'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedTodoIds([])}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500"
            >
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={selectedCount === 0 || !onBatchDelete}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !onBatchDelete
                  ? 'border-slate-700 bg-slate-900/60 text-slate-500'
                  : 'border-red-400/60 bg-red-500/20 text-red-100 hover:bg-red-500/30'
              }`}
            >
              Excluir selecionados
            </button>
          </div>
        </div>
      )}
      {isSelectionMode && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-[0.6rem] text-slate-300">
          <span className="uppercase tracking-[0.18em] text-slate-400">Mover para</span>
          <div className="flex flex-wrap gap-2">
            {(['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as MoonPhase[]).map(
              (phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => handleBatchAssignPhase(phase)}
                  disabled={selectedCount === 0 || !onBatchAssignPhase}
                  className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                    selectedCount === 0 || !onBatchAssignPhase
                      ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                      : 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                  }`}
                  title={`Mover para ${phaseLabels[phase]}`}
                >
                  {phaseLabels[phase]}
                </button>
              )
            )}
          </div>
          {visibleIslandIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={batchIsland}
                onChange={(event) => setBatchIsland(event.target.value as IslandId | '')}
                className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-200 focus:border-indigo-400 focus:outline-none"
              >
                <option value="">Ilha</option>
                {visibleIslandIds.map((islandId) => (
                  <option key={islandId} value={islandId}>
                    {getIslandLabel(islandId, islandNames) ?? islandId}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBatchAssignIsland}
                disabled={selectedCount === 0 || !batchIsland || !onBatchAssignIsland}
                className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                  selectedCount === 0 || !batchIsland || !onBatchAssignIsland
                    ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                    : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                }`}
              >
                Aplicar ilha
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleBatchMoveToView('em-aberto')}
              disabled={selectedCount === 0 || !onUpdateTodo}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !onUpdateTodo
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-slate-400/60 bg-slate-500/20 text-slate-100 hover:bg-slate-500/30'
              }`}
            >
              Em aberto
            </button>
            <button
              type="button"
              onClick={() => handleBatchMoveToView('lua-atual')}
              disabled={selectedCount === 0 || !onUpdateTodo}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !onUpdateTodo
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
              }`}
            >
              Lua atual
            </button>
            <button
              type="button"
              onClick={() => handleBatchMoveToView('proxima-fase')}
              disabled={selectedCount === 0 || !onUpdateTodo}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !onUpdateTodo
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-amber-400/60 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
              }`}
            >
              Próxima fase
            </button>
            <button
              type="button"
              onClick={() => handleBatchMoveToView('proximo-ciclo')}
              disabled={selectedCount === 0 || !onUpdateTodo}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !onUpdateTodo
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-rose-400/60 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
              }`}
            >
              Próximo ciclo
            </button>
          </div>
        </div>
      )}

      <div
        className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 sm:max-h-[70vh] lg:max-h-[75vh]"
        onTouchMove={handleSelectionTouchMove}
        onTouchEnd={handleSelectionTouchEnd}
        onTouchCancel={handleSelectionTouchEnd}
      >
        {displayedTodos.length === 0 ? (
          <EmptyState
            title={
              selectedPhase
                ? 'Nada salvo nesta fase'
                : islandLabel
                  ? 'Nada salvo nesta ilha'
                  : 'Nada salvo'
            }
            description={
              selectedPhase
                ? `Arraste um input para ${phaseLabels[selectedPhase]} ou crie um novo.`
                : islandLabel
                  ? `Arraste um input para ${islandLabel} ou crie um novo.`
                  : 'Adcione ou selecione uma fase lunar.'
            }
            icon="✨"
          />
        ) : (
          displayedTodos.map((todo) => {
            const islandLabel = getIslandLabel(todo.islandId, islandNames);
            const isCheckbox = todo.inputType === 'checkbox';
            const isCompleted = isCheckbox && todo.completed;
            const showMeta =
              todo.inputType === 'text' || todo.category || todo.dueDate || islandLabel;
            const isEditing = editingTodoId === todo.id;
            const canDrag = !isEditMode;
            const isSaveDisabled = !editingText.trim();
            const isSelected = selectedTodoIds.includes(todo.id);

            return (
              <div
                key={todo.id}
                data-todo-id={todo.id}
                draggable={canDrag}
                role="article"
                aria-label={`Tarefa: ${todo.text}`}
                onDragStart={
                  canDrag
                    ? (event) => {
                        const dragIds = getDragTodoIds(todo.id);
                        event.dataTransfer.setData('text/todo-ids', JSON.stringify(dragIds));
                        onDragStart(todo.id)(event);
                      }
                    : undefined
                }
                onDragEnd={canDrag ? onDragEnd : undefined}
                onTouchStart={(e) => {
                  if (isSelectionMode) {
                    handleSelectionTouchStart(todo.id, e);
                    return;
                  }
                  handleItemTouchStart(e);
                  canDrag && onTouchStart ? onTouchStart(todo.id)(e) : undefined;
                }}
                onTouchEnd={(e) => {
                  if (isSelectionMode) {
                    handleSelectionTouchEnd();
                    return;
                  }
                  handleItemTouchEnd(todo.id)(e);
                  canDrag && onTouchEnd ? onTouchEnd() : undefined;
                }}
                onTouchMove={
                  isSelectionMode
                    ? handleSelectionTouchMove
                    : canDrag && onTouchMove
                      ? onTouchMove
                      : undefined
                }
                className={`group relative flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/30 transition hover:border-indigo-500/60 hover:bg-slate-900/90 ${
                  isSelected
                    ? 'border-emerald-400/70 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCheckbox ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleComplete(todo.id);
                      }}
                      aria-pressed={todo.completed}
                      aria-label={todo.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem] transition ${
                        todo.completed
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : 'border-slate-500 bg-slate-900/80 text-slate-400 hover:border-emerald-400/70'
                      }`}
                    >
                      {todo.completed && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                    </button>
                  ) : (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-[0.5rem] font-semibold uppercase text-slate-400"
                      aria-label="Input de texto"
                      title="Texto"
                    >
                      TXT
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleSaveEditing(todo);
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              handleCancelEditing();
                            }
                          }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                          placeholder="Atualize o texto"
                          autoFocus
                        />
                        {isCheckbox && (
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              value={editingCategory}
                              onChange={(event) => setEditingCategory(event.target.value)}
                              className="min-w-[140px] flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                              placeholder="Categoria"
                            />
                            <input
                              type="date"
                              value={editingDueDate}
                              onChange={(event) => setEditingDueDate(event.target.value)}
                              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 focus:border-indigo-400 focus:outline-none"
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEditing(todo)}
                            disabled={isSaveDisabled}
                            className={`rounded-lg border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                              isSaveDisabled
                                ? 'border-slate-700 bg-slate-900/60 text-slate-500'
                                : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                            }`}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`${
                            isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'
                          }`}
                        >
                          {todo.text}
                        </span>
                        {showMeta && (
                          <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-400">
                            {todo.inputType === 'text' && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                Texto
                              </span>
                            )}
                            {todo.category && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                {todo.category}
                              </span>
                            )}
                            {todo.dueDate && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                {todo.dueDate}
                              </span>
                            )}
                            {islandLabel && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                {islandLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSelectionMode && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleTodoSelection(todo.id);
                      }}
                      aria-pressed={isSelected}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.6rem] transition ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-emerald-300/60'
                      }`}
                      title={isSelected ? 'Desmarcar' : 'Selecionar'}
                    >
                      {isSelected ? '✓' : ''}
                    </button>
                  )}
                  {isEditMode && canEdit && (
                    <button
                      type="button"
                      onClick={() => (isEditing ? handleCancelEditing() : handleStartEditing(todo))}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] transition ${
                        isEditing
                          ? 'border-amber-300/70 bg-amber-500/20 text-amber-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60'
                      }`}
                      title={isEditing ? 'Cancelar edição' : 'Editar input'}
                    >
                      ✏️
                    </button>
                  )}
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
                    {todo.phase ? phaseLabels[todo.phase] : 'Sem fase'}
                  </span>
                </div>
                {swipeDeleteId === todo.id && (
                  <div
                    className="absolute inset-y-0 right-0 flex items-center justify-center gap-2 rounded-r-xl bg-red-500/20 border-l border-red-500/50 px-3 pl-4"
                    role="region"
                    aria-label="Ações de deleção"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTodo?.(todo.id);
                        setSwipeDeleteId(null);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-red-400 bg-red-500/30 text-[0.7rem] text-red-200 transition hover:bg-red-500/50"
                      title="Deletar input"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Controles de Paginação */}
      {filteredTodos.length > ITEMS_PER_PAGE && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
              currentPage === 0
                ? 'border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                : 'border border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
            title="Página anterior"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-semibold text-slate-300">
              {currentPage + 1} / {totalPages}
            </span>
            <span className="text-[0.6rem] text-slate-400">
              ({startIndex + 1}-{Math.min(endIndex, filteredTodos.length)} de {filteredTodos.length}
              )
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
              currentPage >= totalPages - 1
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
