/**
 * Hook para gerenciar lógica de filtro e view do SavedTodosPanel
 */
'use client';

import { useCallback } from 'react';
import type { SavedTodo, MoonPhase } from '@/client/storage';

const ITEMS_PER_PAGE = 20;

export function useFilterAndView(
  savedTodos: SavedTodo[],
  selectedPhase: MoonPhase | null | undefined,
  selectedIsland: string | null | undefined
) {
  // Lógica de filtro cronológico
  const getDateForView = useCallback((viewType: string): string | undefined => {
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
  }, []);

  const getFilteredTodosByChronology = useCallback(
    (todos: SavedTodo[], view: string | undefined): SavedTodo[] => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (view === 'todos') return todos;
      if (view === 'em-aberto') {
        return todos.filter((todo) => !todo.phase && !todo.dueDate && !todo.islandId);
      }
      if (view === 'lua-atual' && selectedPhase) {
        const nextPhaseDate = new Date(today);
        nextPhaseDate.setDate(today.getDate() + 8);
        const nextPhaseDateStr = nextPhaseDate.toISOString().split('T')[0];
        return todos.filter(
          (todo) => !todo.dueDate || (todo.dueDate >= todayStr && todo.dueDate <= nextPhaseDateStr)
        );
      } else if (view === 'proxima-fase' && selectedPhase) {
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
    },
    [selectedPhase]
  );

  const applyFilters = useCallback(
    (todos: SavedTodo[], view: string | undefined): SavedTodo[] => {
      const phaseFilter = view === 'em-aberto' ? null : selectedPhase;
      const islandFilter = view === 'em-aberto' ? null : selectedIsland;

      const filtered = todos
        .filter((todo) => (phaseFilter ? todo.phase === phaseFilter : true))
        .filter((todo) => (islandFilter ? todo.islandId === islandFilter : true));

      return getFilteredTodosByChronology(filtered, view);
    },
    [selectedPhase, selectedIsland, getFilteredTodosByChronology]
  );

  const paginate = useCallback(
    (todos: SavedTodo[], currentPage: number) => {
      const totalPages = Math.ceil(todos.length / ITEMS_PER_PAGE);
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      return {
        displayed: todos.slice(startIndex, endIndex),
        totalPages,
        startIndex,
        endIndex,
      };
    },
    []
  );

  return {
    getDateForView,
    getFilteredTodosByChronology,
    applyFilters,
    paginate,
    ITEMS_PER_PAGE,
  };
}
