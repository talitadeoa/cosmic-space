"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import type { SavedTodo, MoonPhase, IslandId } from "../utils/todoStorage";
import { phaseLabels } from "../utils/todoStorage";
import { getIslandLabel, type IslandNames } from "../utils/islandNames";

interface SavedTodosPanelProps {
  savedTodos: SavedTodo[];
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onToggleComplete: (todoId: string) => void;
  onAssignPhase?: (todoId: string, phase: MoonPhase) => void;
  onDropInside?: () => void;
  selectedPhase?: MoonPhase | null;
  selectedIsland?: IslandId | null;
  islandNames?: IslandNames;
  inputTypeFilter?: "all" | "text" | "checkbox";
  todoStatusFilter?: "all" | "completed" | "open";
  onInputTypeFilterChange?: (filter: "all" | "text" | "checkbox") => void;
  onTodoStatusFilterChange?: (filter: "all" | "completed" | "open") => void;
  onUpdateTodo?: (todoId: string, updates: Partial<SavedTodo>) => void;
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
  onDropInside,
  selectedPhase,
  selectedIsland,
  islandNames,
  inputTypeFilter = "all",
  todoStatusFilter = "all",
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
  onUpdateTodo,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const islandLabel = getIslandLabel(selectedIsland, islandNames);
  const filterLabel =
    inputTypeFilter === "text"
      ? "Texto"
      : inputTypeFilter === "checkbox"
        ? "To-dos"
        : null;
  const statusLabel =
    inputTypeFilter === "checkbox" && todoStatusFilter !== "all"
      ? todoStatusFilter === "completed"
        ? "Completas"
        : "Em aberto"
      : null;
  const canEdit = Boolean(onUpdateTodo);
  const isTextFilter = inputTypeFilter === "text";
  const isTodoFilter = inputTypeFilter === "checkbox";
  const isOpenFilter = todoStatusFilter === "open";
  const isCompletedFilter = todoStatusFilter === "completed";
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [editingCategory, setEditingCategory] = React.useState("");
  const [editingDueDate, setEditingDueDate] = React.useState("");

  const handleTextFilter = () => {
    const nextFilter = inputTypeFilter === "text" ? "all" : "text";
    onInputTypeFilterChange?.(nextFilter);
  };

  const handleTodoFilter = () => {
    const nextFilter = inputTypeFilter === "checkbox" ? "all" : "checkbox";
    onInputTypeFilterChange?.(nextFilter);
  };
  const handleTodoStatusFilter = (status: "open" | "completed") => {
    const nextStatus = todoStatusFilter === status ? "all" : status;
    onTodoStatusFilterChange?.(nextStatus);
  };

  const resetEditingState = () => {
    setEditingTodoId(null);
    setEditingText("");
    setEditingCategory("");
    setEditingDueDate("");
  };

  const handleToggleEditMode = () => {
    if (!canEdit) return;
    setIsEditMode((prev) => {
      const next = !prev;
      if (!next) {
        resetEditingState();
      }
      return next;
    });
  };

  const handleStartEditing = (todo: SavedTodo) => {
    if (!canEdit) return;
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
    setEditingCategory(todo.category ?? "");
    setEditingDueDate(todo.dueDate ?? "");
  };

  const handleCancelEditing = () => {
    resetEditingState();
  };

  const handleSaveEditing = (todo: SavedTodo) => {
    if (!onUpdateTodo) return;
    const trimmedText = editingText.trim();
    if (!trimmedText) return;
    onUpdateTodo(todo.id, {
      text: trimmedText,
      category: editingCategory.trim() || undefined,
      dueDate: editingDueDate || undefined,
    });
    resetEditingState();
  };

  // Filtrar tarefas por fase e ilha se estiverem selecionadas
  const displayedTodos = savedTodos
    .filter((todo) => (selectedPhase ? todo.phase === selectedPhase : true))
    .filter((todo) => (selectedIsland ? todo.islandId === selectedIsland : true));

  const headerLabel = (() => {
    if (selectedPhase && islandLabel) {
      return `Inputs - ${phaseLabels[selectedPhase]} • ${islandLabel}`;
    }
    if (selectedPhase) {
      return `Inputs - ${phaseLabels[selectedPhase]}`;
    }
    if (islandLabel) {
      return `Inputs - ${islandLabel}`;
    }
    return "Inputs salvos";
  })();

