/**
 * 🎯 TodoBatchActions - Ações em lote para todos selecionados
 * 
 * Componente extraído do SavedTodosPanel para facilitar manutenção.
 */

'use client';

import { memo } from 'react';
import type { MoonPhase, IslandId } from '@/app/cosmos/utils/todoStorage';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import { getIslandLabel, type IslandNames } from '@/app/cosmos/utils/islandNames';

interface TodoBatchActionsProps {
  isSelectionMode: boolean;
  selectedCount: number;
  allDisplayedSelected: boolean;
  batchIsland: IslandId | '';
  visibleIslandIds: IslandId[];
  islandNames?: IslandNames;
  onToggleSelectDisplayed?: () => void;
  onClearSelection: () => void;
  onBatchDelete?: () => void;
  onBatchAssignPhase?: (phase: MoonPhase) => void;
  onBatchAssignIsland?: () => void;
  onBatchAssignCategory?: (category: string | null) => void;
  onBatchMoveToView?: (view: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => void;
  onBatchIslandChange: (island: IslandId | '') => void;
  className?: string;
}

const PHASES: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];

/**
 * Barra de ações em lote quando há itens selecionados
 */
export const TodoBatchActions = memo(function TodoBatchActions({
  isSelectionMode,
  selectedCount,
  allDisplayedSelected,
  batchIsland,
  visibleIslandIds,
  islandNames,
  onToggleSelectDisplayed,
  onClearSelection,
  onBatchDelete,
  onBatchAssignPhase,
  onBatchAssignIsland,
  onBatchAssignCategory,
  onBatchMoveToView,
  onBatchIslandChange,
  className = '',
}: TodoBatchActionsProps) {
  if (!isSelectionMode || selectedCount === 0) return null;

  const handleAssignPhase = (phase: MoonPhase) => {
    onBatchAssignPhase?.(phase);
  };

  const handleAssignIsland = () => {
    if (batchIsland) {
      onBatchAssignIsland?.();
    }
  };

  const handleAssignCategory = (category: string | null) => {
    onBatchAssignCategory?.(category);
  };

  // Estilos
  const buttonBase = 'rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition';
  const phaseButtonStyle = 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 disabled:border-slate-700 disabled:bg-slate-900/60 disabled:text-slate-500';
  const dangerButtonStyle = 'border-red-600/50 bg-red-900/30 text-red-300 hover:bg-red-800/40 disabled:border-slate-700 disabled:bg-slate-900/60 disabled:text-slate-500';
  const cancelButtonStyle = 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50';

  return (
    <div className={`mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-[0.6rem] text-slate-300 ${className}`}>
      {/* Contadores e ações de seleção */}
      <span className="uppercase tracking-[0.18em] text-slate-400">
        {selectedCount === 0 ? 'Nenhum selecionado' : `${selectedCount} selecionado(s)`}
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleSelectDisplayed}
          className={`${buttonBase} rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500`}
        >
          {allDisplayedSelected ? 'Limpar página' : 'Selecionar página'}
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className={`${buttonBase} rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500`}
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={onBatchDelete}
          disabled={selectedCount === 0 || !onBatchDelete}
          className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
            selectedCount === 0 || !onBatchDelete
              ? 'border-slate-700 bg-slate-900/60 text-slate-500'
              : 'border-red-400/60 bg-red-500/20 text-red-100 hover:bg-red-500/30'
          }`}
        >
          Excluir selecionados
        </button>
      </div>

      {/* Segunda linha: Mover para fase/ilha */}
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-[0.6rem] text-slate-300 w-full">
        <span className="uppercase tracking-[0.18em] text-slate-400">Mover para</span>
        <div className="flex flex-wrap gap-2">
          {PHASES.map((phase) => (
            <button
              key={phase}
              type="button"
              onClick={() => handleAssignPhase(phase)}
              disabled={selectedCount === 0 || !onBatchAssignPhase}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${phaseButtonStyle}`}
              title={`Mover para ${phaseLabels[phase]}`}
            >
              {phaseLabels[phase]}
            </button>
          ))}
        </div>
      </div>

      {/* Terceira linha: Categoria/Ilha/View */}
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-[0.6rem] text-slate-300 w-full">
        <span className="uppercase tracking-[0.18em] text-slate-400">Categoria</span>
        <div className="flex flex-wrap gap-2">
          {['Prioridade', 'Secundária'].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleAssignCategory(category)}
              disabled={selectedCount === 0 || !onBatchAssignCategory}
              className={`${buttonBase} ${
                selectedCount === 0 || !onBatchAssignCategory
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
              }`}
            >
              {category}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleAssignCategory(null)}
            disabled={selectedCount === 0 || !onBatchAssignCategory}
            className={`${buttonBase} ${
              selectedCount === 0 || !onBatchAssignCategory
                ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                : 'border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            Limpar
          </button>
        </div>

        {/* Mover para ilha */}
        {visibleIslandIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={batchIsland}
              onChange={(event) => onBatchIslandChange(event.target.value as IslandId | '')}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-200 focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Ilha</option>
              {visibleIslandIds.map((islandId) => (
                <option key={islandId} value={islandId}>
                  {getIslandLabel(islandId, islandNames) ?? islandId}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAssignIsland}
              disabled={selectedCount === 0 || !batchIsland || !onBatchAssignIsland}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
                selectedCount === 0 || !batchIsland || !onBatchAssignIsland
                  ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                  : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
              }`}
            >
              Aplicar ilha
            </button>
          </div>
        )}

        {/* Mover para view */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onBatchMoveToView?.('em-aberto')}
            disabled={selectedCount === 0 || !onBatchMoveToView}
            className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
              selectedCount === 0 || !onBatchMoveToView
                ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                : 'border-slate-400/60 bg-slate-500/20 text-slate-100 hover:bg-slate-500/30'
            }`}
          >
            Em aberto
          </button>
          <button
            type="button"
            onClick={() => onBatchMoveToView?.('lua-atual')}
            disabled={selectedCount === 0 || !onBatchMoveToView}
            className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
              selectedCount === 0 || !onBatchMoveToView
                ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                : 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
          >
            Lua atual
          </button>
          <button
            type="button"
            onClick={() => onBatchMoveToView?.('proxima-fase')}
            disabled={selectedCount === 0 || !onBatchMoveToView}
            className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
              selectedCount === 0 || !onBatchMoveToView
                ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                : 'border-amber-400/60 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
            }`}
          >
            Próxima fase
          </button>
          <button
            type="button"
            onClick={() => onBatchMoveToView?.('proximo-ciclo')}
            disabled={selectedCount === 0 || !onBatchMoveToView}
            className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.16em] transition ${
              selectedCount === 0 || !onBatchMoveToView
                ? 'border-slate-800 bg-slate-900/60 text-slate-500'
                : 'border-rose-400/60 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
            }`}
          >
            Próximo ciclo
          </button>
        </div>
      </div>
    </div>
  );
});

export default TodoBatchActions;
