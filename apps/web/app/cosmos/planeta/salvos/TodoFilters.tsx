/**
 * 🎛️ TodoFilters - Filtros do painel de todos
 * 
 * Componente extraído do SavedTodosPanel para facilitar manutenção.
 */

'use client';

import { memo } from 'react';
import type { InputTypeFilter, TodoStatusFilter } from './types';
import type { CategoryFilter } from '@/types/planetState';

interface TodoFiltersProps {
  inputTypeFilter: InputTypeFilter;
  todoStatusFilter: TodoStatusFilter;
  categoryFilter: CategoryFilter;
  onInputTypeFilterChange?: (filter: InputTypeFilter) => void;
  onTodoStatusFilterChange?: (filter: TodoStatusFilter) => void;
  onCategoryFilterChange?: (filter: CategoryFilter) => void;
  className?: string;
  showInputType?: boolean;
  showTodoStatus?: boolean;
  showCategory?: boolean;
}

/**
 * Componente de filtros para a lista de todos
 */
export const TodoFilters = memo(function TodoFilters({
  inputTypeFilter,
  todoStatusFilter,
  categoryFilter,
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
  onCategoryFilterChange,
  className = '',
  showInputType = true,
  showTodoStatus = true,
  showCategory = true,
}: TodoFiltersProps) {
  const isTextFilter = inputTypeFilter === 'text';
  const isTodoFilter = inputTypeFilter === 'checkbox';

  return (
    <div className={`flex flex-col items-end gap-3 ${className}`}>
      {/* Filtros principais: Texto e Tarefas em um container */}
      {showInputType && (
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
            📝 Textos
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
      )}

      {/* Filtros de status (só aparecem quando filtro de tarefas está ativo) */}
      {showTodoStatus && isTodoFilter && (
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

      {showCategory && (
        <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 flex-wrap">
          {(['Principal', 'Secundária'] as CategoryFilter[]).map((category) => {
            const isActive = categoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const nextFilter = isActive ? 'all' : category;
                  onCategoryFilterChange?.(nextFilter);
                }}
                className={`rounded-full px-3 py-1 transition text-[0.6rem] font-semibold uppercase tracking-[0.12em] min-w-[95px] whitespace-nowrap ${
                  isActive ? 'bg-indigo-500/30 text-indigo-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {category === 'Principal' ? '⚡Principal' : '🫧Secundária'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default TodoFilters;
