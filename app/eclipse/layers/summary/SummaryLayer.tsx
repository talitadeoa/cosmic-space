'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import type { PhaseStat } from '../../types';

type SummaryLayerProps = {
  lastSyncLabel: string;
  onOpenSidePlanet: () => void;
  onSync: () => void;
  bestPhase: PhaseStat | null;
  onOpenSidePlanetFromBadge: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const SummaryLayer: React.FC<SummaryLayerProps> = ({
  lastSyncLabel,
  onOpenSidePlanet,
  onSync,
  bestPhase,
  onOpenSidePlanetFromBadge,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-indigo-300/20 bg-indigo-900/20 p-4 shadow-2xl shadow-indigo-900/30">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-indigo-100/70">
            Eclipse analítico
          </p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            Produtividade por fases da lua
          </h3>
        </div>
        <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[0.7rem] text-slate-200 ring-1 ring-white/10">
          {lastSyncLabel}
        </span>
      </div>

      <div className="relative mt-2 flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_55%)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <CelestialObject
            type="eclipse"
            size="lg"
            interactive
            onClick={onOpenSidePlanetFromBadge}
            className="drop-shadow-[0_0_30px_rgba(99,102,241,0.45)]"
          />
          <p className="max-w-xs text-center text-sm text-slate-200">
            Use o eclipse para visualizar a fusão entre os to-dos do planeta lateral e o ciclo lunar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenSidePlanet}
              className="rounded-full border border-indigo-300/40 bg-indigo-600/30 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-600/50"
            >
              Editar to-dos no SidePlanet
            </button>
            <button
              type="button"
              onClick={onSync}
              className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-indigo-100 shadow-lg transition hover:bg-slate-700/90"
            >
              Sincronizar agora
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-inner shadow-black/20">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Fase mais produtiva
        </p>
        {bestPhase ? (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-slate-200">{phaseLabels[bestPhase.phase]}</span>
              <span className="text-xs text-slate-400">
                {bestPhase.completed} de {bestPhase.total} tarefas finalizadas
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/40">
              {bestPhase.productivity}% de conclusão
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Ainda não há to-dos classificados por fase lunar.
          </p>
        )}
      </div>
    </div>
  );
};

export default SummaryLayer;
