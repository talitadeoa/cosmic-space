"use client";

import type { SavedTodo } from "../utils/todoStorage";
import type { MoonPhase } from "../utils/moonPhases";

export type IslandId = "ilha1" | "ilha2" | "ilha3" | "ilha4";

/**
 * Estilo TaskWithState é apenas para documentação
 * SavedTodo já suporta phase opcional
 */
export type TaskWithState = SavedTodo & {
  islandId?: IslandId;
};

/**
 * Props para handlers de tarefa
 */
export interface TaskHandlers {
  onToggleComplete: (todoId: string) => void;
  onAssignPhase: (todoId: string, phase: MoonPhase) => void;
  onRemovePhase: (todoId: string) => void;
}

/**
 * Estado de seleção da tela
 */
export interface ScreenSelectionState {
  selectedIsland: IslandId | null;
  selectedPhase: MoonPhase | null;
  selectedProject: string;
}

/**
 * Filtros aplicáveis à lista de tarefas
 */
export interface TaskFilters {
  byPhase?: MoonPhase | null;
  byIsland?: IslandId | null;
  byProject?: string;
}

/**
 * Contexto de acessibilidade para tab
 */
export interface TabItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}
