'use client';

import React from 'react';
import { TodoFilters } from '@/app/cosmos/planeta/salvos/TodoFilters';
import type { CategoryFilter } from '@/types/planetState';

interface TodoModeButtonsProps {
  canEdit: boolean;
  isEditMode: boolean;
  isSelectionMode: boolean;
  groupByPhase: boolean;
  inputTypeFilter: 'all' | 'text' | 'checkbox';
  todoStatusFilter: 'all' | 'completed' | 'open';
  categoryFilter: CategoryFilter;
  onToggleEditOrSelectionMode: () => void;
  onToggleGroupByPhase: () => void;
  onInputTypeFilterChange?: (filter: 'all' | 'text' | 'checkbox') => void;
  onTodoStatusFilterChange?: (filter: 'all' | 'completed' | 'open') => void;
  onCategoryFilterChange?: (filter: CategoryFilter) => void;
}

/**
 * Botões de modo (edição, agrupamento) e filtros
 */
export function TodoModeButtons({
  canEdit,
  isEditMode,
  isSelectionMode,
  groupByPhase,
  inputTypeFilter,
  todoStatusFilter,
  categoryFilter,
  onToggleEditOrSelectionMode,
  onToggleGroupByPhase,
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
  onCategoryFilterChange,
}: TodoModeButtonsProps) {
  const isBothModesActive = isEditMode && isSelectionMode;

  return (
    <div className="mt-3 flex w-full flex-col items-start gap-2 lg:mt-0 lg:items-end lg:gap-3">
      <div className="md:hidden lg:flex lg:flex-col lg:items-end lg:gap-3">
        <TodoFilters
          inputTypeFilter={inputTypeFilter}
          todoStatusFilter={todoStatusFilter}
          categoryFilter={categoryFilter}
          onInputTypeFilterChange={onInputTypeFilterChange}
          onTodoStatusFilterChange={onTodoStatusFilterChange}
          onCategoryFilterChange={onCategoryFilterChange}
        />
      </div>

      <div className="flex w-full justify-end gap-2">
        <button
          type="button"
          onClick={onToggleGroupByPhase}
          aria-pressed={groupByPhase}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
            groupByPhase
              ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
              : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-300/60'
          }`}
          title={groupByPhase ? 'Ver lista simples' : 'Agrupar por fase lunar'}
        >
          🌙
        </button>

        {canEdit && (
          <button
            type="button"
            onClick={onToggleEditOrSelectionMode}
            aria-pressed={isBothModesActive}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
              isBothModesActive
                ? 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100'
                : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-300/60'
            }`}
            title={isBothModesActive ? 'Desativar edição e seleção' : 'Ativar edição e seleção'}
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
}
