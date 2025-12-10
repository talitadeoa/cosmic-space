"use client";

import type { TodoItem as ParsedTodoItem } from "@/components/TodoInput";

export type MoonPhase = "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";

export type SavedTodo = ParsedTodoItem & { phase?: MoonPhase };

export const TODO_STORAGE_KEY = "cosmic_space_todos_salvos";

export const phaseLabels: Record<MoonPhase, string> = {
  luaNova: "Lua Nova",
  luaCrescente: "Lua Crescente",
  luaCheia: "Lua Cheia",
  luaMinguante: "Lua Minguante",
};

export const phaseOrder: MoonPhase[] = ["luaNova", "luaCrescente", "luaCheia", "luaMinguante"];

const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === "luaNova" || phase === "luaCrescente" || phase === "luaCheia" || phase === "luaMinguante";

export function loadSavedTodos(): SavedTodo[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(TODO_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as SavedTodo[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, idx) => ({
        id: typeof item.id === "string" ? item.id : `todo-${idx}`,
        text: typeof item.text === "string" ? item.text : "",
        completed: Boolean(item.completed),
        depth: Number.isFinite(item.depth) ? Number(item.depth) : 0,
        phase: isValidPhase(item.phase) ? item.phase : undefined,
      }))
      .filter((item) => item.text.trim().length > 0);
  } catch (error) {
    console.warn("Falha ao ler to-dos salvos", error);
    return [];
  }
}
