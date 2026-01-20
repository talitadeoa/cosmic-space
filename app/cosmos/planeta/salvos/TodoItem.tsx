'use client';

import React, { memo, useCallback, useRef } from 'react';
import type { SavedTodo, } from '@/app/cosmos/utils/todoStorage';
import type { IslandId } from '@/types/todo';
import { getIslandLabel, ISLAND_IDS, type IslandNames } from '@/app/cosmos/utils/islandNames';

export interface TodoItemProps {
  todo: SavedTodo;
  isSelected: boolean;
  isEditing: boolean;
  editingText: string;
  editingTodoId?: string | null;
  subtasks?: SavedTodo[];
  isExpanded?: boolean;
  editingCategory?: string;
  editingDueDate?: string;
  editingDepth?: number;
  editingIslandId?: IslandId | '';
  editingParentId?: string;
  isSelectionMode: boolean;
  isEditMode: boolean;
  islandNames?: IslandNames;
  islandIds?: IslandId[];
  activeDropTodoId?: string | null;
  isSaveDisabled?: boolean;
  swipeDeleteId?: string | null;
  onToggleExpand?: (todoId: string) => void;
  
  // Callbacks
  onToggleComplete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onStartEdit: (todo: SavedTodo) => void;
  onUpdateEditText: (text: string) => void;
  onUpdateEditCategory: (category: string) => void;
  onUpdateEditDepth: (depth: number) => void;
  onUpdateEditIsland: (islandId: IslandId | '') => void;
  onUpdateEditDueDate: (dueDate: string) => void;
  onSaveEdit: (todo: SavedTodo) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  
  // Drag/Drop
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onDropTodo?: (todo: SavedTodo) => (event: React.DragEvent) => void;
  onDragOverTodo?: (todo: SavedTodo) => (event: React.DragEvent) => void;
  onDragLeaveTodo?: () => void;
  
  // Touch
  onTouchStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchEnd?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  
  // Selection touch
  onSelectionTouchStart?: (todoId: string, event: React.TouchEvent) => void;
  onSelectionTouchMove?: (event: React.TouchEvent) => void;
  onSelectionTouchEnd?: () => void;
}

/**
 * Componente individual de um item de tarefa
 * 
 * Responsabilidades:
 * - Renderizar um único todo com todos seus estados
 * - Suportar edição inline
 * - Drag-drop e swipe delete
 * - Múltipla seleção
 */
