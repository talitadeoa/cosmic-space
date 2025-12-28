'use client';

import React from 'react';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, type IslandNames } from '@/app/cosmos/utils/islandNames';
import type { FilterState } from '@/hooks/useFilteredTodos';

export type FiltersPanelProps = {
  isOpen: boolean;
  filters: FilterState;
  onClearFilters: () => void;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
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
    Boolean(filters.island) ||
    Boolean(filters.month) ||
    Boolean(filters.year)
  );
};

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  isOpen,
  filters,
  onClearFilters,
  onMonthChange,
  onYearChange,
  islandNames,
}) => {
  const islandLabel = getIslandLabel(filters.island, islandNames);
  const activeFilters = hasActiveFilters(filters);
  const displayTodoStatus = showTodoStatus(filters);
  const phaseLabel = filters.phase ? phaseLabels[filters.phase] : null;
  const monthLabel = filters.month ? monthNames[filters.month - 1] : null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/70 shadow-xl shadow-indigo-900/20 transition-[max-height,opacity,transform] duration-300 ${
        isOpen ? 'max-h-96 opacity-100 translate-y-0 p-4 sm:p-5' : 'max-h-0 opacity-0 -translate-y-2 p-0'
      }`}
    >
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Painel de filtros
        </p>
        <p className="text-[0.75rem] text-slate-400">Ajuste como as tarefas aparecem na lista.</p>
      </div>

      {/* Filtros de Mês e Ano */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-700/50 pt-4 sm:flex-row">
        {/* Filtro de Mês */}
        <div className="flex-1">
          <label className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Mês
          </label>
          <select
            value={filters.month ?? ''}
            onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 transition hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">Todos os meses</option>
            {monthNames.map((name, index) => (
              <option key={index} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Ano */}
        <div className="flex-1">
          <label className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Ano
          </label>
          <select
            value={filters.year ?? ''}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 transition hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">Todos os anos</option>
            {[2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilters ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-700/50 pt-4 text-[0.7rem] font-semibold text-slate-200">
          {filters.view === 'lua-atual' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              Lua atual
            </span>
          )}
          {filters.inputType === 'text' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              Texto
            </span>
          )}
          {filters.inputType === 'checkbox' && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              To-dos
            </span>
          )}
          {displayTodoStatus && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {filters.todoStatus === 'completed' ? 'Completas' : 'Em aberto'}
            </span>
          )}
          {phaseLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {phaseLabel}
            </span>
          )}
          {monthLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {monthLabel}
            </span>
          )}
          {filters.year && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {filters.year}
            </span>
          )}
          {islandLabel && (
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              {islandLabel}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-4 border-t border-slate-700/50 pt-4 text-xs text-slate-500">Nenhum filtro extra ativo.</p>
      )}

      {activeFilters && (
        <div className="mt-4">
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
