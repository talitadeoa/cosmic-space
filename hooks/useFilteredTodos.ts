import { useMemo } from 'react';
import type { SavedTodo, MoonPhase } from '@/app/cosmos/utils/todoStorage';
import type { IslandId } from '@/app/cosmos/types/screen';

export type InputTypeFilter = 'all' | SavedTodo['inputType'];
export type TodoStatusFilter = 'all' | 'completed' | 'open';

export type FilterState = {
  view: 'inbox' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo';
  inputType: InputTypeFilter;
  todoStatus: TodoStatusFilter;
  phase: MoonPhase | null;
  island: IslandId | null;
  month: number | null; // 1-12 ou null para todos
  year: number | null;  // YYYY ou null para todos
};

/**
 * Hook que aplica filtros em cascata aos todos
 * Ordem: view → inputType → todoStatus → phase → island → month → year
 */
export const useFilteredTodos = (todos: SavedTodo[], filters: FilterState) => {
  return useMemo(() => {
    return (
      todos
        // 1. Filtrar por view (inbox ou lua-atual)
        .filter((todo) => {
          if (filters.view === 'lua-atual') {
            return todo.phase !== null;
          }
          return true;
        })
        // 2. Filtrar por tipo de input (se selecionado)
        .filter((todo) => {
          if (filters.inputType === 'all') {
            return true;
          }
          return todo.inputType === filters.inputType;
        })
        // 3. Filtrar por status (apenas quando filtra to-dos)
        .filter((todo) => {
          if (filters.inputType !== 'checkbox') {
            return true;
          }
          if (filters.todoStatus === 'all') {
            return true;
          }
          return filters.todoStatus === 'completed' ? todo.completed : !todo.completed;
        })
        // 4. Filtrar por phase específica (se selecionada)
        .filter((todo) => {
          if (!filters.phase) return true;
          return todo.phase === filters.phase;
        })
        // 5. Filtrar por island (se selecionada)
        .filter((todo) => {
          if (!filters.island) return true;
          return todo.islandId === filters.island;
        })
        // 6. Filtrar por ano (se selecionado)
        .filter((todo) => {
          if (!filters.year) return true;
          if (!todo.createdAt) return false;
          const todoYear = new Date(todo.createdAt).getFullYear();
          return todoYear === filters.year;
        })
        // 7. Filtrar por mês (se selecionado)
        .filter((todo) => {
          if (!filters.month) return true;
          if (!todo.createdAt) return false;
          const todoMonth = new Date(todo.createdAt).getMonth() + 1;
          return todoMonth === filters.month;
        })
    );
  }, [todos, filters]);
};
