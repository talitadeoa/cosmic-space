'use client';

import { useMemo } from 'react';
import type { SavedTodo, MoonPhase } from '@/app/cosmos/utils/todoStorage';

export interface ChronologicalGroup {
  label: string;
  groupKey: string;
  startDate: Date;
  endDate: Date;
  dominantPhase?: MoonPhase;
  todos: SavedTodo[];
  metadata: {
    isCurrentWeek: boolean;
    daysUntilEnd: number;
    todoCount: number;
  };
}

type GroupBy = 'week' | 'month' | 'phase';

export function useChronologicalTodos(
  todos: SavedTodo[],
  groupBy: GroupBy = 'week'
): ChronologicalGroup[] {
  return useMemo(() => {
    const now = new Date();
    const groups = new Map<string, ChronologicalGroup>();

    // Ordenar todos por data
    const sortedTodos = [...todos].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : now;
      const dateB = b.createdAt ? new Date(b.createdAt) : now;
      return dateA.getTime() - dateB.getTime();
    });

    sortedTodos.forEach((todo) => {
      const todoDate = todo.createdAt ? new Date(todo.createdAt) : now;
      let groupKey = '';
      let startDate = new Date();
      let endDate = new Date();
      let label = '';

      if (groupBy === 'week') {
        const dayOfWeek = todoDate.getDay();
        const diff = todoDate.getDate() - dayOfWeek;
        startDate = new Date(todoDate);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
        const day = startDate.getDate().toString().padStart(2, '0');
        const endDay = endDate.getDate().toString().padStart(2, '0');

        groupKey = `week-${startDate.getFullYear()}-${month}-${day}`;
        label = `Semana ${day}/${month} - ${endDay}/${month}`;
      } else if (groupBy === 'month') {
        startDate = new Date(todoDate.getFullYear(), todoDate.getMonth(), 1);
        endDate = new Date(todoDate.getFullYear(), todoDate.getMonth() + 1, 0);

        const monthName = startDate.toLocaleString('pt-BR', {
          month: 'long',
        });
        const year = startDate.getFullYear();

        groupKey = `month-${year}-${startDate.getMonth()}`;
        label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ` ${year}`;
      } else if (groupBy === 'phase') {
        const phase = todo.phase || 'sem-fase';
        groupKey = `phase-${phase}`;
        label = phase === 'sem-fase' ? 'Sem Fase' : phase;
        startDate = new Date(1970, 0, 1);
        endDate = new Date(2099, 11, 31);
      }

      if (!groups.has(groupKey)) {
        const isCurrentWeek = groupBy === 'week' && now >= startDate && now <= endDate;

        const daysUntilEnd = Math.max(
          0,
          Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );

        groups.set(groupKey, {
          label,
          groupKey,
          startDate,
          endDate,
          dominantPhase: undefined,
          todos: [],
          metadata: {
            isCurrentWeek,
            daysUntilEnd,
            todoCount: 0,
          },
        });
      }

      const group = groups.get(groupKey)!;
      group.todos.push(todo);
      group.metadata.todoCount++;
      if (!group.dominantPhase) {
        group.dominantPhase = todo.phase;
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
  }, [todos, groupBy]);
}
