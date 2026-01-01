'use client';

import React from 'react';
import { Card } from '@/app/cosmos/components/Card';

type CycleSummaryLayerProps = {
  totalTodos: number;
  completedTodos: number;
  assignedCount: number;
  unassignedCount: number;
};

const CycleSummaryLayer: React.FC<CycleSummaryLayerProps> = ({
  totalTodos,
  completedTodos,
  assignedCount,
  unassignedCount,
}) => {
  return (
    <Card className="bg-gradient-to-br from-slate-900/70 via-slate-950/70 to-indigo-950/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
            Resumo do ciclo
          </p>
          <h3 className="text-lg font-semibold text-white">Status das listas orbitais</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
            Concluídas
          </span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-indigo-100">Em órbita</span>
          <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">Não atribuídas</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-inner shadow-black/30">
          <p className="text-xs text-slate-400">To-dos totais</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totalTodos}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3 shadow-inner shadow-emerald-900/30">
          <p className="text-xs text-emerald-100/90">Concluídos</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-100">{completedTodos}</p>
        </div>
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-3 shadow-inner shadow-indigo-900/30">
          <p className="text-xs text-indigo-100/90">Em fases lunares</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-100">{assignedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-400/25 bg-slate-800/60 p-3 shadow-inner shadow-black/30">
          <p className="text-xs text-slate-200/90">Sem fase atribuída</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{unassignedCount}</p>
        </div>
      </div>
    </Card>
  );
};

export default CycleSummaryLayer;
