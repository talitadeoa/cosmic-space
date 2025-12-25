'use client';

import React from 'react';
import { Card } from '@/app/cosmos/components/Card';
import { phaseLabels, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import type { PhaseStat } from '../../types';

type ProductivityLayerProps = {
  productivityPoints: string;
  phaseStats: PhaseStat[];
  completedTodos: number;
  totalTodos: number;
  unassignedTodos: SavedTodo[];
  onNavigateToLuaList: () => void;
};

const ProductivityLayer: React.FC<ProductivityLayerProps> = ({
  productivityPoints,
  phaseStats,
  completedTodos,
  totalTodos,
  unassignedTodos,
  onNavigateToLuaList,
}) => {
  return (
    <Card className="bg-slate-950/70">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Curva de energia
              </p>
              <h3 className="text-lg font-semibold text-white">Tendência de conclusão por fase</h3>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
              {completedTodos}/{totalTodos} concluídas
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-4">
            <svg viewBox="0 0 280 140" className="w-full">
              <defs>
                <linearGradient id="productivityStroke" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              <g className="text-slate-600" strokeWidth="0.5">
                {[30, 60, 90].map((y) => (
                  <line key={y} x1="0" x2="280" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
                ))}
              </g>
              {productivityPoints && (
                <>
                  <polyline
                    fill="none"
                    stroke="url(#productivityStroke)"
                    strokeWidth="3"
                    points={productivityPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {phaseStats.map((stat, idx) => {
                    const x = 12 + (idx / Math.max(phaseStats.length - 1, 1)) * 240;
                    const y = 120 - (stat.productivity / 100) * 90;
                    return (
                      <g key={stat.phase}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#22c55e"
                          className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                        />
                        <text x={x} y={132} textAnchor="middle" className="fill-slate-400 text-[10px]">
                          {phaseLabels[stat.phase]}
                        </text>
                        <text x={x} y={y - 10} textAnchor="middle" className="fill-emerald-200 text-[10px]">
                          {stat.productivity}%
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-inner shadow-black/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Itens fora de órbita
              </p>
              <h4 className="text-sm font-semibold text-white">To-dos sem fase</h4>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
              {unassignedTodos.length}
            </span>
          </div>

          {unassignedTodos.length === 0 ? (
            <p className="text-sm text-slate-400">
              Tudo classificado! Continue arrastando tarefas para cada fase lunar no SidePlanet.
            </p>
          ) : (
            <div className="space-y-2">
              {unassignedTodos.slice(0, 5).map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-sm shadow-black/30"
                >
                  {todo.text}
                </div>
              ))}
              {unassignedTodos.length > 5 && (
                <p className="text-[0.75rem] text-slate-400">
                  +{unassignedTodos.length - 5} itens aguardando fase.
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onNavigateToLuaList}
            className="mt-auto rounded-lg border border-indigo-300/40 bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
          >
            Ver lista de luas
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductivityLayer;
