'use client';

import { useCallback } from 'react';
import type { SavedTodo, MoonPhase, IslandId } from '@/types/todo';
import type { TodoView } from '@/app/cosmos/planeta/salvos/types';

interface UseTodoDragDropOptions {
  savedTodos: SavedTodo[];
  selectedTodoIds: string[];
  isSelectionMode: boolean;
  selectedPhase: MoonPhase | null | undefined;
  selectedIsland: IslandId | null | undefined;
  onUpdateTodo?: (todoId: string, updates: Partial<SavedTodo>) => void;
  onViewChange?: (view: TodoView) => void;
  onClearSelection: () => void;
  onDropInside?: () => void;
  setViewDrop: (view: string | null) => void;
}

type DropView = 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo';

/**
 * Calcula a data para uma visualização
 */
function getDateForView(viewType: string): string | undefined {
  const today = new Date();

  switch (viewType) {
    case 'lua-atual': {
      const date = new Date(today);
      date.setDate(today.getDate() + 4);
      return date.toISOString().split('T')[0];
    }
    case 'proxima-fase': {
      const date = new Date(today);
      date.setDate(today.getDate() + 12);
      return date.toISOString().split('T')[0];
    }
    case 'proximo-ciclo': {
      const date = new Date(today);
      date.setMonth(today.getMonth() + 1);
      date.setDate(1);
      return date.toISOString().split('T')[0];
    }
    default:
      return undefined;
  }
}

/**
 * Determina o phaseCycle baseado na view
 */
function getPhaseCycleForView(viewType: string): 'current' | 'next' | undefined {
  switch (viewType) {
    case 'lua-atual':
      return 'current';
    case 'proxima-fase':
    case 'proximo-ciclo':
      return 'next';
    default:
      return undefined;
  }
}

/**
 * Hook para gerenciar drag and drop de tarefas
 */
export function useTodoDragDrop({
  savedTodos,
  selectedTodoIds,
  isSelectionMode,
  selectedPhase,
  selectedIsland,
  onUpdateTodo,
  onViewChange,
  onClearSelection,
  onDropInside,
  setViewDrop,
}: UseTodoDragDropOptions) {
  /**
   * Retorna IDs das tarefas sendo arrastadas
   */
  const getDragTodoIds = useCallback(
    (todoId: string): string[] => {
      if (isSelectionMode && selectedTodoIds.includes(todoId) && selectedTodoIds.length > 0) {
        return selectedTodoIds;
      }
      return [todoId];
    },
    [isSelectionMode, selectedTodoIds]
  );

  /**
   * Handler para drop em uma view
   */
  const handleDropOnView = useCallback(
    (viewType: DropView) => (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Extrair IDs das tarefas
      const rawTodoIds = event.dataTransfer.getData('text/todo-ids');
      let todoIds: string[] = [];

      if (rawTodoIds) {
        try {
          const parsed = JSON.parse(rawTodoIds);
          if (Array.isArray(parsed)) {
            todoIds = parsed.filter((id) => typeof id === 'string');
          }
        } catch (error) {
          console.warn('Falha ao ler seleção de tarefas:', error);
        }
      }

      if (todoIds.length === 0) {
        const todoId = event.dataTransfer.getData('text/todo-id');
        if (todoId) todoIds = [todoId];
      }

      if (todoIds.length === 0) return;

      // NÃO mudar a view automaticamente - apenas atualizar os dados
      // onViewChange?.(viewType); // REMOVIDO: view não deve mudar automaticamente

      if (viewType === 'em-aberto' && onUpdateTodo) {
        // Mover para "em aberto": limpar tudo
        todoIds.forEach((id) => {
          const todo = savedTodos.find((t) => t.id === id);
          if (todo) {
            onUpdateTodo(id, {
              dueDate: undefined,
              phase: undefined,
              islandId: undefined,
              phaseCycle: undefined,
            });
          }
        });
      } else if (onUpdateTodo) {
        const dueDate = getDateForView(viewType);
        const phaseCycleValue = getPhaseCycleForView(viewType);

        if (dueDate) {
          todoIds.forEach((id) => {
            const todo = savedTodos.find((t) => t.id === id);
            if (todo) {
              const updates: Partial<SavedTodo> = {
                dueDate,
                phaseCycle: phaseCycleValue,
              };

              // Preservar ou atribuir fase
              if (!todo.phase && selectedPhase) {
                updates.phase = selectedPhase;
              } else if (todo.phase) {
                updates.phase = todo.phase;
              }

              // Preservar ou atribuir ilha
              if (!todo.islandId && selectedIsland) {
                updates.islandId = selectedIsland;
              } else if (todo.islandId) {
                updates.islandId = todo.islandId;
              }

              onUpdateTodo(id, updates);
            }
          });
        }
      }

      setViewDrop(null);
      onClearSelection();
      onDropInside?.();
    },
    [savedTodos, onViewChange, onUpdateTodo, selectedPhase, selectedIsland, onClearSelection, onDropInside, setViewDrop]
  );

  const handleDragOverView = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnterView = useCallback(
    (viewType: string) => () => {
      setViewDrop(viewType);
    },
    [setViewDrop]
  );

  const handleDragLeaveView = useCallback(() => {
    setViewDrop(null);
  }, [setViewDrop]);

  return {
    getDragTodoIds,
    handleDropOnView,
    handleDragOverView,
    handleDragEnterView,
    handleDragLeaveView,
    getDateForView,
    getPhaseCycleForView,
  };
}
