'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import { Card } from '@/app/cosmos/components/Card';
import TodoInput, { TodoItem as ParsedTodoItem } from '@/app/cosmos/components/TodoInput';
import { type MoonPhase, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import { PHASE_VIBES } from '@/app/cosmos/utils/phaseVibes';
import type { ScreenProps } from '@/app/cosmos/types';
import type { IslandId } from '@/app/cosmos/types/screen';
import { usePhaseInputs } from '@/hooks/usePhaseInputs';
import { useFilteredTodos, type FilterState } from '@/hooks/useFilteredTodos';
import { useGalaxySunsSync } from '@/hooks/useGalaxySunsSync';
import { useLunations } from '@/hooks/useLunations';
import { useCurrentWeekPhase } from '@/hooks/useCurrentWeekPhase';
import { useTemporal } from '@/app/cosmos/planeta/state/TemporalContext';
import { SavedTodosPanel } from '@/app/cosmos/components/SavedTodosPanel';
import { IslandsList } from '@/app/cosmos/components/IslandsList';
import { MAX_ISLANDS } from '@/app/cosmos/utils/islandNames';
import { useIslandNames } from '@/hooks/useIslandNames';
import { usePlanetTodos } from '@/hooks/usePlanetTodos';
import { usePlanetState } from '@/hooks/usePlanetState';
import { FiltersPanel } from './FiltersPanel';
import { MoonCluster } from './MoonCluster';

const PlanetScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  // Contextos temporais
  const temporal = useTemporal();

  // Sincronização de lunações
  const galaxySunsSync = useGalaxySunsSync([
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
  ]);
  const lunations = useLunations();
  const currentWeekPhase = useCurrentWeekPhase(
    lunations.data.length > 0 ? lunations.data : undefined
  );
  const { todos: savedTodos, setTodos: setSavedTodos } = usePlanetTodos();
  const { state: planetState, setState: setPlanetState } = usePlanetState();
  const { showIslands, isFiltersPanelOpen, filters } = planetState;
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [activeIslandDrop, setActiveIslandDrop] = useState<IslandId | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);
  const [_draggingTodoId, setDraggingTodoId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [batchDeleteIds, setBatchDeleteIds] = useState<string[] | null>(null);
  const dropHandledRef = useRef(false);
  const touchIdRef = useRef<string | null>(null);
  const { saveInput } = usePhaseInputs();
  const { islandNames, islandIds, renameIsland, createIsland, removeIsland } = useIslandNames();

  const setFilters = (next: FilterState | ((prev: FilterState) => FilterState)) => {
    setPlanetState((prev) => ({
      ...prev,
      filters: typeof next === 'function' ? next(prev.filters) : next,
    }));
  };

  const setShowIslands = (next: boolean | ((prev: boolean) => boolean)) => {
    setPlanetState((prev) => ({
      ...prev,
      showIslands: typeof next === 'function' ? next(prev.showIslands) : next,
    }));
  };

  const setIsFiltersPanelOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setPlanetState((prev) => ({
      ...prev,
      isFiltersPanelOpen:
        typeof next === 'function' ? next(prev.isFiltersPanelOpen) : next,
    }));
  };

  const resetFilters = () => {
    setFilters({
      view: 'em-aberto',
      inputType: 'all',
      todoStatus: 'all',
      phase: null,
      island: null,
      month: null,
      year: null,
    });
  };

  // Sincronizar lunações do banco de dados
  useEffect(() => {
    const syncLunations = async () => {
      try {
        const startDate = `${temporal.year}-01-01`;
        const endDate = `${temporal.year}-12-31`;

        // Buscar lunações do banco (ou gerar localmente se vazio)
        await lunations.fetch(startDate, endDate, 'auto');
      } catch (error) {
        console.warn('Erro ao sincronizar lunações:', error);
      }
    };

    syncLunations();
  }, [temporal.year]);

  // Sincronizar contagem de tarefas com fases lunares
  useEffect(() => {
    const syncGalaxySuns = async () => {
      try {
        // Atualizar dados de estatísticas de fases lunares
        await galaxySunsSync.refresh(temporal.year);
      } catch (error) {
        console.warn('Erro ao sincronizar GalaxySuns:', error);
      }
    };

    syncGalaxySuns();
  }, [temporal.year]);

  const handleTodoSubmit = (todo: ParsedTodoItem) => {
    const resolvedTodo = {
      ...todo,
      islandId: todo.islandId ?? filters.island ?? undefined,
    };

    setSavedTodos((prev) => {
      const key = `${resolvedTodo.inputType}|${resolvedTodo.text}|${resolvedTodo.depth}|${
        resolvedTodo.islandId ?? 'sem-ilha'
      }`;
      const existingIndex = prev.findIndex(
        (item) =>
          `${item.inputType}|${item.text}|${item.depth}|${item.islandId ?? 'sem-ilha'}` === key
      );
      if (existingIndex === -1) {
        return [...prev, resolvedTodo];
      }
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...resolvedTodo,
        id: updated[existingIndex].id,
      };
      return updated;
    });
  };

  const handleToggleComplete = (todoId: string) => {
    setSavedTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const handleUpdateTodo = (todoId: string, updates: Partial<SavedTodo>) => {
    setSavedTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, ...updates } : todo))
    );
  };

  const handleDeleteTodo = (todoId: string) => {
    setSavedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    setShowDeleteConfirm(false);
    setDeletingTodoId(null);
  };

  const handleDeleteTodos = (todoIds: string[]) => {
    const ids = new Set(todoIds);
    setSavedTodos((prev) => prev.filter((todo) => !ids.has(todo.id)));
    setShowDeleteConfirm(false);
    setBatchDeleteIds(null);
  };

  const handleRequestDelete = (todoId: string) => {
    setDeletingTodoId(todoId);
    setBatchDeleteIds(null);
    setShowDeleteConfirm(true);
  };

  const handleRequestBatchDelete = (todoIds: string[]) => {
    if (todoIds.length === 0) return;
    setBatchDeleteIds(todoIds);
    setDeletingTodoId(null);
    setShowDeleteConfirm(true);
  };

  const assignTodosToPhase = (todoIds: string[], phase: MoonPhase) => {
    const ids = new Set(todoIds);
    const targets = savedTodos.filter((todo) => ids.has(todo.id) && todo.phase !== phase);
    if (targets.length === 0) return;

    setSavedTodos((prev) => prev.map((todo) => (ids.has(todo.id) ? { ...todo, phase } : todo)));

    targets.forEach((target) => {
      saveInput({
        moonPhase: phase,
        inputType: 'tarefa',
        sourceId: target.id,
        content: target.text,
        vibe: PHASE_VIBES[phase].label,
        metadata: {
          category: target.category ?? null,
          dueDate: target.dueDate ?? null,
          depth: target.depth,
          completed: target.completed,
          inputType: target.inputType,
          islandId: target.islandId ?? null,
        },
      }).catch((error) => {
        console.warn('Falha ao salvar tarefa na fase:', error);
      });
    });
  };

  const assignTodosToIsland = (todoIds: string[], islandId: IslandId) => {
    const ids = new Set(todoIds);
    const hasTargets = savedTodos.some((todo) => ids.has(todo.id) && todo.islandId !== islandId);
    if (!hasTargets) return;

    setSavedTodos((prev) =>
      prev.map((todo) => (ids.has(todo.id) ? { ...todo, islandId } : todo))
    );
  };

  const handleDragStart = (todoId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/todo-id', todoId);
    dropHandledRef.current = false;
    setIsDraggingTodo(true);
    setDraggingTodoId(todoId);
  };

  const handleDragEnd = () => {
    setIsDraggingTodo(false);
    setActiveDrop(null);
    setActiveIslandDrop(null);
    setDraggingTodoId(null);
    dropHandledRef.current = false;
  };

  const getDraggedTodoIds = (event: React.DragEvent) => {
    const rawTodoIds = event.dataTransfer.getData('text/todo-ids');
    if (rawTodoIds) {
      try {
        const parsed = JSON.parse(rawTodoIds);
        if (Array.isArray(parsed)) {
          const ids = parsed.filter((id) => typeof id === 'string');
          if (ids.length > 0) return ids;
        }
      } catch (error) {
        console.warn('Falha ao ler seleção de to-dos:', error);
      }
    }
    const todoId = event.dataTransfer.getData('text/todo-id');
    return todoId ? [todoId] : [];
  };

  const handleDropOnPhase = (phase: MoonPhase) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const todoIds = getDraggedTodoIds(e);
    if (todoIds.length === 0) return;
    dropHandledRef.current = true;
    assignTodosToPhase(todoIds, phase);
    setActiveDrop(null);
    setIsDraggingTodo(false);
  };

  const handleDragOverPhase = (phase: MoonPhase) => (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDrop(phase);
  };

  const handleDragLeavePhase = () => {
    setActiveDrop(null);
  };

  const handleDropOnIsland = (islandId: IslandId) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const todoIds = getDraggedTodoIds(e);
    if (todoIds.length === 0) return;
    dropHandledRef.current = true;
    assignTodosToIsland(todoIds, islandId);
    setActiveIslandDrop(null);
    setIsDraggingTodo(false);
  };

  const handleDragOverIsland = (islandId: IslandId) => (e: React.DragEvent) => {
    e.preventDefault();
    setActiveIslandDrop(islandId);
  };

  const handleDragLeaveIsland = () => {
    setActiveIslandDrop(null);
  };

  // Funções para suporte a touch (mobile drag and drop)
  const handleTouchStart = (todoId: string) => (_e: React.TouchEvent) => {
    touchIdRef.current = todoId;
    setIsDraggingTodo(true);
    setDraggingTodoId(todoId);
    dropHandledRef.current = false;
  };

  const handleTouchEnd = () => {
    if (touchIdRef.current && isDraggingTodo) {
      // Verificar se houver um drop ativo e processar
      if (activeDrop) {
        assignTodosToPhase([touchIdRef.current], activeDrop);
        dropHandledRef.current = true;
      } else if (activeIslandDrop) {
        assignTodosToIsland([touchIdRef.current], activeIslandDrop);
        dropHandledRef.current = true;
      }
    }

    setDraggingTodoId(null);
    touchIdRef.current = null;
    setIsDraggingTodo(false);
    setActiveDrop(null);
    setActiveIslandDrop(null);
    dropHandledRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTodo) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!element) return;

    // Detectar se é uma lua (MoonCluster)
    const moonContainer = element.closest('[data-drop-target="moon"]');
    if (moonContainer) {
      const phase = moonContainer.getAttribute('data-phase') as MoonPhase;
      if (phase) {
        setActiveDrop(phase);
      }
    }

    // Detectar se é uma ilha
    const islandContainer = element.closest('[data-drop-target="island"]');
    if (islandContainer) {
      const islandId = islandContainer.getAttribute('data-island-id') as IslandId;
      if (islandId) {
        setActiveIslandDrop(islandId);
      }
    }
  };

  // Usar o hook useFilteredTodos para aplicar todos os filtros
  const displayedTodos = useFilteredTodos(
    savedTodos,
    filters,
    currentWeekPhase?.currentPhase,
    currentWeekPhase?.nextWeekDominantPhase
  );

  const moonCounts = useMemo(
    () =>
      displayedTodos.reduce(
        (acc, todo) => {
          if (todo.phase) acc[todo.phase] = (acc[todo.phase] ?? 0) + 1;
          return acc;
        },
        {} as Record<MoonPhase, number>
      ),
    [displayedTodos]
  );

  return (
    <div
      className="relative flex w-full min-h-[100dvh] items-start justify-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10"
      onTouchMove={handleTouchMove}
    >
      <div className="relative flex w-full max-w-7xl flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        {/* Coluna esquerda: Planeta + Ilhas (ordem 4 no mobile, 1 no desktop) */}
        <div className="order-4 flex w-full flex-col items-center gap-6 sm:gap-8 lg:order-1 lg:w-auto lg:max-w-xs">
          {/* Planeta */}
          <div className="flex justify-center">
            <CelestialObject
              type="planeta"
              size="lg"
              interactive
              onClick={() => setShowIslands((prev) => !prev)}
              className="scale-75 transition-transform lg:scale-90 2xl:scale-100"
            />
          </div>

          {/* Ilhas abaixo do planeta */}
          {showIslands && (
            <IslandsList
              selectedIsland={filters.island}
              onSelectIsland={(island) => setFilters((prev) => ({ ...prev, island }))}
              activeDropIsland={activeIslandDrop}
              onDropIsland={handleDropOnIsland}
              onDragOverIsland={handleDragOverIsland}
              onDragLeaveIsland={handleDragLeaveIsland}
              isDraggingTodo={isDraggingTodo}
              islandNames={islandNames}
              onRenameIsland={renameIsland}
              islandIds={islandIds}
              maxIslands={MAX_ISLANDS}
              onCreateIsland={createIsland}
              onRemoveIsland={removeIsland}
            />
          )}
        </div>

        {/* Coluna central: Card com To-dos (ordem 3 no mobile, 2 no desktop) */}
        <div className="order-3 relative w-full lg:order-2 lg:flex-1">
          <Card className="relative z-10 w-full overflow-hidden border border-white/10 bg-transparent p-4 shadow-none backdrop-blur-0 sm:p-6 !bg-transparent !backdrop-blur-0 !shadow-none">
            <div className="flex flex-col gap-4 overflow-visible pr-1 sm:gap-5">
              <div className="flex flex-col gap-4 flex-shrink-0">
                <SavedTodosPanel
                  savedTodos={displayedTodos}
                  view={filters.view}
                  onViewChange={(view) =>
                    setFilters((prev) => ({
                      ...prev,
                      view,
                    }))
                  }
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  onToggleComplete={handleToggleComplete}
                  onDropInside={() => {
                    dropHandledRef.current = true;
                  }}
                  onDeleteTodo={handleRequestDelete}
                  onBatchDelete={handleRequestBatchDelete}
                  onUpdateTodo={handleUpdateTodo}
                  selectedPhase={filters.phase}
                  selectedIsland={filters.island}
                  islandNames={islandNames}
                  inputTypeFilter={filters.inputType}
                  todoStatusFilter={filters.todoStatus}
                  onInputTypeFilterChange={(inputType) =>
                    setFilters((prev) => ({
                      ...prev,
                      inputType,
                    }))
                  }
                  onTodoStatusFilterChange={(todoStatus) =>
                    setFilters((prev) => ({
                      ...prev,
                      todoStatus,
                    }))
                  }
                />
                <div className="flex items-center justify-end flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFiltersPanelOpen((prev) => !prev)}
                    className="w-full sm:w-auto rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-100 shadow-md transition hover:bg-indigo-500/30"
                  >
                    {isFiltersPanelOpen ? 'Esconder' : 'Mostrar'} painel
                  </button>
                </div>

                <FiltersPanel
                  isOpen={isFiltersPanelOpen}
                  filters={filters}
                  onClearFilters={resetFilters}
                  onMonthChange={(month) =>
                    setFilters((prev) => ({
                      ...prev,
                      month,
                    }))
                  }
                  onYearChange={(year) =>
                    setFilters((prev) => ({
                      ...prev,
                      year,
                    }))
                  }
                  islandNames={islandNames}
                />

                <TodoInput
                  className="shadow-lg flex-shrink-0"
                  onTodoSubmit={handleTodoSubmit}
                  chatInline={true}
                  selectedIsland={filters.island}
                  islandNames={islandNames}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna direita: Luas + Sol (ordem 2 e 1 no mobile, 3 no desktop) */}
        <div className="order-1 flex w-full flex-col items-center justify-center gap-6 lg:order-3 lg:w-auto lg:max-w-xs lg:flex-row lg:items-center">
          {/* Sol (ordem 1 no mobile) */}
          <div className="order-1 lg:order-2">
            <CelestialObject
              type="sol"
              size="md"
              interactive
              onClick={(event) => {
                if (isDraggingTodo) return;
                navigateWithFocus('planetCardBelowSun', { event, type: 'sol', size: 'md' });
              }}
              floatOffset={-2}
              className="scale-90 sm:scale-100"
            />
          </div>

          {/* MoonCluster com as luas interativas (ordem 2 no mobile) */}
          <div className="order-2 lg:order-1">
            <MoonCluster
              activeDrop={activeDrop}
              moonCounts={moonCounts}
              isDraggingTodo={isDraggingTodo}
              selectedPhase={filters.phase}
              currentPhase={currentWeekPhase?.currentPhase ?? null}
              onMoonNavigate={(phase, event) =>
                navigateWithFocus('planetCardStandalone', { event, type: phase, size: 'sm' })
              }
              onMoonFilter={(phase) => setFilters((prev) => ({ ...prev, phase }))}
              onDrop={handleDropOnPhase}
              onDragOver={handleDragOverPhase}
              onDragLeave={handleDragLeavePhase}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (deletingTodoId || batchDeleteIds) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl shadow-indigo-900/40 p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              {batchDeleteIds ? 'Deletar tarefas?' : 'Deletar tarefa?'}
            </h2>
            <p className="text-slate-300 mb-6">
              {batchDeleteIds
                ? `Você realmente deseja deletar ${batchDeleteIds.length} tarefas? Esta ação não pode ser desfeita.`
                : 'Você realmente deseja deletar essa tarefa? Esta ação não pode ser desfeita.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingTodoId(null);
                  setBatchDeleteIds(null);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 hover:border-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (batchDeleteIds) {
                    handleDeleteTodos(batchDeleteIds);
                    return;
                  }
                  if (deletingTodoId) {
                    handleDeleteTodo(deletingTodoId);
                  }
                }}
                className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 shadow-lg"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetScreen;
