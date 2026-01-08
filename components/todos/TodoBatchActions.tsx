/**
 * 🎯 TodoBatchActions - Ações em lote para todos selecionados
 * 
 * Componente extraído do SavedTodosPanel para facilitar manutenção.
 */

'use client';

import React, { memo } from 'react';
import type { MoonPhase, IslandId } from '@/types';
import { MOON_PHASE_LABELS } from '@/types/moon';

interface TodoBatchActionsProps {
  selectedCount: number;
  islandIds?: IslandId[];
  batchIsland: IslandId | '';
  onBatchIslandChange: (island: IslandId | '') => void;
  onBatchDelete?: () => void;
  onBatchAssignPhase?: (phase: MoonPhase) => void;
  onBatchAssignIsland?: (island: IslandId) => void;
  onClearSelection: () => void;
  className?: string;
}

const PHASES: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];

/**
 * Barra de ações em lote quando há itens selecionados
 */
export const TodoBatchActions = memo(function TodoBatchActions({
  selectedCount,
  islandIds = [],
  batchIsland,
  onBatchIslandChange,
  onBatchDelete,
  onBatchAssignPhase,
  onBatchAssignIsland,
  onClearSelection,
  className = '',
}: TodoBatchActionsProps) {
  if (selectedCount === 0) return null;

  const handleAssignPhase = (phase: MoonPhase) => {
    onBatchAssignPhase?.(phase);
  };

  const handleAssignIsland = () => {
    if (batchIsland) {
      onBatchAssignIsland?.(batchIsland);
    }
  };

  // Estilos
  const buttonBase = 'rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition';
  const phaseButtonStyle = 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/20';
  const dangerButtonStyle = 'border-red-600/50 bg-red-900/30 text-red-300 hover:bg-red-800/40';
  const cancelButtonStyle = 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50';

  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-900/80 p-3 ${className}`}>
      {/* Header com contagem e botão cancelar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">
          {selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className={`${buttonBase} ${cancelButtonStyle}`}
        >
          ✕ Cancelar
        </button>
      </div>

      {/* Mover para fase */}
      {onBatchAssignPhase && (
        <div className="mb-3">
          <span className="mb-2 block text-[0.6rem] uppercase tracking-[0.18em] text-slate-400">
            Mover para fase
          </span>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => handleAssignPhase(phase)}
                className={`${buttonBase} ${phaseButtonStyle}`}
              >
                {MOON_PHASE_LABELS[phase]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mover para ilha */}
      {onBatchAssignIsland && islandIds.length > 0 && (
        <div className="mb-3">
          <span className="mb-2 block text-[0.6rem] uppercase tracking-[0.18em] text-slate-400">
            Mover para ilha
          </span>
          <div className="flex items-center gap-2">
            <select
              value={batchIsland}
              onChange={(e) => onBatchIslandChange(e.target.value as IslandId | '')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="">Selecionar ilha...</option>
              {islandIds.map((id) => (
                <option key={id} value={id}>
                  {id.replace('ilha', 'Ilha ')}
                </option>
              ))}
            </select>
            {batchIsland && (
              <button
                type="button"
                onClick={handleAssignIsland}
                className={`${buttonBase} border-emerald-500/50 bg-emerald-900/30 text-emerald-300`}
              >
                Mover
              </button>
            )}
          </div>
        </div>
      )}

      {/* Deletar em lote */}
      {onBatchDelete && (
        <button
          type="button"
          onClick={onBatchDelete}
          className={`${buttonBase} ${dangerButtonStyle} w-full`}
        >
          🗑️ Excluir {selectedCount} {selectedCount === 1 ? 'item' : 'itens'}
        </button>
      )}
    </div>
  );
});

export default TodoBatchActions;
