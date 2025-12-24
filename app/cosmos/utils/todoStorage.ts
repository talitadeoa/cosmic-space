"use client";

import type { TodoItem as ParsedTodoItem, TodoInputType } from "../components/TodoInput";
import { MOON_PHASE_LABELS, MOON_PHASES, type MoonPhase } from "./moonPhases";

export type { MoonPhase } from "./moonPhases";
export type IslandId = "ilha1" | "ilha2" | "ilha3" | "ilha4";

export type SavedTodo = ParsedTodoItem & { phase?: MoonPhase; islandId?: IslandId };

export const TODO_STORAGE_KEY = "cosmic_space_todos_salvos";

export const phaseLabels: Record<MoonPhase, string> = MOON_PHASE_LABELS;
export const phaseOrder: MoonPhase[] = MOON_PHASES;

const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === "luaNova" || phase === "luaCrescente" || phase === "luaCheia" || phase === "luaMinguante";
const isValidIsland = (island: unknown): island is IslandId =>
  island === "ilha1" || island === "ilha2" || island === "ilha3" || island === "ilha4";
const isValidInputType = (inputType: unknown): inputType is TodoInputType =>
  inputType === "text" || inputType === "checkbox";

export function loadSavedTodos(): SavedTodo[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(TODO_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as SavedTodo[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, idx) => {
        const inputType = isValidInputType(item.inputType) ? item.inputType : "checkbox";

        return {
          id: typeof item.id === "string" ? item.id : `todo-${idx}`,
          text: typeof item.text === "string" ? item.text : "",
          completed: inputType === "checkbox" ? Boolean(item.completed) : false,
          depth: Number.isFinite(item.depth) ? Number(item.depth) : 0,
          inputType,
          islandId: isValidIsland(item.islandId) ? item.islandId : undefined,
          phase: isValidPhase(item.phase) ? item.phase : undefined,
        };
      })
      .filter((item) => item.text.trim().length > 0);
  } catch (error) {
    console.warn("Falha ao ler to-dos salvos", error);
    return [];
  }
}


export function saveSavedTodos(todos: SavedTodo[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn("Falha ao salvar to-dos", error);
  }
}