  const headerDescription = (() => {
    if (selectedPhase && islandLabel) {
      return `Inputs associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
    }
    if (selectedPhase) {
      return `Inputs associados à fase: ${phaseLabels[selectedPhase]}`;
    }
    if (islandLabel) {
      return `Inputs associados à ${islandLabel}.`;
    }
    return "Adicione inputs e arraste para a fase lunar desejada.";
  })();

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-indigo-900/20"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropInside?.();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {headerLabel}
          </p>
          <p className="text-[0.75rem] text-slate-400">
            {headerDescription}
          </p>
          {(filterLabel || statusLabel) && (
            <div className="mt-2 flex flex-wrap gap-2 text-[0.6rem] text-slate-300">
              {filterLabel && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                  {filterLabel}
                </span>
              )}
              {statusLabel && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                  {statusLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={handleToggleEditMode}
              aria-pressed={isEditMode}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
                isEditMode
                  ? "border border-amber-300/80 bg-amber-500/20 text-amber-100"
                  : "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60"
              }`}
              title={isEditMode ? "Sair do modo edição" : "Editar inputs"}
            >
              ✏️
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTextFilter}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold transition ${
                isTextFilter
                  ? "border border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
                  : "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
              }`}
              title="Inputs de texto"
            >
              T
            </button>
            <button
              type="button"
              onClick={handleTodoFilter}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                isTodoFilter
                  ? "border border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
                  : "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
              }`}
              title="To-dos (abertas e completas)"
            >
              ✔️
            </button>
          </div>
          {isTodoFilter && (
            <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-1 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-slate-300">
              <button
                type="button"
                onClick={() => handleTodoStatusFilter("open")}
                className={`rounded-full px-2 py-1 transition ${
                  isOpenFilter
                    ? "bg-indigo-500/30 text-indigo-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mostrar tarefas em aberto"
              >
                Em aberto
              </button>
              <button
                type="button"
                onClick={() => handleTodoStatusFilter("completed")}
                className={`rounded-full px-2 py-1 transition ${
                  isCompletedFilter
                    ? "bg-indigo-500/30 text-indigo-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mostrar tarefas completas"
              >
                Completas
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
        {displayedTodos.length === 0 ? (
          <EmptyState
            title={
              selectedPhase
                ? "Nenhum input nesta fase"
                : islandLabel
                  ? "Nenhum input nesta ilha"
                  : "Nenhum input salvo"
            }
            description={
              selectedPhase
                ? `Arraste um input para ${phaseLabels[selectedPhase]} ou crie um novo.`
                : islandLabel
                  ? `Arraste um input para ${islandLabel} ou crie um novo.`
                  : "Crie um input ou selecione uma fase lunar."
            }
            icon="✨"
          />
        ) : (
          displayedTodos.map((todo) => {
            const islandLabel = getIslandLabel(todo.islandId, islandNames);
            const isCheckbox = todo.inputType === "checkbox";
            const isCompleted = isCheckbox && todo.completed;
            const showMeta =
              todo.inputType === "text" || todo.category || todo.dueDate || islandLabel;
            const isEditing = editingTodoId === todo.id;
            const canDrag = !isEditMode;
            const isSaveDisabled = !editingText.trim();

            return (
              <div
                key={todo.id}
                draggable={canDrag}
                onDragStart={canDrag ? onDragStart(todo.id) : undefined}
                onDragEnd={canDrag ? onDragEnd : undefined}
                className="group flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/20 transition hover:border-indigo-600/60 hover:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  {isCheckbox ? (
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
                  ) : (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-[0.5rem] font-semibold uppercase text-slate-400"
                      aria-label="Input de texto"
                      title="Texto"
                    >
                      TXT
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleSaveEditing(todo);
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              handleCancelEditing();
                            }
                          }}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                          placeholder="Atualize o texto"
                          autoFocus
                        />
                        {isCheckbox && (
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              value={editingCategory}
                              onChange={(event) => setEditingCategory(event.target.value)}
                              className="min-w-[140px] flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                              placeholder="Categoria"
                            />
                            <input
                              type="date"
                              value={editingDueDate}
                              onChange={(event) => setEditingDueDate(event.target.value)}
                              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 focus:border-indigo-400 focus:outline-none"
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEditing(todo)}
                            disabled={isSaveDisabled}
                            className={`rounded-lg border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                              isSaveDisabled
                                ? "border-slate-700 bg-slate-900/60 text-slate-500"
                                : "border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                            }`}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`${
                            isCompleted ? "text-slate-500 line-through" : "text-slate-100"
                          }`}
                        >
                          {todo.text}
                        </span>
                        {showMeta && (
                          <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-400">
                            {todo.inputType === "text" && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                Texto
                              </span>
                            )}
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
                            {islandLabel && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                                {islandLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode && canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        isEditing ? handleCancelEditing() : handleStartEditing(todo)
                      }
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] transition ${
                        isEditing
                          ? "border-amber-300/70 bg-amber-500/20 text-amber-100"
                          : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60"
                      }`}
                      title={isEditing ? "Cancelar edição" : "Editar input"}
                    >
                      ✏️
                    </button>
                  )}
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
                    {todo.phase ? phaseLabels[todo.phase] : "Sem fase"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
