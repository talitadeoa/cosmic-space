'use client';

import React from 'react';
import { Card } from '@/app/cosmos/components/Card';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import type { PhaseStat } from '../../types';

type PhaseBarsLayerProps = {
  phaseStats: PhaseStat[];
  maxTotal: number;
  bestPhase: PhaseStat | null;
  hasPhaseData: boolean;
};

const PhaseBarsLayer: React.FC<PhaseBarsLayerProps> = ({
  phaseStats,
  maxTotal,
  bestPhase,
  hasPhaseData,
}) => {
  return (
    <Card className="border border-indigo-200/20 bg-slate-950/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
            Barras lunares
          </p>
          <h3 className="text-lg font-semibold text-white">Produtividade por fase</h3>
        </div>
        {!hasPhaseData && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            Nenhuma tarefa classificada ainda
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {phaseStats.map((stat) => {
          const totalWidth = `${(stat.total / maxTotal) * 100}%`;
          const completedWidth = stat.total ? `${(stat.completed / maxTotal) * 100}%` : '0%';

          return (
            <div key={stat.phase} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.75rem] text-slate-100">
                    {phaseLabels[stat.phase]}
                  </span>
                  {bestPhase?.phase === stat.phase && stat.total > 0 && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[0.7rem] font-semibold text-emerald-200 ring-1 ring-emerald-500/40">
                      mais eficiente
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {stat.completed}/{stat.total} feitas
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-800/70 ring-1 ring-white/5">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500/25 to-purple-500/25"
                  style={{ width: totalWidth }}
                />
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500/80 shadow-[0_0_16px_rgba(16,185,129,0.45)]"
                  style={{ width: completedWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PhaseBarsLayer;
