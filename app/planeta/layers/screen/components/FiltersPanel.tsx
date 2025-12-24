'use client';

import React from 'react';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, type IslandNames } from '@/app/cosmos/utils/islandNames';
import type { FilterState } from '@/hooks/useFilteredTodos';

export type FiltersPanelProps = {
  isOpen: boolean;
  filters: FilterState;
  onClearFilters: () => void;
  islandNames: IslandNames;
};

const showTodoStatus = (filters: FilterState) =>
  filters.inputType === 'checkbox' && filters.todoStatus !== 'all';

const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.view === 'lua-atual' ||
    filters.inputType !== 'all' ||
    showTodoStatus(filters) ||
    Boolean(filters.phase) ||
    Boolean(filters.island)
  );
};

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  isOpen,
  filters,
  onClearFilters,
  islandNames,
}) => {
  const islandLabel = getIslandLabel(filters.island, islandNames);
  const activeFilters = hasActiveFilters(filters);
  const displayTodoStatus = showTodoStatus(filters);
  const phaseLabel = filters.phase ? phaseLabels[filters.phase] : null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/70 shadow-xl shadow-indigo-900/20 transition-[max-height,opacity,transform] duration-300 ${
        isOpen ? 'max-h-80 opacity-100 translate-y-0 p-3' : 'max-h-0 opacity-0 -translate-y-2 p-0'
      }`}
    >
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Painel de filtros
        </p>
        <p className="text-[0.75rem] text-slate-400">Ajuste como as tarefas aparecem na lista.</p>
      </div>

      {activeFilters ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-semibold text-slate-200">
          {filters.view === 'lua-atual' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Lua atual</span>
          )}
          {filters.inputType === 'text' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Texto</span>
          )}
          {filters.inputType === 'checkbox' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">To-dos</span>
          )}
          {displayTodoStatus && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {filters.todoStatus === 'completed' ? 'Completas' : 'Em aberto'}
            </span>
          )}
          {phaseLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">{phaseLabel}</span>
          )}
          {islandLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">{islandLabel}</span>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Nenhum filtro extra ativo.</p>
      )}

      {activeFilters && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};
