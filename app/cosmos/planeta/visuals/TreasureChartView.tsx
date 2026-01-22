'use client';

import React, { useMemo } from 'react';
import { type MoonPhase, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import { MOON_PHASES, MOON_PHASE_EMOJIS, MOON_PHASE_LABELS } from '@/types/moon';
import { PHASE_VIBES } from '@/app/cosmos/utils/phaseVibes';
import type { IslandId } from '@/app/cosmos/types/screen';

interface TreasureChartViewProps {
  todos: SavedTodo[];
  islandNames: Record<IslandId, string>;
  islandIds: IslandId[];
  onSelectPhase: (phase: MoonPhase | null) => void;
  onSelectIsland: (island: IslandId | null) => void;
  selectedPhase: MoonPhase | null;
  selectedIsland: IslandId | null;
  onToggleComplete: (todoId: string) => void;
}

const PHASE_REGIONS: Array<{
  phase: MoonPhase;
  title: string;
  className: string;
  accent: string;
}> = [
  {
    phase: 'luaNova',
    title: 'Baia da Semente',
    className:
      'lg:top-[6%] lg:left-[6%] lg:w-[44%] lg:h-[40%]',
    accent: 'ring-amber-500/40',
  },
  {
    phase: 'luaCrescente',
    title: 'Costa da Mare',
    className:
      'lg:top-[6%] lg:right-[6%] lg:w-[44%] lg:h-[40%]',
    accent: 'ring-emerald-500/40',
  },
  {
    phase: 'luaCheia',
    title: 'Fortaleza do Ouro',
    className:
      'lg:bottom-[8%] lg:right-[6%] lg:w-[44%] lg:h-[40%]',
    accent: 'ring-yellow-500/40',
  },
  {
    phase: 'luaMinguante',
    title: 'Enseada do Recolhimento',
    className:
      'lg:bottom-[8%] lg:left-[6%] lg:w-[44%] lg:h-[40%]',
    accent: 'ring-slate-500/40',
  },
];

export const TreasureChartView: React.FC<TreasureChartViewProps> = ({
  todos,
  islandNames,
  islandIds,
  onSelectPhase,
  onSelectIsland,
  selectedPhase,
  selectedIsland,
  onToggleComplete,
}) => {
  const todosByPhase = useMemo(
    () =>
      MOON_PHASES.reduce((acc, phase) => {
        acc[phase] = todos.filter((todo) => todo.phase === phase);
        return acc;
      }, {} as Record<MoonPhase, SavedTodo[]>),
    [todos]
  );

  const todosByIsland = useMemo(
    () =>
      islandIds.reduce((acc, islandId) => {
        acc[islandId] = todos.filter((todo) => todo.islandId === islandId);
        return acc;
      }, {} as Record<IslandId, SavedTodo[]>),
    [islandIds, todos]
  );

  const unassignedTodos = useMemo(
    () => todos.filter((todo) => !todo.phase),
    [todos]
  );

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const routeTodos = useMemo(() => {
    if (selectedPhase) {
      return todosByPhase[selectedPhase] ?? [];
    }
    if (selectedIsland) {
      return todosByIsland[selectedIsland] ?? [];
    }
    return todos.slice(0, 8);
  }, [selectedPhase, selectedIsland, todosByPhase, todosByIsland, todos]);

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,230,185,0.98)_0%,_rgba(229,196,133,0.98)_42%,_rgba(195,147,83,0.98)_100%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(92,62,29,0.18) 1px, transparent 1px), linear-gradient(0deg, rgba(92,62,29,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-teal-800/20 blur-[90px]" />
      <div className="absolute -bottom-24 -right-8 h-72 w-72 rounded-full bg-amber-900/30 blur-[110px]" />

      <div className="relative z-10 p-6 sm:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="chart-in flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-900/70">
                  Carta Nautica
                </p>
                <h1
                  className="text-3xl sm:text-4xl font-semibold text-amber-950"
                  style={{ fontFamily: '"Cinzel", "Garamond", "Times New Roman", serif' }}
                >
                  Mapa do Tesouro
                </h1>
                <p className="text-amber-900/70">
                  A rota das tarefas e dos paineis em uma nova cartografia
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 px-4 py-3 shadow-sm">
                <div className="text-sm text-amber-900/70">Progresso geral</div>
                <div className="text-lg font-semibold text-amber-950">
                  {completedCount}/{totalCount} tesouros
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-amber-200/60">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6">
            <div className="relative rounded-[28px] border border-amber-300/60 bg-amber-50/60 p-4 sm:p-6 shadow-lg">
              <div className="absolute inset-4 rounded-[24px] border border-dashed border-amber-500/40" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-10 top-10 h-16 w-16 rounded-full border border-amber-700/40 float-slow" />
                <div className="absolute right-12 top-16 h-10 w-10 rounded-full border border-amber-700/40 float-slow" />
                <div className="absolute left-16 bottom-14 h-12 w-12 rounded-full border border-amber-700/40 float-slow" />
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 lg:block lg:min-h-[560px]">
                {PHASE_REGIONS.map((region, index) => {
                  const phaseTodos = todosByPhase[region.phase] ?? [];
                  const completedInPhase = phaseTodos.filter((todo) => todo.completed).length;
                  const isSelected = selectedPhase === region.phase;

                  return (
                    <div
                      key={region.phase}
                      className={`chart-in relative rounded-2xl border border-amber-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm lg:absolute ${region.className} ${isSelected ? `ring-2 ${region.accent}` : ''}`}
                      style={{ animationDelay: `${120 + index * 80}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectPhase(isSelected ? null : region.phase)}
                        className="flex w-full items-start justify-between gap-2"
                        aria-pressed={isSelected}
                      >
                        <div>
                          <div className="flex items-center gap-2 text-amber-950">
                            <span className="text-xl">{MOON_PHASE_EMOJIS[region.phase]}</span>
                            <h3 className="text-base font-semibold">
                              {region.title}
                            </h3>
                          </div>
                          <p className="text-xs text-amber-900/70">
                            {MOON_PHASE_LABELS[region.phase]} - {PHASE_VIBES[region.phase]?.label}
                          </p>
                        </div>
                        <div className="text-right text-xs text-amber-800/80">
                          {completedInPhase}/{phaseTodos.length}
                        </div>
                      </button>

                      <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
                        {phaseTodos.length === 0 ? (
                          <p className="text-xs italic text-amber-700/70">
                            Sem tesouros marcados nesta regiao
                          </p>
                        ) : (
                          phaseTodos.map((todo) => (
                            <button
                              type="button"
                              key={todo.id}
                              onClick={() => onToggleComplete(todo.id)}
                              className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1 text-left text-xs transition ${
                                todo.completed
                                  ? 'border-emerald-400/70 bg-emerald-50 text-emerald-900'
                                  : 'border-amber-200/70 bg-white/70 text-amber-950 hover:border-amber-300'
                              }`}
                            >
                              <span className="text-sm">
                                {todo.completed ? 'OK' : 'X'}
                              </span>
                              <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>
                                {todo.text}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[28px] border border-amber-200/70 bg-amber-50/80 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold text-amber-950"
                  style={{ fontFamily: '"Cinzel", "Garamond", "Times New Roman", serif' }}
                >
                  Diario de Bordo
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPhase(null);
                    onSelectIsland(null);
                  }}
                  className="text-xs rounded-full border border-amber-300/70 px-3 py-1 text-amber-900/70 hover:bg-amber-100"
                >
                  Limpar rotas
                </button>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-900/60">
                  Fases
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MOON_PHASES.map((phase) => {
                    const isSelected = selectedPhase === phase;
                    const count = todosByPhase[phase]?.length ?? 0;
                    return (
                      <button
                        key={phase}
                        type="button"
                        onClick={() => onSelectPhase(isSelected ? null : phase)}
                        className={`flex items-center justify-between rounded-lg border px-2 py-1 text-xs transition ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-100 text-emerald-900'
                            : 'border-amber-200/70 bg-white/80 text-amber-900 hover:border-amber-300'
                        }`}
                      >
                        <span>{MOON_PHASE_LABELS[phase]}</span>
                        <span className="text-amber-900/60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-900/60">
                  Ilhas
                </div>
                {islandIds.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-700/70">
                    Sem ilhas cadastradas
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {islandIds.map((islandId) => {
                      const isSelected = selectedIsland === islandId;
                      const count = todosByIsland[islandId]?.length ?? 0;
                      return (
                        <button
                          key={islandId}
                          type="button"
                          onClick={() => onSelectIsland(isSelected ? null : islandId)}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            isSelected
                              ? 'border-teal-400 bg-teal-100 text-teal-900'
                              : 'border-amber-200/70 bg-white/80 text-amber-900 hover:border-amber-300'
                          }`}
                        >
                          {islandNames[islandId] ?? islandId} - {count}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-900/60">
                  Rota em destaque
                </div>
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {routeTodos.length === 0 ? (
                    <p className="text-xs text-amber-700/70">
                      Nenhum tesouro nesta rota
                    </p>
                  ) : (
                    routeTodos.map((todo) => (
                      <button
                        key={todo.id}
                        type="button"
                        onClick={() => onToggleComplete(todo.id)}
                        className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1 text-left text-xs transition ${
                          todo.completed
                            ? 'border-emerald-400/70 bg-emerald-50 text-emerald-900'
                            : 'border-amber-200/70 bg-white/80 text-amber-950 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-sm">{todo.completed ? 'OK' : 'X'}</span>
                        <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>
                          {todo.text}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {unassignedTodos.length > 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-amber-400/60 bg-amber-100/50 p-3">
                  <div className="text-xs font-semibold text-amber-900">
                    Tesouros sem regiao
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-amber-800/80">
                    {unassignedTodos.slice(0, 4).map((todo) => (
                      <div key={todo.id} className="truncate">
                        {todo.text}
                      </div>
                    ))}
                    {unassignedTodos.length > 4 && (
                      <div className="text-amber-700/70">
                        +{unassignedTodos.length - 4} outros
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes chartIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .chart-in {
          animation: chartIn 700ms ease-out both;
        }
        .float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .chart-in,
          .float-slow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TreasureChartView;
