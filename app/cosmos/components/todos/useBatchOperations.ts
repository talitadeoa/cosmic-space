/**
 * Hook para gerenciar operações em lote (batch) no SavedTodosPanel
 */
'use client';

import { useCallback } from 'react';
import type { SavedTodo } from '@/types/community';

export function useBatchOperations(
  selectedTodoIds: string[],
  savedTodos: SavedTodo[],
  onBatchDelete?: (ids: string[]) => void,
  onBatchAssignPhase?: (ids: string[], phase: MoonPhase) => void,
  onBatchAssignIsland?: (ids: string[], islandId: IslandId) => void,
  onUpdateTodo?: (todoId: string, updates: Partial<SavedTodo>) => void
) {
  const selectedCount = selectedTodoIds.length;

  const handleBatchDelete = useCallback(() => {
    if (selectedCount === 0 || !onBatchDelete) return;
    onBatchDelete(selectedTodoIds);
  }, [selectedCount, selectedTodoIds, onBatchDelete]);

  const handleBatchAssignPhase = useCallback(
    (phase: MoonPhase) => {
      if (selectedCount === 0 || !onBatchAssignPhase) return;
      onBatchAssignPhase(selectedTodoIds, phase);
    },
    [selectedCount, selectedTodoIds, onBatchAssignPhase]
  );

  const handleBatchAssignIsland = useCallback(
    (islandId: IslandId) => {
      if (selectedCount === 0 || !onBatchAssignIsland) return;
      onBatchAssignIsland(selectedTodoIds, islandId);
    },
    [selectedCount, selectedTodoIds, onBatchAssignIsland]
  );

  const handleBatchMoveToView = useCallback(
    (
      viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo',
      getDateForView: (type: string) => string | undefined
    ) => {
      if (selectedCount === 0 || !onUpdateTodo) return;

      if (viewType === 'em-aberto') {
        selectedTodoIds.forEach((id) => {
          onUpdateTodo(id, { dueDate: undefined, phase: undefined, islandId: undefined });
        });
        return;
      }

      const dueDate = getDateForView(viewType);
      if (!dueDate) return;

      selectedTodoIds.forEach((id) => {
        onUpdateTodo(id, { dueDate });
      });
    },
    [selectedCount, selectedTodoIds, onUpdateTodo]
  );

  const handleDropOnView = useCallback(
    (
      viewType: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo',
      getDateForView: (type: string) => string | undefined,
      onUpdateTodo?: (todoId: string, updates: Partial<SavedTodo>) => void
    ) =>
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const rawTodoIds = event.dataTransfer.getData('text/todo-ids');
      let todoIds: string[] = [];
      
      if (rawTodoIds) {
        try {
          const parsed = JSON.parse(rawTodoIds);
          if (Array.isArray(parsed)) {
            todoIds = parsed.filter((id) => typeof id === 'string');
          }
        } catch (error) {
          console.warn('Falha ao ler seleção de to-dos:', error);
        }
      }

      if (todoIds.length === 0) {
        const todoId = event.dataTransfer.getData('text/todo-id');
        if (todoId) todoIds = [todoId];
      }

      if (todoIds.length === 0 || !onUpdateTodo) return;

      if (viewType !== 'em-aberto') {
        const dueDate = getDateForView(viewType);
        if (dueDate) {
          todoIds.forEach((id) => {
            const todo = savedTodos.find((t) => t.id === id);
            if (todo) {
              onUpdateTodo(id, { dueDate });
            }
          });
        }
      } else {
        todoIds.forEach((id) => {
          const todo = savedTodos.find((t) => t.id === id);
          if (todo) {
            onUpdateTodo(id, { dueDate: undefined, phase: undefined, islandId: undefined });
          }
        });
      }
    },
    [savedTodos]
  );

  return {
    selectedCount,
    handleBatchDelete,
    handleBatchAssignPhase,
    handleBatchAssignIsland,
    handleBatchMoveToView,
    handleDropOnView,
  };
}
