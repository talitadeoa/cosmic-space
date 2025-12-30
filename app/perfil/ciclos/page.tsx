'use client';

import React from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useMenstrualCycle } from '@/hooks/useMenstrualCycle';
import { useState, useEffect } from 'react';

export default function CiclosDashboardPage() {
  const { records, analysis, isLoading, getDaysUntilNextCycle, isInCycleWindow, exportData } =
    useMenstrualCycle();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const daysUntil = getDaysUntilNextCycle();

  return (
    <SpacePageLayout allowBackNavigation>
      <div className="min-h-[100dvh] px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-400">Saúde Menstrual</p>
            <h1 className="text-4xl font-bold text-white">
              Análise de{' '}
              <span className="bg-gradient-to-r from-pink-300 via-red-300 to-orange-300 bg-clip-text text-transparent">
                Ciclos
              </span>
            </h1>
            <p className="text-slate-400 mt-2">
              Acompanhe seus ciclos e correlações com as fases lunares
            </p>
          </div>

          {/* Stats Grid */}
          {analysis && (
            <>
              {/* Top Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Total Records */}
                <div className="rounded-2xl border border-pink-800/30 bg-gradient-to-br from-pink-950/20 to-red-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-pink-400 mb-3">
                    📊 Registros
                  </p>
                  <p className="text-5xl font-bold text-white">{analysis.totalRecords}</p>
                  <p className="text-sm text-pink-300/70 mt-2">registros salvos</p>
                </div>

                {/* Average Cycle */}
                <div className="rounded-2xl border border-pink-800/30 bg-gradient-to-br from-pink-950/20 to-red-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-pink-400 mb-3">
                    📅 Ciclo Médio
                  </p>
                  <p className="text-5xl font-bold text-white">{analysis.averageCycleDays}d</p>
                  <p className="text-sm text-pink-300/70 mt-2">dias de ciclo</p>
                </div>

                {/* Next Estimated */}
                <div className="rounded-2xl border border-pink-800/30 bg-gradient-to-br from-pink-950/20 to-red-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-pink-400 mb-3">
                    ⏰ Próxima Estimada
                  </p>
                  {daysUntil !== null ? (
                    <>
                      <p className="text-5xl font-bold text-white">{Math.abs(daysUntil)}d</p>
                      <p className="text-sm text-pink-300/70 mt-2">
                        {daysUntil > 0
                          ? `faltam ${daysUntil} dias`
                          : daysUntil < 0
                            ? `passou ${Math.abs(daysUntil)} dias`
                            : 'é hoje!'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-pink-300/70">sem dados</p>
                  )}
                </div>
              </div>

              {/* Last Menstruation */}
              {analysis.lastMenstruationDate && (
                <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-950/20 to-pink-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-red-400 mb-4">
                    🩸 Última Menstruação
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {new Date(analysis.lastMenstruationDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-red-300/70 mt-2">
                        há{' '}
                        {Math.round(
                          (new Date().getTime() -
                            new Date(analysis.lastMenstruationDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        dias
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-300/70 mb-2">Próxima</p>
                      <p className="text-2xl font-bold text-white">
                        {analysis.nextEstimatedDate
                          ? new Date(analysis.nextEstimatedDate).toLocaleDateString('pt-BR')
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-300/70 mb-2">Status</p>
                      <p className="text-2xl font-bold text-white">
                        {isInCycleWindow() ? '✓ Em janela' : '○ Normal'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms & Flow */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Most Common Symptoms */}
                {analysis.mostCommonSymptoms.length > 0 && (
                  <div className="rounded-2xl border border-purple-800/30 bg-gradient-to-br from-purple-950/20 to-pink-950/20 backdrop-blur-sm p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-4">
                      🎭 Sintomas Mais Comuns
                    </p>
                    <div className="space-y-2">
                      {analysis.mostCommonSymptoms.map((symptom, idx) => (
                        <div key={symptom} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200">
                            {idx + 1}
                          </div>
                          <p className="text-white capitalize">{symptom}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Most Common Flow */}
                <div className="rounded-2xl border border-blue-800/30 bg-gradient-to-br from-blue-950/20 to-cyan-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-400 mb-4">
                    💧 Fluxo Mais Comum
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">
                      {analysis.mostCommonFlowIntensity === 'light'
                        ? '🌧️'
                        : analysis.mostCommonFlowIntensity === 'moderate'
                          ? '🌧️🌧️'
                          : '⛈️'}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white capitalize">
                        {analysis.mostCommonFlowIntensity === 'light'
                          ? 'Leve'
                          : analysis.mostCommonFlowIntensity === 'moderate'
                            ? 'Moderada'
                            : 'Forte'}
                      </p>
                      <p className="text-sm text-blue-300/70">intensidade padrão</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moon Phases Distribution */}
              {Object.keys(analysis.moonPhaseDistribution).length > 0 && (
                <div className="rounded-2xl border border-indigo-800/30 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-4">
                    🌙 Distribuição por Fase Lunar
                  </p>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(analysis.moonPhaseDistribution).map(([phase, count]) => (
                      <div
                        key={phase}
                        className="rounded-lg bg-indigo-900/20 border border-indigo-500/30 p-4 text-center"
                      >
                        <p className="text-2xl mb-2">
                          {phase === 'Nova'
                            ? '🌑'
                            : phase === 'Crescente'
                              ? '🌓'
                              : phase === 'Cheia'
                                ? '🌕'
                                : phase === 'Minguante'
                                  ? '🌗'
                                  : '🌙'}
                        </p>
                        <p className="font-bold text-white">{count}</p>
                        <p className="text-xs text-indigo-300/70">{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zodiac Distribution */}
              {Object.keys(analysis.zodiacDistribution).length > 0 && (
                <div className="rounded-2xl border border-amber-800/30 bg-gradient-to-br from-amber-950/20 to-orange-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-400 mb-4">
                    ♈ Distribuição por Signo
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(analysis.zodiacDistribution).map(([sign, count]) => (
                      <div
                        key={sign}
                        className="flex items-center gap-3 bg-amber-900/20 p-3 rounded-lg"
                      >
                        <div className="text-xl flex-shrink-0">
                          {sign === 'Capricórnio'
                            ? '♑'
                            : sign === 'Aquário'
                              ? '♒'
                              : sign === 'Peixes'
                                ? '♓'
                                : sign === 'Áries'
                                  ? '♈'
                                  : sign === 'Touro'
                                    ? '♉'
                                    : sign === 'Gêmeos'
                                      ? '♊'
                                      : sign === 'Câncer'
                                        ? '♋'
                                        : sign === 'Leão'
                                          ? '♌'
                                          : sign === 'Virgem'
                                            ? '♍'
                                            : sign === 'Libra'
                                              ? '♎'
                                              : sign === 'Escorpião'
                                                ? '♏'
                                                : '♐'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{sign}</p>
                          <p className="text-xs text-amber-300/70">{count} vezes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Button */}
              <div className="flex justify-center">
                <button
                  onClick={exportData}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
                >
                  💾 Exportar Dados (JSON)
                </button>
              </div>
            </>
          )}

          {/* Empty State */}
          {analysis && analysis.totalRecords === 0 && (
            <div className="rounded-2xl border border-slate-800/30 bg-gradient-to-br from-slate-950/20 to-slate-900/20 backdrop-blur-sm p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-xl font-semibold text-white mb-2">Nenhum registro ainda</p>
              <p className="text-slate-400">
                Comece a registrar sua menstruação para ver análises e padrões aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </SpacePageLayout>
  );
}
