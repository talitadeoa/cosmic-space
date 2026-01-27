/**
 * Hook para gerenciar gestos de touch e drag no SavedTodosPanel
 */
'use client';

import { useCallback, useRef } from 'react';
import type { SavedTodo } from '@/client/storage';

export function useTodoGestures(
  savedTodos: SavedTodo[],
  onToggleComplete: (todoId: string) => void,
  onStartEditing: (todo: SavedTodo) => void,
  onSetSwipeDelete: (todoId: string) => void,
  onTouchStart?: (todoId: string) => (e: React.TouchEvent) => void,
  onTouchEnd?: (todoId: string) => (e: React.TouchEvent) => void,
  onTouchMove?: (e: React.TouchEvent) => void
) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    []
  );

  const handleItemTouchEnd = useCallback(
    (todoId: string) => (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const duration = Date.now() - touchStartRef.current.time;
      const distX = touch.clientX - touchStartRef.current.x;
      const distY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Swipe gesture
      if (distance >= 40 && duration <= 400) {
        if (Math.abs(distX) > Math.abs(distY)) {
          if (distX > 0) {
            onToggleComplete(todoId);
          } else {
            onSetSwipeDelete(todoId);
          }
        }
      }
      // Double tap gesture
      else if (distance < 30 && duration < 300) {
        const now = Date.now();
        if (lastTapRef.current) {
          const timeSinceLastTap = now - lastTapRef.current.time;
          const distFromLastTap = Math.sqrt(
            Math.pow(touch.clientX - lastTapRef.current.x, 2) +
              Math.pow(touch.clientY - lastTapRef.current.y, 2)
          );

          if (timeSinceLastTap < 300 && distFromLastTap < 50) {
            if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
            const todo = savedTodos.find((t) => t.id === todoId);
            if (todo) onStartEditing(todo);
            lastTapRef.current = null;
          } else {
            lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
          }
        } else {
          lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
          if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
          doubleTapTimeoutRef.current = setTimeout(() => {
            lastTapRef.current = null;
          }, 500);
        }
      }

      touchStartRef.current = null;
    },
    [savedTodos, onToggleComplete, onStartEditing, onSetSwipeDelete]
  );

  const handleDragOverView = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    handleItemTouchStart,
    handleItemTouchEnd,
    handleDragOverView,
    touchStartRef,
  };
}
