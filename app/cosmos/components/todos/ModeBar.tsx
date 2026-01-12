/**
 * Componente para exibir botões de modo (edit, select, group)
 */
'use client';

import React from 'react';
/**
 * Mode bar para alternar entre edit, select, group
 */

interface ModeBarProps {
  isEditMode: boolean;
  isSelectionMode: boolean;
  groupByPhase: boolean;
  canEdit: boolean;
  selectedPhase: MoonPhase | null | undefined;
  inputTypeFilter: 'all' | 'text' | 'checkbox';
  todoStatusFilter: 'all' | 'completed' | 'open';
  onToggleEditMode: () => void;
  onToggleSelectionMode: () => void;
  onToggleGroupByPhase: () => void;
  onInputTypeFilterChange?: (filter: 'all' | 'text' | 'checkbox') => void;
  onTodoStatusFilterChange?: (filter: 'all' | 'completed' | 'open') => void;
}

const getMoonEmoji = (phase: MoonPhase | null): string => {
  switch (phase) {
    case 'luaNova':
      return '🌑';
    case 'luaCrescente':
      return '🌓';
    case 'luaCheia':
      return '🌕';
    case 'luaMinguante':
      return '🌗';
    default:
      return '';
  }
};

export function ModeBar({
  isEditMode,
  isSelectionMode,
  groupByPhase,
  canEdit,
  inputTypeFilter,
  todoStatusFilter,
  onToggleEditMode,
  onToggleSelectionMode,
  onToggleGroupByPhase,
  onInputTypeFilterChange,
  onTodoStatusFilterChange,
}: ModeBarProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      {canEdit && (
        <button
          type="button"
          onClick={onToggleEditMode}
          aria-pressed={isEditMode}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
            isEditMode
              ? 'border border-amber-300/80 bg-amber-500/20 text-amber-100'
              : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-300/60'
          }`}
          title={isEditMode ? 'Sair do modo edição' : 'Editar inputs'}
        >
          ✏️
        </button>
      )}
      <button
        type="button"
        onClick={onToggleSelectionMode}
        aria-pressed={isSelectionMode}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.7rem] transition ${
          isSelectionMode
            ? 'border border-emerald-300/80 bg-emerald-500/20 text-emerald-100'
            : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-300/60'
        }`}
        title={isSelectionMode ? 'Sair da seleção múltipla' : 'Selecionar múltiplos inputs'}
      >
        ⬚
      </button>
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
