'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CelestialObject } from '../components/CelestialObject';
import { Card } from '../components/Card';
import TodoInput, { TodoItem as ParsedTodoItem } from '../components/TodoInput';
import {
  loadSavedTodos,
  phaseLabels,
  saveSavedTodos,
  type MoonPhase,
  type SavedTodo,
} from '../utils/todoStorage';
import { PHASE_VIBES } from '../utils/phaseVibes';
import type { ScreenProps } from '../types';
import type { IslandId } from '../types/screen';
import { usePhaseInputs } from '@/hooks/usePhaseInputs';
import { useFilteredTodos, type FilterState } from '@/hooks/useFilteredTodos';
import { SavedTodosPanel } from '../components/SavedTodosPanel';
import { IslandsList } from '../components/IslandsList';
import { useIslandNames } from '@/hooks/useIslandNames';
import { getIslandLabel, type IslandNames } from '../utils/islandNames';

const MOON_COUNT = 4;

type MoonClusterProps = {
  activeDrop: MoonPhase | null;
  moonCounts: Record<MoonPhase, number>;
  isDraggingTodo: boolean;
  selectedPhase: MoonPhase | null;
  onMoonNavigate: (phase: MoonPhase, event: React.MouseEvent<HTMLDivElement>) => void;
  onMoonFilter: (phase: MoonPhase | null) => void;
  onDrop: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragOver: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragLeave: () => void;
};

const MoonCluster = ({
  activeDrop,
  moonCounts,
  isDraggingTodo,
  selectedPhase,
  onMoonNavigate: _onMoonNavigate,
  onMoonFilter,
  onDrop,
  onDragOver,
  onDragLeave,
}: MoonClusterProps) => (
  <div className="flex w-full flex-col items-center gap-4">
    <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:flex-col lg:items-center">
      {Array.from({ length: MOON_COUNT }).map((_, i) => {
        const moonTypes = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as const;
        const moonType = moonTypes[i % moonTypes.length];
        const isActiveDrop = activeDrop === moonType;
        const isSelectedPhase = selectedPhase === moonType;
        const badgeCount = moonCounts[moonType] ?? 0;
        const floatOffset = i * 1.5 - 3;

        return (
          <div key={`moon-${i}`} className="relative flex items-center justify-center">
            {badgeCount > 0 && (
              <span className="absolute -right-3 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 px-2 text-[0.65rem] font-semibold text-white shadow-md">
                {badgeCount}
              </span>
            )}
            <CelestialObject
              type={moonType}
              size="sm"
              interactive
              onClick={() => {
                if (isDraggingTodo) return;
                // Se a fase já está selecionada, deseleciona; caso contrário, seleciona
                if (isSelectedPhase) {
                  onMoonFilter(null);
                } else {
                  onMoonFilter(moonType);
                }
              }}
              floatOffset={floatOffset}
              onDrop={onDrop(moonType)}
              onDragOver={onDragOver(moonType)}
              onDragLeave={onDragLeave}
              className={`transition-transform duration-300 ${
                isActiveDrop ? 'scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]' : ''
              } ${isSelectedPhase ? 'drop-shadow-[0_0_20px_rgba(129,140,248,0.9)]' : ''}`}
            />
          </div>
        );
      })}
    </div>
  </div>
);

type FiltersPanelProps = {
  isOpen: boolean;
  filters: FilterState;
  onClearFilters: () => void;
  islandNames: IslandNames;
};

const FiltersPanel = ({ isOpen, filters, onClearFilters, islandNames }: FiltersPanelProps) => {
  const showTodoStatus = filters.inputType === 'checkbox' && filters.todoStatus !== 'all';
  const hasActiveFilters =
    filters.view === 'lua-atual' ||
    filters.inputType !== 'all' ||
    showTodoStatus ||
    Boolean(filters.phase) ||
    Boolean(filters.island);

  const islandLabel = getIslandLabel(filters.island, islandNames);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/70 shadow-xl shadow-indigo-900/20 transition-[max-height,opacity,transform] duration-300 ${
        isOpen ? 'max-h-80 opacity-100 translate-y-0 p-3' : 'max-h-0 opacity-0 -translate-y-2 p-0'
      }`}
    >
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Painel de filtros
        </p>
        <p className="text-[0.75rem] text-slate-400">Ajuste como as tarefas aparecem na lista.</p>
      </div>

      {hasActiveFilters ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-semibold text-slate-200">
          {filters.view === 'lua-atual' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              Lua atual
            </span>
          )}
          {filters.inputType === 'text' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              Texto
            </span>
          )}
          {filters.inputType === 'checkbox' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              To-dos
            </span>
          )}
          {showTodoStatus && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {filters.todoStatus === 'completed' ? 'Completas' : 'Em aberto'}
            </span>
          )}
          {filters.phase && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {phaseLabels[filters.phase]}
            </span>
          )}
          {islandLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {islandLabel}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Nenhum filtro extra ativo.</p>
      )}

      {hasActiveFilters && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

const SidePlanetCardScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [activeIslandDrop, setActiveIslandDrop] = useState<IslandId | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);
  const dropHandledRef = useRef(false);
  const { saveInput } = usePhaseInputs();
  const { islandNames, renameIsland } = useIslandNames();

  // Estado consolidado de filtros
  const [filters, setFilters] = useState<FilterState>({
    view: 'inbox',
    inputType: 'all',
    todoStatus: 'all',
    phase: null,
    island: null,
    month: null,
    year: null,
  });

  const resetFilters = () => {
    setFilters({
      view: 'inbox',
      inputType: 'all',
      todoStatus: 'all',
      phase: null,
      island: null,
      month: null,
      year: null,
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
  };

  const handleDragEnd = () => {
    setIsDraggingTodo(false);
    setActiveDrop(null);
    setActiveIslandDrop(null);
    dropHandledRef.current = false;
  };

  const handleDeleteTodo = (todoId: string) => {
    setSavedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
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
    <div className="relative flex w-full items-start justify-center px-4 sm:px-8 pt-4 sm:pt-6">
      <div className="relative flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        {/* Coluna esquerda: Planeta + Ilhas */}
        <div className="flex w-full flex-col items-center gap-8 lg:w-auto lg:max-w-xs">
          {/* Planeta */}
          <div className="flex justify-center">
            <CelestialObject
              type="planeta"
              size="lg"
              className="scale-75 transition-transform xl:scale-90 2xl:scale-100"
            />
          </div>

          {/* Ilhas abaixo do planeta */}
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
        </div>

        {/* Coluna central: Card com To-dos */}
        <div className="relative w-full lg:flex-1">
          <Card className="relative z-10 w-full overflow-hidden border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-6">
            <div className="flex flex-col gap-4 overflow-visible pr-1 sm:gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80"></p>
                  <h3 className="text-lg font-semibold text-white sm:text-xl"></h3>
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
                  onToggleComplete={handleToggleComplete}
                  onAssignPhase={assignTodoToPhase}
                  onDropInside={() => {
                    dropHandledRef.current = true;
                  }}
                  onDeleteTodo={handleDeleteTodo}
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

        {/* Coluna direita: Luas + Sol */}
        <div className="flex w-full flex-col items-center justify-center gap-6 lg:w-auto lg:max-w-xs lg:flex-row lg:items-center">
          {/* MoonCluster com as luas interativas */}
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

          {/* Sol */}
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
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
