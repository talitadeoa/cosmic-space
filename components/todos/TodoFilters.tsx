/**
 * 🎛️ TodoFilters - Filtros do painel de todos
 * 
 * Componente extraído do SavedTodosPanel para facilitar manutenção.
 */

'use client';

import React, { memo } from 'react';
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

  const handleStatusFilter = (status: 'open' | 'completed') => {
    const nextStatus = todoStatusFilter === status ? 'all' : status;
    onTodoStatusFilterChange?.(nextStatus);
  };

  // Estilos base
  const buttonBase = 'rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition';
  const activeStyle = 'border-indigo-400 bg-indigo-500/30 text-indigo-200';
  const inactiveStyle = 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Filtro: Texto */}
      <button
        type="button"
        onClick={handleTextFilter}
        className={`${buttonBase} ${isTextFilter ? activeStyle : inactiveStyle}`}
        aria-pressed={isTextFilter}
      >
        📝 Texto
      </button>

      {/* Filtro: Checkbox/Tarefas */}
      <button
        type="button"
        onClick={handleTodoFilter}
        className={`${buttonBase} ${isTodoFilter ? activeStyle : inactiveStyle}`}
        aria-pressed={isTodoFilter}
      >
        ☑️ Tarefas
      </button>

      {/* Filtros de status (só aparecem quando filtro de tarefas está ativo) */}
      {isTodoFilter && (
        <>
          <span className="text-slate-600">|</span>
          
          <button
            type="button"
            onClick={() => handleStatusFilter('open')}
            className={`${buttonBase} ${isOpenFilter ? activeStyle : inactiveStyle}`}
            aria-pressed={isOpenFilter}
          >
            Em aberto
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilter('completed')}
            className={`${buttonBase} ${isCompletedFilter ? activeStyle : inactiveStyle}`}
            aria-pressed={isCompletedFilter}
          >
            Completas
          </button>
        </>
      )}
    </div>
  );
});

export default TodoFilters;
