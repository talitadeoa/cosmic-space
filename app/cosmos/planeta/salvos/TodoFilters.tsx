/**
 * 🎛️ TodoFilters - Filtros do painel de todos
 * 
 * Componente extraído do SavedTodosPanel para facilitar manutenção.
 */

'use client';

import { memo } from 'react';
import type { InputTypeFilter, TodoStatusFilter } from './types';

interface TodoFiltersProps {
  inputTypeFilter: InputTypeFilter;
  todoStatusFilter: TodoStatusFilter;
  onInputTypeFilterChange?: (filter: InputTypeFilter) => void;
  onTodoStatusFilterChange?: (filter: TodoStatusFilter) => void;
  className?: string;
}

/**
 * Componente de filtros para a lista de todos
 */
export const TodoFilters = memo(function TodoFilters({
  inputTypeFilter,
  todoStatusFilter,
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
  className = '',
}: TodoFiltersProps) {
  const isTextFilter = inputTypeFilter === 'text';
  const isTodoFilter = inputTypeFilter === 'checkbox';
  const isOpenFilter = todoStatusFilter === 'open';
  const isCompletedFilter = todoStatusFilter === 'completed';

  return (
    <div className={`flex flex-col items-start gap-3 ${className}`}>
      {/* Filtros principais: Texto e Tarefas em um container */}
      <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1.5">
        <button
          type="button"
          onClick={() => {
            const nextFilter = inputTypeFilter === 'text' ? 'all' : 'text';
            onInputTypeFilterChange?.(nextFilter);
          }}
          className={`rounded-full px-3 py-1 transition text-[0.6rem] font-semibold uppercase tracking-[0.2em] min-w-[65px] whitespace-nowrap ${
            isTextFilter
              ? 'bg-indigo-500/30 text-indigo-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📝 Texto
        </button>
        <button
          type="button"
          onClick={() => {
            const nextFilter = inputTypeFilter === 'checkbox' ? 'all' : 'checkbox';
            onInputTypeFilterChange?.(nextFilter);
          }}
          className={`rounded-full px-3 py-1 transition text-[0.6rem] font-semibold uppercase tracking-[0.2em] min-w-[70px] whitespace-nowrap ${
            isTodoFilter
              ? 'bg-indigo-500/30 text-indigo-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ☑️ Tarefas
        </button>
      </div>

      {/* Filtros de status (só aparecem quando filtro de tarefas está ativo) */}
      {isTodoFilter && (
        <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1.5">
          <button
            type="button"
            onClick={() => onTodoStatusFilterChange?.('open')}
            className={`rounded-full px-3 py-1 transition text-[0.6rem] font-semibold uppercase tracking-[0.2em] min-w-[75px] whitespace-nowrap ${
              todoStatusFilter === 'open'
                ? 'bg-indigo-500/30 text-indigo-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Em aberto
          </button>
          <button
            type="button"
            onClick={() => onTodoStatusFilterChange?.('completed')}
            className={`rounded-full px-3 py-1 transition text-[0.6rem] font-semibold uppercase tracking-[0.2em] min-w-[75px] whitespace-nowrap ${
              todoStatusFilter === 'completed'
                ? 'bg-indigo-500/30 text-indigo-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completas
          </button>
        </div>
      )}
    </div>
  );
});

export default TodoFilters;
