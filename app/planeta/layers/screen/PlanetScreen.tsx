'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import { Card } from '@/app/cosmos/components/Card';
import TodoInput, { TodoItem as ParsedTodoItem } from '@/app/cosmos/components/TodoInput';
import {
  loadSavedTodos,
  saveSavedTodos,
  type MoonPhase,
  type SavedTodo,
} from '@/app/cosmos/utils/todoStorage';
import { PHASE_VIBES } from '@/app/cosmos/utils/phaseVibes';
import type { ScreenProps } from '@/app/cosmos/types';
import type { IslandId } from '@/app/cosmos/types/screen';
import { usePhaseInputs } from '@/hooks/usePhaseInputs';
import { useFilteredTodos, type FilterState } from '@/hooks/useFilteredTodos';
import { SavedTodosPanel } from '@/app/cosmos/components/SavedTodosPanel';
import { IslandsList } from '@/app/cosmos/components/IslandsList';
import { useIslandNames } from '@/hooks/useIslandNames';
import { FiltersPanel } from './components/FiltersPanel';
import { MoonCluster } from './components/MoonCluster';

const PlanetScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [showIslands, setShowIslands] = useState(false);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [activeIslandDrop, setActiveIslandDrop] = useState<IslandId | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const dropHandledRef = useRef(false);
  const touchIdRef = useRef<string | null>(null);
  const { saveInput } = usePhaseInputs();
  const { islandNames, renameIsland } = useIslandNames();

  // Estado consolidado de filtros
  const [filters, setFilters] = useState<FilterState>({
    view: 'inbox',
    inputType: 'all',
    todoStatus: 'all',
    phase: null,
    island: null,
  });

  const resetFilters = () => {
    setFilters({
      view: 'inbox',
      inputType: 'all',
      todoStatus: 'all',
      phase: null,
      island: null,
    });
  };

  useEffect(() => {
    setSavedTodos(loadSavedTodos());
    setHasLoadedTodos(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedTodos) return;
    saveSavedTodos(savedTodos);
  }, [hasLoadedTodos, savedTodos]);

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

  const assignTodoToPhase = (todoId: string, phase: MoonPhase) => {
    const target = savedTodos.find((todo) => todo.id === todoId);
    if (!target) return;
    if (target.phase === phase) return;

    setSavedTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, phase } : todo)));

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
  };

  const assignTodoToIsland = (todoId: string, islandId: IslandId) => {
    const target = savedTodos.find((todo) => todo.id === todoId);
    if (!target) return;
    if (target.islandId === islandId) return;

    setSavedTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, islandId } : todo))
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
    if (!dropHandledRef.current && draggingTodoId) {
      setShowDeleteConfirm(true);
    } else {
      setDraggingTodoId(null);
    }
    dropHandledRef.current = false;
  };

  const handleDeleteTodo = (todoId: string) => {
    setSavedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    setShowDeleteConfirm(false);
    setDraggingTodoId(null);
  };

  const handleDropOnPhase = (phase: MoonPhase) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const todoId = e.dataTransfer.getData('text/todo-id');
    if (!todoId) return;
    dropHandledRef.current = true;
    assignTodoToPhase(todoId, phase);
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
    const todoId = e.dataTransfer.getData('text/todo-id');
    if (!todoId) return;
    dropHandledRef.current = true;
    assignTodoToIsland(todoId, islandId);
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
  const handleTouchStart = (todoId: string) => (e: React.TouchEvent) => {
    setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    touchIdRef.current = todoId;
    setIsDraggingTodo(true);
    setDraggingTodoId(todoId);
    dropHandledRef.current = false;
  };

  const handleTouchEnd = () => {
    if (touchIdRef.current && isDraggingTodo) {
      // Verificar se houver um drop ativo e processar
      if (activeDrop) {
        assignTodoToPhase(touchIdRef.current, activeDrop);
        dropHandledRef.current = true;
      } else if (activeIslandDrop) {
        assignTodoToIsland(touchIdRef.current, activeIslandDrop);
        dropHandledRef.current = true;
      }
    }

    if (!dropHandledRef.current && touchIdRef.current) {
      setShowDeleteConfirm(true);
    } else {
      setDraggingTodoId(null);
    }
    setTouchStartPos(null);
    touchIdRef.current = null;
    setIsDraggingTodo(false);
    setActiveDrop(null);
    setActiveIslandDrop(null);
    dropHandledRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTodo || !touchStartPos) return;
    
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
  const displayedTodos = useFilteredTodos(savedTodos, filters);

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
      className="relative flex w-full min-h-screen items-start justify-center px-4 sm:px-8 pt-4 sm:pt-6"
      onTouchMove={handleTouchMove}
    >
      <div className="relative flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        {/* Coluna esquerda: Planeta + Ilhas (ordem 4 no mobile, 1 no desktop) */}
        <div className="order-4 flex w-full flex-col items-center gap-8 lg:order-1 lg:w-auto lg:max-w-xs">
          {/* Planeta */}
          <div className="flex justify-center">
            <CelestialObject
              type="planeta"
              size="lg"
              interactive
              onClick={() => setShowIslands((prev) => !prev)}
              className="scale-75 transition-transform xl:scale-90 2xl:scale-100"
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
            />
          )}
        </div>

        {/* Coluna central: Card com To-dos (ordem 3 no mobile, 2 no desktop) */}
        <div className="order-3 relative w-full lg:order-2 lg:flex-1">
          <Card className="relative z-10 w-full overflow-hidden border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-6">
            <div className="flex flex-col gap-4 overflow-visible pr-1 sm:gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                    Painel lunar lateral
                  </p>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    Organize tarefas por fase lunar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFiltersPanelOpen((prev) => !prev)}
                  className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-100 shadow-md transition hover:bg-indigo-500/30"
                >
                  {isFiltersPanelOpen ? 'Esconder' : 'Mostrar'} painel
                </button>
              </div>

              <div className="flex flex-col gap-4 flex-shrink-0">
                <FiltersPanel
                  isOpen={isFiltersPanelOpen}
                  filters={filters}
                  onClearFilters={resetFilters}
                  islandNames={islandNames}
                />

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
                  onAssignPhase={assignTodoToPhase}
                  onDropInside={() => {
                    dropHandledRef.current = true;
                  }}
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
      {showDeleteConfirm && draggingTodoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl shadow-indigo-900/40 p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-2">Deletar tarefa?</h2>
            <p className="text-slate-300 mb-6">
              Você realmente deseja deletar essa tarefa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDraggingTodoId(null);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 hover:border-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => draggingTodoId && handleDeleteTodo(draggingTodoId)}
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
