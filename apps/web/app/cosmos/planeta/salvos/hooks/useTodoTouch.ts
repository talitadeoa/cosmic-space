'use client';

import { useRef, useCallback } from 'react';
import type { SavedTodo } from '@/types/todo';

interface UseTodoTouchOptions {
  savedTodos: SavedTodo[];
  selectedTodoIds: string[];
  isSelectionMode: boolean;
  onToggleComplete: (todoId: string) => void;
  onStartEditing: (todo: SavedTodo) => void;
  onSetSwipeDelete: (todoId: string | null) => void;
  onUpdateSelection: (ids: string[]) => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

const SWIPE_MIN_DISTANCE = 40;
const SWIPE_MAX_DURATION = 400;
const TAP_MAX_DISTANCE = 30;
const TAP_MAX_DURATION = 300;
const DOUBLE_TAP_TIMEOUT = 500;
const DOUBLE_TAP_MAX_DISTANCE = 50;

/**
 * Hook para gerenciar gestos de toque em tarefas
 */
export function useTodoTouch({
  savedTodos,
  selectedTodoIds,
  isSelectionMode,
  onToggleComplete,
  onStartEditing,
  onSetSwipeDelete,
  onUpdateSelection,
}: UseTodoTouchOptions) {
  // Refs para rastrear gestos
  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionTouchActiveRef = useRef(false);
  const selectionTouchModeRef = useRef<'select' | 'deselect'>('select');
  const lastTouchedIdRef = useRef<string | null>(null);

  /**
   * Handler para início de toque em item
   */
  const handleItemTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  /**
   * Handler para fim de toque em item
   */
  const handleItemTouchEnd = useCallback(
    (todoId: string) => (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const duration = Date.now() - touchStartRef.current.time;
      const distX = touch.clientX - touchStartRef.current.x;
      const distY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Detectar swipe horizontal
      if (distance >= SWIPE_MIN_DISTANCE && duration <= SWIPE_MAX_DURATION) {
        if (Math.abs(distX) > Math.abs(distY)) {
          if (distX > 0) {
            // Swipe direita: completar
            onToggleComplete(todoId);
          } else {
            // Swipe esquerda: deletar
            onSetSwipeDelete(todoId);
          }
        }
      }
      // Detectar tap/double-tap
      else if (distance < TAP_MAX_DISTANCE && duration < TAP_MAX_DURATION) {
        const now = Date.now();

        if (lastTapRef.current) {
          const timeSinceLastTap = now - lastTapRef.current.time;
          const distFromLastTap = Math.sqrt(
            Math.pow(touch.clientX - lastTapRef.current.x, 2) +
              Math.pow(touch.clientY - lastTapRef.current.y, 2)
          );

          // Double tap detectado
          if (timeSinceLastTap < TAP_MAX_DURATION && distFromLastTap < DOUBLE_TAP_MAX_DISTANCE) {
            if (doubleTapTimeoutRef.current) {
              clearTimeout(doubleTapTimeoutRef.current);
            }
            const todo = savedTodos.find((t) => t.id === todoId);
            if (todo) {
              onStartEditing(todo);
            }
            lastTapRef.current = null;
          } else {
            lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
          }
        } else {
          lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };

          if (doubleTapTimeoutRef.current) {
            clearTimeout(doubleTapTimeoutRef.current);
          }

          doubleTapTimeoutRef.current = setTimeout(() => {
            lastTapRef.current = null;
          }, DOUBLE_TAP_TIMEOUT);
        }
      }

      touchStartRef.current = null;
    },
    [savedTodos, onToggleComplete, onSetSwipeDelete, onStartEditing]
  );

  /**
   * Aplica seleção/deseleção para um ID
   */
  const applySelectionForId = useCallback(
    (todoId: string, mode: 'select' | 'deselect') => {
      if (mode === 'select') {
        if (!selectedTodoIds.includes(todoId)) {
          onUpdateSelection([...selectedTodoIds, todoId]);
        }
      } else {
        onUpdateSelection(selectedTodoIds.filter((id) => id !== todoId));
      }
    },
    [selectedTodoIds, onUpdateSelection]
  );

  /**
   * Handler para início de toque em modo seleção
   */
  const handleSelectionTouchStart = useCallback(
    (todoId: string, event: React.TouchEvent) => {
      if (!isSelectionMode) return;
      event.preventDefault();

      const isSelected = selectedTodoIds.includes(todoId);
      const mode: 'select' | 'deselect' = isSelected ? 'deselect' : 'select';

      selectionTouchActiveRef.current = true;
      selectionTouchModeRef.current = mode;
      lastTouchedIdRef.current = todoId;

      applySelectionForId(todoId, mode);
    },
    [isSelectionMode, selectedTodoIds, applySelectionForId]
  );

  /**
   * Handler para movimento em modo seleção (multi-select por arraste)
   */
  const handleSelectionTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isSelectionMode || !selectionTouchActiveRef.current) return;
      event.preventDefault();

      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!element) return;

      const item = element.closest('[data-todo-id]') as HTMLElement | null;
      const todoId = item?.dataset.todoId;

      if (!todoId || todoId === lastTouchedIdRef.current) return;

      lastTouchedIdRef.current = todoId;
      applySelectionForId(todoId, selectionTouchModeRef.current);
    },
    [isSelectionMode, applySelectionForId]
  );

  /**
   * Handler para fim de toque em modo seleção
   */
  const handleSelectionTouchEnd = useCallback(() => {
    selectionTouchActiveRef.current = false;
    lastTouchedIdRef.current = null;
  }, []);

  return {
    handleItemTouchStart,
    handleItemTouchEnd,
    handleSelectionTouchStart,
    handleSelectionTouchMove,
    handleSelectionTouchEnd,
  };
}
