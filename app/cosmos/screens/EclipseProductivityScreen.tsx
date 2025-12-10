"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import { CelestialObject } from "../components/CelestialObject";
import {
  loadSavedTodos,
  phaseLabels,
  phaseOrder,
  type MoonPhase,
  type SavedTodo,
} from "../utils/todoStorage";
import type { ScreenProps } from "../types";

type PhaseStat = {
  phase: MoonPhase;
  total: number;
  completed: number;
  productivity: number;
};

const EclipseProductivityScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [todos, setTodos] = useState<SavedTodo[]>([]);
  const [lastSync, setLastSync] = useState<string>("");

  const syncTodos = () => {
    const loaded = loadSavedTodos();
    setTodos(loaded);
    const now = new Date();
    setLastSync(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => {
    syncTodos();
  }, []);

  const totalTodos = todos.length;
  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );
  const assignedTodos = useMemo(() => todos.filter((todo) => todo.phase), [todos]);
  const unassignedTodos = useMemo(
    () => todos.filter((todo) => !todo.phase),
    [todos],
  );

  const phaseStats = useMemo<PhaseStat[]>(
    () =>
      phaseOrder.map((phase) => {
        const items = todos.filter((todo) => todo.phase === phase);
        const completed = items.filter((todo) => todo.completed).length;
        const total = items.length;
        return {
          phase,
          total,
          completed,
          productivity: total ? Math.round((completed / total) * 100) : 0,
        };
      }),
    [todos],
  );

  const bestPhase = useMemo(() => {
    if (!phaseStats.length) return null;
    return phaseStats.reduce((best, current) =>
      current.productivity > best.productivity ? current : best,
    phaseStats[0]);
  }, [phaseStats]);

  const maxTotal = Math.max(1, ...phaseStats.map((stat) => stat.total));
  const hasPhaseData = phaseStats.some((stat) => stat.total > 0);
  const productivityPoints = phaseStats.length
    ? phaseStats
        .map((stat, idx) => {
          const x = 12 + (idx / Math.max(phaseStats.length - 1, 1)) * 240;
          const y = 120 - (stat.productivity / 100) * 90;
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(99,102,241,0.18),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_55%_80%,rgba(236,72,153,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />

      <div className="relative z-10 grid h-full w-full grid-cols-1 gap-5 lg:grid-cols-3">
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
              {lastSync ? `Sync ${lastSync}` : "Sync inicial"}
            </span>
          </div>

          <div className="relative mt-2 flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_55%)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <CelestialObject
                type="eclipse"
                size="lg"
                interactive
                onClick={(e) =>
                  navigateWithFocus("sidePlanetCard", {
                    event: e,
                    type: "planeta",
                    size: "md",
                  })
                }
                className="drop-shadow-[0_0_30px_rgba(99,102,241,0.45)]"
              />
              <p className="max-w-xs text-center text-sm text-slate-200">
                Use o eclipse para visualizar a fusão entre os to-dos do planeta lateral e o ciclo lunar.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateWithFocus("sidePlanetCard", { type: "planeta", size: "md" })}
                  className="rounded-full border border-indigo-300/40 bg-indigo-600/30 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-600/50"
                >
                  Editar to-dos no SidePlanet
                </button>
                <button
                  type="button"
                  onClick={syncTodos}
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

        <div className="flex flex-col gap-4 lg:col-span-2">
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
                <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-indigo-100">
                  Em órbita
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                  Não atribuídas
                </span>
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
                <p className="mt-1 text-2xl font-semibold text-indigo-100">{assignedTodos.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-400/25 bg-slate-800/60 p-3 shadow-inner shadow-black/30">
                <p className="text-xs text-slate-200/90">Sem fase atribuída</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{unassignedTodos.length}</p>
              </div>
            </div>
          </Card>

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
                const completedWidth = stat.total
                  ? `${(stat.completed / maxTotal) * 100}%`
                  : "0%";

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

          <Card className="bg-slate-950/70">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                      Curva de energia
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Tendência de conclusão por fase
                    </h3>
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
                              <circle cx={x} cy={y} r="5" fill="#22c55e" className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                              <text
                                x={x}
                                y={132}
                                textAnchor="middle"
                                className="fill-slate-400 text-[10px]"
                              >
                                {phaseLabels[stat.phase]}
                              </text>
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="fill-emerald-200 text-[10px]"
                              >
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
                  onClick={() => navigateWithFocus("luaList", { type: "lua", size: "sm" })}
                  className="mt-auto rounded-lg border border-indigo-300/40 bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
                >
                  Ver lista de luas
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EclipseProductivityScreen;
