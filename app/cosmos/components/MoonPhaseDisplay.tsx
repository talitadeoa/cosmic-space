'use client';

import React, { useState, useEffect } from 'react';
import { getSignEmoji } from '@/lib/astro';
import { fetchLunations } from '@/hooks/useLunations';

type MoonPhaseData = {
  faseLua: string;
  normalizedPhase: string;
  age?: number;
  signo: string;
  cycleInfo?: string;
  daysUntilEvent?: string;
  phaseDay?: string;
};

const SYNODIC_MONTH = 29.53058867;
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizePhaseLabel = (phase: string): string => {
  const normalized = phase.toLowerCase();
  if (normalized.includes('primeiro quarto')) return 'Primeiro Quarto';
  if (normalized.includes('nova')) return 'Nova';
  if (normalized.includes('crescente')) return 'Crescente';
  if (normalized.includes('cheia')) return 'Cheia';
  if (normalized.includes('minguante')) return 'Minguante';
  return phase;
};

const MoonPhaseDisplay: React.FC = () => {
  const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const buildPhaseDetails = (ageDays?: number) => {
      if (ageDays === undefined || Number.isNaN(ageDays)) {
        return { age: undefined, phaseDay: undefined, cycleInfo: undefined, daysUntilEvent: undefined };
      }

      const age = Math.round(ageDays);
      let phaseDay = '';
      let phase = '';

      if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) {
        phase = 'Lua Nova';
        phaseDay = `Dia ${Math.ceil(ageDays)}/1`;
      } else if (ageDays < SYNODIC_MONTH / 2 - 1.2) {
        phase = 'Crescente';
        const dayInPhase = Math.ceil(ageDays - 1.5);
        phaseDay = `Dia ${dayInPhase} da ${phase}`;
      } else if (ageDays < SYNODIC_MONTH / 2 + 1.2) {
        phase = 'Cheia';
        phaseDay = `Dia ${Math.ceil(ageDays - (SYNODIC_MONTH / 2 - 1.2))}/1`;
      } else {
        phase = 'Minguante';
        const dayInPhase = Math.ceil(ageDays - (SYNODIC_MONTH / 2 + 1.2));
        phaseDay = `Dia ${dayInPhase} da ${phase}`;
      }

      let cycleInfo = '';
      let daysUntilEvent = '';

      if (ageDays < 14.765) {
        const daysLeft = Math.round(14.765 - ageDays);
        cycleInfo = 'Próximo: Lua Cheia';
        daysUntilEvent = `em ${daysLeft} dias`;
      } else if (ageDays < 15.765) {
        cycleInfo = 'Agora: Lua Cheia';
        daysUntilEvent = '';
      } else {
        const daysLeft = Math.round(SYNODIC_MONTH - ageDays);
        cycleInfo = 'Próximo: Lua Nova';
        daysUntilEvent = `em ${daysLeft} dias`;
      }

      return { age, phaseDay, cycleInfo, daysUntilEvent };
    };

    const loadToday = async () => {
      const today = new Date();
      const dateStr = formatLocalDate(today);

      try {
        const response = await fetchLunations({
          start: dateStr,
          end: dateStr,
          source: 'db',
          signal: controller.signal,
        });

        const day = response.days[0];
        if (!day) return;

        const normalizedPhase = normalizePhaseLabel(day.moonPhase);
        const details = buildPhaseDetails(day.ageDays);

        if (!isMounted) return;
        setMoonData({
          faseLua: day.moonPhase,
          normalizedPhase,
          signo: day.sign,
          ...details,
        });
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        console.warn('Falha ao carregar lunações do banco:', error);
      }
    };

    loadToday();
    const interval = window.setInterval(loadToday, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  if (!moonData) return null;

  const getPhaseEmoji = (phase: string): string => {
    switch (phase) {
      case 'Nova':
        return '🌑';
      case 'Crescente':
        return '🌓';
      case 'Primeiro Quarto':
        return '🌓';
      case 'Cheia':
        return '🌕';
      case 'Minguante':
        return '🌗';
      default:
        return '🌙';
    }
  };

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'Nova':
        return 'from-slate-900 to-slate-800';
      case 'Crescente':
        return 'from-amber-900 to-amber-800';
      case 'Primeiro Quarto':
        return 'from-yellow-900 to-yellow-800';
      case 'Cheia':
        return 'from-yellow-400 to-amber-300';
      case 'Minguante':
        return 'from-blue-900 to-slate-800';
      default:
        return 'from-slate-800 to-slate-700';
    }
  };

  const phaseNameMap: Record<string, string> = {
    Nova: 'Lua Nova',
    Crescente: 'Lua Crescente',
    'Primeiro Quarto': 'Primeiro Quarto',
    Cheia: 'Lua Cheia',
    Minguante: 'Lua Minguante',
  };

  return (
    <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 z-30">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-3 rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${getPhaseColor(moonData.normalizedPhase)} shadow-lg shadow-indigo-900/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 cursor-pointer`}
      >
        <span className="text-2xl sm:text-3xl">{getPhaseEmoji(moonData.normalizedPhase)}</span>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
            {phaseNameMap[moonData.normalizedPhase] || moonData.faseLua}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] sm:text-xs text-white/60 font-medium">
              {moonData.phaseDay || 'Dia —'} • {getSignEmoji(moonData.signo)} {moonData.signo}
            </span>
            {showDetails && (
              <span className="text-[0.6rem] sm:text-[0.7rem] text-white/40 ml-1">▾</span>
            )}
          </div>
        </div>
      </button>

      {/* Detalhes do Ciclo */}
      {showDetails && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max min-w-[240px] rounded-lg bg-slate-900/95 border border-sky-400/30 shadow-xl backdrop-blur-lg p-4 space-y-2">
          <div className="text-xs text-sky-300/80">
            <p className="font-semibold text-sky-200 mb-2">📊 Ciclo Lunar Atual</p>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Ciclo:</span>
                <span className="font-medium text-white">
                  {moonData.age !== undefined ? `Dia ${moonData.age}/29` : 'Dia —/29'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fase:</span>
                <span className="font-medium text-white">{moonData.phaseDay || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Signo:</span>
                <span className="font-medium text-white">
                  {getSignEmoji(moonData.signo)} {moonData.signo}
                </span>
              </div>
              {(moonData.cycleInfo || moonData.daysUntilEvent) && (
                <div className="border-t border-slate-700 pt-1.5 mt-1.5 flex justify-between">
                  <span>{moonData.cycleInfo}</span>
                  <span className="font-medium text-amber-300">{moonData.daysUntilEvent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonPhaseDisplay;
