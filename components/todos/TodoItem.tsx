'use client';

import React, { memo, useCallback } from 'react';
import type { SavedTodo, IslandId, MoonPhase } from '@/types';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, type IslandNames } from '@/app/cosmos/utils/islandNames';

export interface TodoItemProps {
  todo: SavedTodo;
  isSelected: boolean;
  isEditing: boolean;
  editingText: string;
  editingCategory?: string;
  editingDueDate?: string;
  isSelectionMode: boolean;
  isEditMode: boolean;
  islandNames?: IslandNames;
  isSaveDisabled?: boolean;
  swipeDeleteId?: string | null;
  
  // Callbacks
  onToggleComplete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onStartEdit: (todo: SavedTodo) => void;
  onUpdateEditText: (text: string) => void;
  onUpdateEditCategory: (category: string) => void;
  onUpdateEditDueDate: (dueDate: string) => void;
  onSaveEdit: (todo: SavedTodo) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  
  // Drag/Drop
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  
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
  editingCategory = '',
  editingDueDate = '',
  isSelectionMode,
  isEditMode,
  islandNames,
  isSaveDisabled = false,
  swipeDeleteId = null,
  onToggleComplete,
  onToggleSelect,
  onStartEdit,
  onUpdateEditText,
  onUpdateEditCategory,
  onUpdateEditDueDate,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDragStart,
  onDragEnd,
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
  const showMeta =
    todo.inputType === 'text' || todo.category || todo.dueDate || islandLabel;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSelectionMode && onSelectionTouchStart) {
      onSelectionTouchStart(todo.id, e);
      return;
    }
    onTouchStart?.(todo.id)(e);
  }, [isSelectionMode, todo.id, onSelectionTouchStart, onTouchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isSelectionMode) {
      onSelectionTouchEnd?.();
      return;
    }
    onTouchEnd?.(todo.id)(e);
  }, [isSelectionMode, todo.id, onSelectionTouchEnd, onTouchEnd]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isSelectionMode) {
      onSelectionTouchMove?.(e);
    } else {
      onTouchMove?.(e);
    }
  }, [isSelectionMode, onSelectionTouchMove, onTouchMove]);

  return (
    <div
      key={todo.id}
      data-todo-id={todo.id}
      draggable={!isEditMode}
      role="article"
      aria-label={`Tarefa: ${todo.text}`}
      onDragStart={
        !isEditMode
          ? (event) => {
              onDragStart(todo.id)(event);
            }
          : undefined
      }
      onDragEnd={!isEditMode ? onDragEnd : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`group relative flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/30 transition hover:border-indigo-500/60 hover:bg-slate-900/90 ${
        isSelected
          ? 'border-emerald-400/70 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-900/80'
      }`}
    >
      <div className="flex items-start gap-3">
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
            <div className="flex flex-col gap-2">
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
              {isCheckbox && (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={editingCategory}
                    onChange={(event) => onUpdateEditCategory(event.target.value)}
                    className="min-w-[140px] flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    placeholder="Categoria"
                  />
                  <input
                    type="date"
                    value={editingDueDate}
                    onChange={(event) => onUpdateEditDueDate(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] text-slate-100 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
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
              </div>
            </div>
          ) : (
            <>
              <span
                className={`${
                  isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'
                }`}
              >
                {todo.text}
              </span>
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
      <div className="flex items-center gap-2 shrink-0">
        {isSelectionMode && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelect(todo.id);
            }}
            aria-pressed={isSelected}
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

        <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
          {todo.phase ? phaseLabels[todo.phase] : 'Sem fase'}
        </span>
      </div>

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
