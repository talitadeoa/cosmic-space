"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import type { SavedTodo, MoonPhase } from "../utils/todoStorage";
import { phaseLabels } from "../utils/todoStorage";

interface SavedTodosPanelProps {
  savedTodos: SavedTodo[];
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onToggleComplete: (todoId: string) => void;
  onAssignPhase?: (todoId: string, phase: MoonPhase) => void;
  onDeleteOutside?: (todoId: string) => void;
  filterLabel?: string;
  selectedPhase?: MoonPhase | null;
  todosFilterView?: "todas" | "completas";
  onFilterViewChange?: (view: "todas" | "completas") => void;
}

/**
 * SavedTodosPanel Component
 *
 * Exibe lista de tarefas salvass com:
 * - EmptyState quando não há tarefas
 * - Suporte a drag-and-drop
 * - Filtro opcional por fase lunar
 * - Estados visuais para conclusão
 */
export const SavedTodosPanel: React.FC<SavedTodosPanelProps> = ({
  savedTodos,
  onDragStart,
  onDragEnd,
  onToggleComplete,
  onAssignPhase,
  onDeleteOutside,
  filterLabel,
  selectedPhase,
  todosFilterView = "todas",
  onFilterViewChange,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  const handleDragLeave = (e: React.DragEvent) => {
    // Se deixou a área do painel e não é um drop em um alvo interno
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (isOutside && onDeleteOutside) {
      const todoId = e.dataTransfer?.getData("text/todo-id");
      if (todoId) {
        onDeleteOutside(todoId);
      }
    }
  };

  // Filtrar tarefas por fase se uma fase estiver selecionada
  const displayedTodos = selectedPhase
    ? savedTodos.filter((todo) => todo.phase === selectedPhase)
    : savedTodos;

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-indigo-900/20"
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {selectedPhase ? `To-dos - ${phaseLabels[selectedPhase]}` : "To-dos salvos"}
          </p>
          <p className="text-[0.75rem] text-slate-400">
            {selectedPhase
              ? `Tarefas associadas à fase: ${phaseLabels[selectedPhase]}`
              : "Adicione tarefas e arraste para a fase lunar desejada."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFilterViewChange?.("todas")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold transition ${
              todosFilterView === "todas"
                ? "border border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
                : "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
            }`}
            title="Todas as tarefas"
          >
            T
          </button>
          <button
            type="button"
            onClick={() => onFilterViewChange?.("completas")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              todosFilterView === "completas"
                ? "border border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
                : "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
            }`}
            title="Tarefas completas"
          >
            ✔️
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
        {displayedTodos.length === 0 ? (
          <EmptyState
            title={selectedPhase ? "Nenhuma tarefa nesta fase" : "Nenhum to-do salvo"}
            description={
              selectedPhase
                ? `Arraste uma tarefa para ${phaseLabels[selectedPhase]} ou crie uma nova.`
                : "Crie uma tarefa ou selecione uma fase lunar."
            }
            icon="✨"
          />
        ) : (
          displayedTodos.map((todo) => (
            <div
              key={todo.id}
              draggable
              onDragStart={onDragStart(todo.id)}
              onDragEnd={onDragEnd}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/20 transition hover:border-indigo-600/60 hover:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleComplete(todo.id);
                  }}
                  aria-pressed={todo.completed}
                  aria-label={
                    todo.completed ? "Marcar como pendente" : "Marcar como concluída"
                  }
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem] transition ${
                    todo.completed
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-500 bg-slate-900/80 text-slate-400 hover:border-emerald-400/70"
                  }`}
                >
                  {todo.completed && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <span
                    className={`${
                      todo.completed ? "text-slate-500 line-through" : "text-slate-100"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {(todo.category || todo.dueDate) && (
                    <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-400">
                      {todo.category && (
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                          {todo.category}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                          {todo.dueDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
                {todo.phase ? phaseLabels[todo.phase] : "Sem fase"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