export const TodoItem = memo(function TodoItem({
  todo,
  isSelected,
  isEditing,
  editingText,
  editingTodoId,
  subtasks = [],
  isExpanded = false,
  editingCategory = '',
  editingDueDate = '',
  editingIslandId = '',
  editingParentId = '',
  isSelectionMode,
  isEditMode,
  islandNames,
  islandIds,
  activeDropTodoId,
  isSaveDisabled = false,
  swipeDeleteId = null,
  onToggleExpand,
  onToggleComplete,
  onToggleSelect,
  onStartEdit,
  onUpdateEditText,
  onUpdateEditCategory,
  onUpdateEditIsland,
  onUpdateEditDueDate,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropTodo,
  onDragOverTodo,
  onDragLeaveTodo,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onSelectionTouchStart,
  onSelectionTouchMove,
  onSelectionTouchEnd,
}: TodoItemProps) {
  const islandLabel = getIslandLabel(todo.islandId, islandNames);
  const isCheckbox = todo.inputType === 'checkbox';
  const isCompleted = isCheckbox && todo.completed;
  const isDropTarget = activeDropTodoId === todo.id;
  const hasSubtasks = subtasks.length > 0;
  const showMeta =
    todo.inputType === 'text' || todo.category || todo.dueDate || islandLabel;
  const lastTapRef = useRef(0);

  const maybeStartEditing = useCallback(() => {
    if (isSelectionMode || isEditing) return;
    onStartEdit(todo);
  }, [isSelectionMode, isEditing, onStartEdit, todo]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    const isSelectionHandle = Boolean(target?.closest('[data-selection-handle="true"]'));

    if (isSelectionMode) {
      if (isSelectionHandle && onSelectionTouchStart) {
        onSelectionTouchStart(todo.id, e);
      }
      return;
    }

    onTouchStart?.(todo.id)(e);
  }, [isSelectionMode, todo.id, onSelectionTouchStart, onTouchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isSelectionMode) {
      onSelectionTouchEnd?.();
      return;
    }
    const now = e.timeStamp;
    const isDoubleTap = now - lastTapRef.current < 350;
    if (isDoubleTap) {
      lastTapRef.current = 0;
      e.stopPropagation();
      maybeStartEditing();
    } else {
      lastTapRef.current = now;
    }
    onTouchEnd?.(todo.id)(e);
  }, [isSelectionMode, todo.id, onSelectionTouchEnd, onTouchEnd, maybeStartEditing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isSelectionMode) {
      onSelectionTouchMove?.(e);
    } else {
      onTouchMove?.(e);
    }
  }, [isSelectionMode, onSelectionTouchMove, onTouchMove]);

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (isEditMode) return;
      onDragOverTodo?.(todo)(event);
    },
    [isEditMode, onDragOverTodo, todo]
  );

  const handleDragLeave = useCallback(() => {
    if (isEditMode) return;
    onDragLeaveTodo?.();
  }, [isEditMode, onDragLeaveTodo]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      if (isEditMode) return;
      onDropTodo?.(todo)(event);
    },
    [isEditMode, onDropTodo, todo]
  );

  const handleToggleExpand = useCallback(() => {
    if (!hasSubtasks || isEditing) return;
    onToggleExpand?.(todo.id);
  }, [hasSubtasks, isEditing, onToggleExpand, todo.id]);

  return (
    <div
      key={todo.id}
      data-todo-id={todo.id}
      draggable={!isEditMode}
      role="article"
      aria-label={`Tarefa: ${todo.text}`}
      aria-expanded={hasSubtasks ? isExpanded : undefined}
      onDragStart={
        !isEditMode
          ? (event) => {
              onDragStart(todo.id)(event);
            }
          : undefined
      }
      onDragEnd={!isEditMode ? onDragEnd : undefined}
      onDragOver={!isEditMode ? handleDragOver : undefined}
      onDragLeave={!isEditMode ? handleDragLeave : undefined}
      onDrop={!isEditMode ? handleDrop : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[data-todo-action="true"]')) return;
        handleToggleExpand();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        maybeStartEditing();
      }}
      data-stop-background-click="true"
      className={`group relative flex flex-col gap-2 rounded-2xl border px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/30 transition ${
        isDropTarget
          ? 'border-emerald-400/80 ring-2 ring-emerald-400/50'
        : isSelected
          ? 'border-emerald-400/70 bg-emerald-500/10'
        : isExpanded && hasSubtasks
          ? 'border-slate-500/80 bg-slate-900/90'
          : 'border-slate-700 bg-slate-900/80'
      } ${hasSubtasks ? 'cursor-pointer hover:border-indigo-400/60 hover:bg-slate-900/90' : 'hover:border-indigo-500/60 hover:bg-slate-900/90'}`}
      style={{ paddingLeft: '12px' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox ou indicador de tipo */}
          {isCheckbox ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleComplete(todo.id);
              }}
              aria-pressed={todo.completed}
              aria-label={todo.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
              data-todo-action="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.65rem] transition ${
                todo.completed
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-500 bg-slate-900/80 text-slate-400 hover:border-emerald-400/70'
              }`}
            >
              {todo.completed && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
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

          {/* Conteúdo */}
          <div className="flex flex-col gap-1 flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-3" data-todo-action="true">
                <input
                  type="text"
                  value={editingText}
                  onChange={(event) => onUpdateEditText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      onSaveEdit(todo);
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      onCancelEdit();
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  placeholder="Atualize o texto"
                  autoFocus
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  {isCheckbox && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:flex-wrap">
                      <div className="flex items-center gap-2 text-[0.7rem] text-slate-300">
                        <span className="text-[0.65rem] uppercase tracking-[0.14em] text-slate-400">
                          Categoria
                        </span>
                        <div className="flex gap-1">
                          {['Principal', 'Secundária'].map((preset) => {
                            const isActive = editingCategory === preset;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() =>
                                  onUpdateEditCategory(isActive ? '' : preset)
                                }
                                className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                                  isActive
                                    ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-300/70'
                                    : 'text-slate-300 border border-slate-700 hover:border-indigo-400/60'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          value={editingIslandId ?? ''}
                          onChange={(event) =>
                            onUpdateEditIsland(
                              (event.target.value as IslandId) || ''
                            )
                          }
                          className="min-w-[140px] w-fit rounded-lg border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[0.65rem] text-slate-100 focus:border-indigo-400 focus:outline-none"
                        >
                          <option value="">Sem ilha</option>
                          {(islandIds && islandIds.length > 0 ? islandIds : ISLAND_IDS).map(
                            (islandId) => (
                              <option key={islandId} value={islandId}>
                                {getIslandLabel(islandId, islandNames) ?? islandId}
                              </option>
                            )
                          )}
                        </select>
                        <input
                          type="date"
                          value={editingDueDate}
                          onChange={(event) => onUpdateEditDueDate(event.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center">
                    <button
                      type="button"
                      onClick={() => onSaveEdit(todo)}
                      disabled={isSaveDisabled}
                      className={`rounded-lg border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                        isSaveDisabled
                          ? 'border-slate-700 bg-slate-900/60 text-slate-500'
                          : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                      }`}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(todo.id)}
                      className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-lg border border-red-600/60 bg-red-500/15 text-[0.7rem] transition hover:bg-red-500/25"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'
                    }`}
                  >
                    {todo.text}
                  </span>
                  {hasSubtasks && (
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] transition ${
                        isExpanded
                          ? 'border-sky-300/70 bg-sky-500/20 text-sky-100'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      <span
                        className={`transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      >
                        ▼
                      </span>
                      {subtasks.length} subtarefas
                    </span>
                  )}
                </div>
                {showMeta && (
                  <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-400">
                    {todo.inputType === 'text' && (
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

        {/* Actions e fase */}
        <div className="flex items-center gap-2 shrink-0" data-todo-action="true">
          {isSelectionMode && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelect(todo.id);
              }}
              aria-pressed={isSelected}
              data-selection-handle="true"
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.6rem] transition ${
                isSelected
                  ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                  : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-emerald-300/60'
              }`}
              title={isSelected ? 'Desmarcar' : 'Selecionar'}
            >
              {isSelected ? '✓' : ''}
            </button>
          )}

          {isEditMode && (
            <button
              type="button"
              onClick={() => (isEditing ? onCancelEdit() : onStartEdit(todo))}
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] transition ${
                isEditing
                  ? 'border-amber-300/70 bg-amber-500/20 text-amber-100'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60'
              }`}
              title={isEditing ? 'Cancelar edição' : 'Editar input'}
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {hasSubtasks && isExpanded && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-inner shadow-black/20">
          <div className="divide-y divide-white/10">
            {subtasks.map((subtask) => {
              const isSubtaskCompleted = subtask.inputType === 'checkbox' && subtask.completed;
              const isEditingSubtask = editingTodoId === subtask.id;
              return (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 px-3 py-2"
                  draggable={!isEditMode}
                  onDragStart={
                    !isEditMode
                      ? (event) => {
                          event.stopPropagation();
                          onDragStart(subtask.id)(event);
                        }
                      : undefined
                  }
                  onDragEnd={!isEditMode ? onDragEnd : undefined}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onStartEdit(subtask);
                  }}
                  data-todo-action="true"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleComplete(subtask.id);
                    }}
                    aria-pressed={isSubtaskCompleted}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      isSubtaskCompleted
                        ? 'border-sky-400 bg-sky-500/80 text-white'
                        : 'border-sky-300 bg-white/50 text-sky-500'
                    }`}
                  >
                    {isSubtaskCompleted && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </button>

                  {isEditingSubtask ? (
                    <div className="flex flex-1 flex-col gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(event) => onUpdateEditText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            onSaveEdit(subtask);
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            onCancelEdit();
                          }
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                        placeholder="Editar subtarefa"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center">
                        <button
                          type="button"
                          onClick={() => onSaveEdit(subtask)}
                          disabled={isSaveDisabled}
                          className={`rounded-lg border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
                            isSaveDisabled
                              ? 'border-slate-700 bg-slate-900/60 text-slate-500'
                              : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                          }`}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1">
                      <span
                        className={`text-[0.95rem] ${
                          isSubtaskCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
                        }`}
                      >
                        {subtask.text}
                      </span>
                    </div>
                  )}

                  {!isEditingSubtask && (
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg text-slate-200"
                      aria-hidden
                      title="Arraste para reordenar"
                    >
                      ⠿
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Swipe delete overlay */}
      {swipeDeleteId === todo.id && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center gap-2 rounded-r-xl bg-red-500/20 border-l border-red-500/50 px-3 pl-4"
          role="region"
          aria-label="Ações de deleção"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onDelete(todo.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-red-400 bg-red-500/30 text-[0.7rem] text-red-200 transition hover:bg-red-500/50"
            title="Deletar input"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
});

export default TodoItem;
