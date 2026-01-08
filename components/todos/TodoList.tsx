'use client';

import React, { memo } from 'react';
import type { SavedTodo, IslandId } from '@/app/cosmos/utils/todoStorage';
import type { IslandNames } from '@/app/cosmos/utils/islandNames';
import { TodoItem } from './TodoItem';
import { EmptyState } from '@/app/cosmos/components/EmptyState';
import type { TodoPanelState } from './types';

interface TodoListProps {
  todos: SavedTodo[];
  displayedTodos: SavedTodo[];
  isEditMode: boolean;
  isSelectionMode: boolean;
  editingTodoId: string | null;
  editingText: string;
  editingCategory?: string;
  editingDueDate?: string;
  swipeDeleteId: string | null;
  selectedTodoIds: string[];
  islandNames?: IslandNames;
  
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
  onTouchEnd?: () => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  
  // Selection touch
  onSelectionTouchStart?: (todoId: string, event: React.TouchEvent) => void;
  onSelectionTouchMove?: (event: React.TouchEvent) => void;
  onSelectionTouchEnd?: () => void;
  
  // Meta
  emptyTitle?: string;
  emptyDescription?: string;
  selectedPhase?: string | null;
  islandLabel?: string | null;
}

/**
 * Componente que renderiza a lista paginada de todos
 * 
 * Responsabilidades:
 * - Renderizar lista de TodoItems
 * - EmptyState quando não há tarefas
 * - Touch selection helpers
 */
export const TodoList = memo(function TodoList({
  todos,
  displayedTodos,
  isEditMode,
  isSelectionMode,
  editingTodoId,
  editingText,
  editingCategory = '',
  editingDueDate = '',
  swipeDeleteId = null,
  selectedTodoIds,
  islandNames,
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
  emptyTitle = 'Nada salvo',
  emptyDescription = 'Adicione ou selecione uma fase lunar.',
}: TodoListProps) {
  const isSaveDisabled = !editingText.trim();

  return (
    <div
      className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 sm:max-h-[70vh] lg:max-h-[75vh]"
      onTouchMove={onSelectionTouchMove}
      onTouchEnd={onSelectionTouchEnd}
      onTouchCancel={onSelectionTouchEnd}
    >
      {displayedTodos.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon="✨"
        />
      ) : (
        displayedTodos.map((todo) => {
          const isSelected = selectedTodoIds.includes(todo.id);
          const isEditing = editingTodoId === todo.id;

          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              isSelected={isSelected}
              isEditing={isEditing}
              editingText={editingText}
              editingCategory={editingCategory}
              editingDueDate={editingDueDate}
              isSelectionMode={isSelectionMode}
              isEditMode={isEditMode}
              islandNames={islandNames}
              isSaveDisabled={isSaveDisabled}
              swipeDeleteId={swipeDeleteId}
              onToggleComplete={onToggleComplete}
              onToggleSelect={onToggleSelect}
              onStartEdit={onStartEdit}
              onUpdateEditText={onUpdateEditText}
              onUpdateEditCategory={onUpdateEditCategory}
              onUpdateEditDueDate={onUpdateEditDueDate}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchMove}
              onSelectionTouchStart={onSelectionTouchStart}
              onSelectionTouchMove={onSelectionTouchMove}
              onSelectionTouchEnd={onSelectionTouchEnd}
            />
          );
        })
      )}
    </div>
  );
});

export default TodoList;
