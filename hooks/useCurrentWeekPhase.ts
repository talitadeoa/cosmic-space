'use client';

import { useEffect, useState } from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/todoStorage';

export type LunationData = {
  lunation_date?: string;
  date?: string;
  moon_phase?: string;
  moonPhase?: string;
  illumination?: number;
  age_days?: number;
  zodiac_sign?: string;
};

export interface CurrentWeekPhaseData {
  weekStart: Date;
  weekEnd: Date;
  currentDate: Date;
  currentPhase: MoonPhase;
  phasesInWeek: MoonPhase[];
  dominantPhase: MoonPhase;
  nextWeekDominantPhase: MoonPhase;
  illumination: number;
  phaseTimeline: Array<{
    phase: MoonPhase;
    startDate: Date;
    endDate: Date;
  }>;
  isWeekBeforePhaseChange: boolean;
  nextPhaseChangeDate: Date | null;
}

const normalizePhaseName = (phase: any): MoonPhase => {
  if (!phase) return 'luaCrescente';

  const normalized = (phase as string).toLowerCase().trim();
  if (normalized.includes('nova')) return 'luaNova';
  if (normalized.includes('crescente')) return 'luaCrescente';
  if (normalized.includes('cheia')) return 'luaCheia';
  if (normalized.includes('minguante')) return 'luaMinguante';

  return 'luaCrescente';
};

export function useCurrentWeekPhase(lunations?: LunationData[]): CurrentWeekPhaseData | null {
  const [data, setData] = useState<CurrentWeekPhaseData | null>(null);

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        let lunas = lunations;

        // Se não foram passadas lunações, buscar da API
        if (!lunas) {
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);
          const end = new Date(now.getFullYear(), 11, 31);

          const startStr = start.toISOString().split('T')[0];
          const endStr = end.toISOString().split('T')[0];

          const response = await fetch(`/api/moons/lunations?start=${startStr}&end=${endStr}`);
          const result = await response.json();
          lunas = result.days || [];
        }

        if (!lunas || lunas.length === 0) {
          console.warn('Nenhuma lunação disponível');
          return;
        }

        const now = new Date();

        // Calcular semana (domingo a sábado)
        const dayOfWeek = now.getDay(); // 0 = domingo
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Filtrar lunações da semana
        const weekLunations = lunas.filter((luna: any) => {
          const lunaDate = new Date(luna.lunation_date || luna.date);
          return lunaDate >= weekStart && lunaDate <= weekEnd;
        });

        // Encontrar fase de hoje
        const todayLuna = lunas.find((luna: any) => {
          const lunaDate = new Date(luna.lunation_date || luna.date);
          const lunaDateStr = lunaDate.toDateString();
          const nowStr = now.toDateString();
          return lunaDateStr === nowStr;
        });

        const currentPhase = normalizePhaseName(todayLuna?.moon_phase || todayLuna?.moonPhase);

        const nextWeekStart = new Date(weekEnd);
        nextWeekStart.setDate(weekEnd.getDate() + 1);
        nextWeekStart.setHours(0, 0, 0, 0);

        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        nextWeekEnd.setHours(23, 59, 59, 999);

        const nextWeekLunations = lunas.filter((luna: any) => {
          const lunaDate = new Date(luna.lunation_date || luna.date);
          return lunaDate >= nextWeekStart && lunaDate <= nextWeekEnd;
        });

        const nextWeekPhaseFreq = new Map<MoonPhase, number>();
        nextWeekLunations.forEach((l: any) => {
          const phase = normalizePhaseName(l.moon_phase || l.moonPhase);
          nextWeekPhaseFreq.set(phase, (nextWeekPhaseFreq.get(phase) || 0) + 1);
        });

        const nextWeekDominantPhase =
          nextWeekPhaseFreq.size > 0
            ? Array.from(nextWeekPhaseFreq.entries()).sort((a, b) => b[1] - a[1])[0][0]
            : currentPhase;

        // Fases únicas na semana
        const phasesInWeekSet = new Set<MoonPhase>();
        weekLunations.forEach((l: any) => {
          const phase = normalizePhaseName(l.moon_phase || l.moonPhase);
          phasesInWeekSet.add(phase);
        });
        const phasesInWeek = Array.from(phasesInWeekSet);

        // Calcular fase dominante
        const phaseFreq = new Map<MoonPhase, number>();
        weekLunations.forEach((l: any) => {
          const phase = normalizePhaseName(l.moon_phase || l.moonPhase);
          phaseFreq.set(phase, (phaseFreq.get(phase) || 0) + 1);
        });

        const dominantPhase =
          phaseFreq.size > 0
            ? Array.from(phaseFreq.entries()).sort((a, b) => b[1] - a[1])[0][0]
            : currentPhase;

        // Timeline de fases
        const phaseTimeline = weekLunations.map((l: any) => ({
          phase: normalizePhaseName(l.moon_phase || l.moonPhase),
          startDate: new Date(l.lunation_date || l.date),
          endDate: new Date(l.lunation_date || l.date),
        }));

        setData({
          weekStart,
          weekEnd,
          currentDate: now,
          currentPhase,
          phasesInWeek,
          dominantPhase,
          nextWeekDominantPhase,
          illumination: todayLuna?.illumination || 50,
          phaseTimeline,
          isWeekBeforePhaseChange: phasesInWeek.length > 1,
          nextPhaseChangeDate: null,
        });
      } catch (error) {
        console.error('Erro ao processar semana lunar:', error);
        setData(null);
      }
    };

    fetchAndProcess();
  }, [lunations]);

  return data;
}
