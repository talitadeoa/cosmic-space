import { useMemo } from "react";
import type { SavedTodo, MoonPhase } from "@/app/cosmos/utils/todoStorage";
import type { IslandId } from "@/app/cosmos/types/screen";

export type FilterState = {
  view: "inbox" | "lua-atual";
  completeness: "todas" | "incompletas";
  phase: MoonPhase | null;
  island: IslandId | null;
};

/**
 * Hook que aplica filtros em cascata aos todos
 * Ordem: project → view → completeness → phase → island → searchText
 */
export const useFilteredTodos = (
  todos: SavedTodo[],
  filters: FilterState,
  selectedProject: string,
) => {
  return useMemo(() => {
    return todos
      // 1. Filtrar por project (se selecionado)
      .filter((todo) => {
        if (!selectedProject.trim()) return true;
        const key = selectedProject.toLowerCase();
        return (todo.project ?? "").toLowerCase() === key;
      })
      // 2. Filtrar por view (inbox ou lua-atual)
      .filter((todo) => {
        if (filters.view === "lua-atual") {
          return todo.phase !== null;
        }
        return true;
      })
      // 3. Filtrar por completeness (todas ou incompletas)
      .filter((todo) => {
        if (filters.completeness === "incompletas") {
          return !todo.completed;
        }
        return true;
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
      });
  }, [todos, filters, selectedProject]);
};
