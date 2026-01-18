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

  const handleTextFilter = () => {
    const nextFilter = inputTypeFilter === 'text' ? 'all' : 'text';
    onInputTypeFilterChange?.(nextFilter);
  };

  const handleTodoFilter = () => {
    const nextFilter = inputTypeFilter === 'checkbox' ? 'all' : 'checkbox';
    onInputTypeFilterChange?.(nextFilter);
  };

  const handleStatusFilter = () => {
    const nextStatus = todoStatusFilter === 'open' ? 'completed' : 'open';
    onTodoStatusFilterChange?.(nextStatus);
  };

  // Estilos base
  const buttonBase = 'rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition min-w-[85px] flex items-center justify-center gap-1.5';
  const activeStyle = 'border-indigo-400 bg-indigo-500/30 text-indigo-200';
  const inactiveStyle = 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600';

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      {/* Filtros principais: Texto e Tarefas */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleTextFilter}
          className={`${buttonBase} ${isTextFilter ? activeStyle : inactiveStyle}`}
          aria-pressed={isTextFilter}
        >
          <span className="flex-shrink-0">📝</span>
          <span className="whitespace-nowrap">Texto</span>
        </button>

        <button
          type="button"
          onClick={handleTodoFilter}
          className={`${buttonBase} ${isTodoFilter ? activeStyle : inactiveStyle}`}
          aria-pressed={isTodoFilter}
        >
          <span className="flex-shrink-0">☑️</span>
          <span className="whitespace-nowrap">Tarefas</span>
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
