import { useMemo } from "react";
import type { SavedTodo, MoonPhase } from "@/app/cosmos/utils/todoStorage";
import type { IslandId } from "@/app/cosmos/types/screen";

export type FilterState = {
  view: "inbox" | "lua-atual";
  completeness: "todas" | "completas";
  phase: MoonPhase | null;
  island: IslandId | null;
};

/**
 * Hook que aplica filtros em cascata aos todos
 * Ordem: view → completeness → phase → island
 */
export const useFilteredTodos = (
  todos: SavedTodo[],
  filters: FilterState,
) => {
  return useMemo(() => {
    return todos
      // 1. Filtrar por view (inbox ou lua-atual)
      .filter((todo) => {
        if (filters.view === "lua-atual") {
          return todo.phase !== null;
        }
        return true;
      })
      // 2. Filtrar por completeness (todas ou completas)
      .filter((todo) => {
        if (filters.completeness === "completas") {
          return todo.completed;
        }
        return true;
      })
      // 3. Filtrar por phase específica (se selecionada)
      .filter((todo) => {
        if (!filters.phase) return true;
        return todo.phase === filters.phase;
      })
      // 4. Filtrar por island (se selecionada)
      .filter((todo) => {
        if (!filters.island) return true;
        return todo.islandId === filters.island;
      });
  }, [todos, filters]);
};
