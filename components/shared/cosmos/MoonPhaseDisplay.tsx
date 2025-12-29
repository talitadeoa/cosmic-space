'use client';

import React, { useState, useEffect } from 'react';
import { getLunarPhaseAndSign, getSignEmoji } from '@/lib/astro';
import { findNearestNewMoon, findPhaseDay } from '@/lib/lunar-cycle-utils';

type MoonPhaseData = {
  faseLua: string;
  age: number;
  signo: string;
  cycleInfo?: string;
  daysUntilEvent?: string;
  phaseDay?: string;
};

const MoonPhaseDisplay: React.FC = () => {
  const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const data = getLunarPhaseAndSign();
    const newMoon = findNearestNewMoon(new Date(), 'before');
    
    // Calcular qual é o dia dentro da fase específica
    const SYNODIC_MONTH = 29.53058867;
    let phaseDay = '';
    let phase = '';
    
    const age = data.age;
    if (age < 1.5 || age > SYNODIC_MONTH - 1.5) {
      // Lua Nova
      phase = 'Lua Nova';
      phaseDay = `Dia ${Math.ceil(age)}/1`;
    } else if (age < SYNODIC_MONTH / 2 - 1.2) {
      // Crescente
      phase = 'Crescente';
      const dayInPhase = Math.ceil(age - 1.5);
      phaseDay = `Dia ${dayInPhase} da ${phase}`;
    } else if (age < SYNODIC_MONTH / 2 + 1.2) {
      // Cheia
      phase = 'Cheia';
      phaseDay = `Dia ${Math.ceil(age - (SYNODIC_MONTH / 2 - 1.2))}/1`;
    } else {
      // Minguante
      phase = 'Minguante';
      const dayInPhase = Math.ceil(age - (SYNODIC_MONTH / 2 + 1.2));
      phaseDay = `Dia ${dayInPhase} da ${phase}`;
    }
    
    // Determinar qual será o próximo evento importante
    let cycleInfo = '';
    let daysUntilEvent = '';
    
    if (age < 14.765) {
      // Crescente - próximo é Cheia
      const daysLeft = Math.round(14.765 - age);
      cycleInfo = 'Próximo: Lua Cheia';
      daysUntilEvent = `em ${daysLeft} dias`;
    } else if (age < 15.765) {
      cycleInfo = 'Agora: Lua Cheia';
      daysUntilEvent = '';
    } else {
      // Minguante - próximo é Nova
      const daysLeft = Math.round(29.53 - age);
      cycleInfo = 'Próximo: Lua Nova';
      daysUntilEvent = `em ${daysLeft} dias`;
    }
    
    setMoonData({
      faseLua: data.faseLua,
      age: data.age,
      signo: data.signo,
      cycleInfo,
      daysUntilEvent,
      phaseDay,
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
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-3 rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${getPhaseColor(moonData.faseLua)} shadow-lg shadow-indigo-900/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 cursor-pointer`}
      >
        <span className="text-2xl sm:text-3xl">{getPhaseEmoji(moonData.faseLua)}</span>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
            {phaseNameMap[moonData.faseLua] || moonData.faseLua}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] sm:text-xs text-white/60 font-medium">
              {moonData.phaseDay} • {getSignEmoji(moonData.signo)} {moonData.signo}
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
                <span className="font-medium text-white">Dia {moonData.age}/29</span>
              </div>
              <div className="flex justify-between">
                <span>Fase:</span>
                <span className="font-medium text-white">{moonData.phaseDay}</span>
              </div>
              <div className="flex justify-between">
                <span>Signo:</span>
                <span className="font-medium text-white">{getSignEmoji(moonData.signo)} {moonData.signo}</span>
              </div>
              <div className="border-t border-slate-700 pt-1.5 mt-1.5 flex justify-between">
                <span>{moonData.cycleInfo}</span>
                <span className="font-medium text-amber-300">{moonData.daysUntilEvent}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonPhaseDisplay;
