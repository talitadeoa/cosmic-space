"use client";

import type { TodoItem as ParsedTodoItem } from "../components/TodoInput";
import { MOON_PHASE_LABELS, MOON_PHASES, type MoonPhase } from "./moonPhases";

export type { MoonPhase } from "./moonPhases";
export type IslandId = "ilha1" | "ilha2" | "ilha3" | "ilha4";

export type SavedTodo = ParsedTodoItem & {
  phase?: MoonPhase;
  islandId?: IslandId;
  project?: string;
  category?: string;
  dueDate?: string;
};

export const TODO_STORAGE_KEY = "cosmic_space_todos_salvos";
export const PROJECTS_STORAGE_KEY = "cosmic_space_projects";

export const phaseLabels: Record<MoonPhase, string> = MOON_PHASE_LABELS;
export const phaseOrder: MoonPhase[] = MOON_PHASES;

const isValidPhase = (phase: unknown): phase is MoonPhase =>
  phase === "luaNova" || phase === "luaCrescente" || phase === "luaCheia" || phase === "luaMinguante";
const isValidIsland = (island: unknown): island is IslandId =>
  island === "ilha1" || island === "ilha2" || island === "ilha3" || island === "ilha4";

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
        project:
          typeof item.project === "string" && item.project.trim().length > 0
            ? item.project
            : undefined,
        category:
          typeof item.category === "string" && item.category.trim().length > 0
            ? item.category
            : undefined,
        dueDate:
          typeof item.dueDate === "string" && item.dueDate.trim().length > 0
            ? item.dueDate
            : undefined,
        islandId: isValidIsland(item.islandId) ? item.islandId : undefined,
        phase: isValidPhase(item.phase) ? item.phase : undefined,
      }))
      .filter((item) => item.text.trim().length > 0);
  } catch (error) {
    console.warn("Falha ao ler to-dos salvos", error);
    return [];
  }
}

export function loadSavedProjects(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as string[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  } catch (error) {
    console.warn("Falha ao ler projetos salvos", error);
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

export function saveSavedProjects(projects: string[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn("Falha ao salvar projetos", error);
  }
}
