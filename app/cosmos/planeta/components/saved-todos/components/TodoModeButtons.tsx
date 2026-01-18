'use client';

import React from 'react';
import { TodoFilters } from '@/app/cosmos/planeta/salvos/TodoFilters';

interface TodoModeButtonsProps {
  canEdit: boolean;
  isEditMode: boolean;
  isSelectionMode: boolean;
  groupByPhase: boolean;
  inputTypeFilter: 'all' | 'text' | 'checkbox';
  todoStatusFilter: 'all' | 'completed' | 'open';
  onToggleEditOrSelectionMode: () => void;
  onToggleGroupByPhase: () => void;
  onInputTypeFilterChange?: (filter: 'all' | 'text' | 'checkbox') => void;
  onTodoStatusFilterChange?: (filter: 'all' | 'completed' | 'open') => void;
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
  onToggleEditOrSelectionMode,
  onToggleGroupByPhase,
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
}: TodoModeButtonsProps) {
  const isBothModesActive = isEditMode && isSelectionMode;

  return (
    <div className="flex flex-col items-end gap-2">
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

      <TodoFilters
        inputTypeFilter={inputTypeFilter}
        todoStatusFilter={todoStatusFilter}
        onInputTypeFilterChange={onInputTypeFilterChange}
        onTodoStatusFilterChange={onTodoStatusFilterChange}
      />
    </div>
  );
}
