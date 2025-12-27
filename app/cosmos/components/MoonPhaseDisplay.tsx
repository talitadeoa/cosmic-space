'use client';

import React, { useState, useEffect } from 'react';
import { getLunarPhaseAndSign } from '@/lib/astro';

type MoonPhaseData = {
  faseLua: string;
  age: number;
};

const MoonPhaseDisplay: React.FC = () => {
  const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);

  useEffect(() => {
    const data = getLunarPhaseAndSign();
    setMoonData({
      faseLua: data.faseLua,
      age: data.age,
    });
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
      <div
        className={`flex items-center gap-3 rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${getPhaseColor(moonData.faseLua)} shadow-lg shadow-indigo-900/30 border border-white/10 backdrop-blur-md`}
      >
        <span className="text-2xl sm:text-3xl">{getPhaseEmoji(moonData.faseLua)}</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
            {phaseNameMap[moonData.faseLua] || moonData.faseLua}
          </span>
          <span className="text-[0.65rem] sm:text-xs text-white/60 font-medium">
            Dia {moonData.age}/29
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoonPhaseDisplay;
