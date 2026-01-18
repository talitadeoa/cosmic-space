'use client';

import { useMemo } from 'react';
import type { SavedTodo, MoonPhase, IslandId } from '@/types/todo';
import { isInCurrentCycle, isInNextCycle } from '@/lib/phase-cycle-utils';
import type { TodoView } from '@/app/cosmos/planeta/salvos/types';

const ITEMS_PER_PAGE = 20;

interface UseTodoFilteringOptions {
  todos: SavedTodo[];
  view: TodoView;
  selectedPhase: MoonPhase | null | undefined;
  selectedIsland: IslandId | null | undefined;
  currentPage: number;
}

interface UseTodoFilteringResult {
  filteredTodos: SavedTodo[];
  displayedTodos: SavedTodo[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
}

/**
 * Filtra tarefas pela cronologia/ciclo lunar
 */
function filterByChronology(
  todos: SavedTodo[],
  view: TodoView
): SavedTodo[] {
  switch (view) {
    case 'todos':
      return todos;

    case 'em-aberto':
      return todos.filter((todo) => !todo.phase && !todo.dueDate && !todo.islandId);

    case 'lua-atual':
      return todos.filter((todo) => todo.phase && isInCurrentCycle(todo));

    case 'proxima-fase':
    case 'proximo-ciclo':
      return todos.filter((todo) => todo.phase && isInNextCycle(todo));

    default:
      return todos;
  }
}

/**
 * Hook para filtrar e paginar tarefas
 */
export function useTodoFiltering({
  todos,
  view,
  selectedPhase,
  selectedIsland,
  currentPage,
}: UseTodoFilteringOptions): UseTodoFilteringResult {
  const filteredTodos = useMemo(() => {
    // Em "em-aberto", não aplica filtros de fase/ilha
    const phaseFilter = view === 'em-aberto' ? null : selectedPhase;
    const islandFilter = view === 'em-aberto' ? null : selectedIsland;

    let result = todos
      .filter((todo) => (phaseFilter ? todo.phase === phaseFilter : true))
      .filter((todo) => (islandFilter ? todo.islandId === islandFilter : true));

    result = filterByChronology(result, view);

    return result;
  }, [todos, view, selectedPhase, selectedIsland]);

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredTodos.length);
  const displayedTodos = filteredTodos.slice(startIndex, endIndex);

  return {
    filteredTodos,
    displayedTodos,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}
