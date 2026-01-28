'use client';

import { useEffect, useState } from 'react';
import { useLunations } from '../data/useLunationCache';
import type { MoonPhase } from '@/client/storage';

export type LunationData = {
  date: string;
  phase: string; // Usar 'phase' que é o campo correto de LunarPhase
  illumination?: number;
  age_days?: number;
  zodiac_sign?: string;
  // Legados/fallbacks
  lunation_date?: string;
  moon_phase?: string;
  moonPhase?: string;
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

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLunaDate = (raw: string | Date | undefined) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw !== 'string') return new Date(raw as any);
  if (raw.includes('T')) return new Date(raw);
  return new Date(`${raw}T00:00:00`);
};

const toLunaDateKey = (luna: any) => {
  const raw = luna?.date || luna?.lunation_date;
  if (typeof raw === 'string') {
    return raw.split('T')[0];
  }
  const parsed = parseLunaDate(raw);
  return parsed ? toDateKey(parsed) : '';
};

export function useCurrentWeekPhase(lunations?: LunationData[]): CurrentWeekPhaseData | null {
  const [data, setData] = useState<CurrentWeekPhaseData | null>(null);

  // Buscar lunações do ano inteiro com cache
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);

  const { data: cachedLunations, isLoading } = useLunations(start, end, {
    autoFetch: !lunations, // Só buscar se não foram passadas
    ttl: 86400000, // 24 horas
  });

  useEffect(() => {
    try {
      // Usar lunações passadas como parâmetro ou as do cache
      const lunas = lunations || (cachedLunations?.days?.length ? cachedLunations.days : null);

      if (!lunas || lunas.length === 0) {
        // Manter dados anteriores se não há novas lunações
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
        const lunaDate = parseLunaDate(luna.lunation_date || luna.date);
        if (!lunaDate) return false;
        return lunaDate >= weekStart && lunaDate <= weekEnd;
      });

      // Encontrar fase de hoje
      const todayKey = toDateKey(now);
      const todayLuna = lunas.find((luna: LunationData) => toLunaDateKey(luna) === todayKey);

      const currentPhaseCandidate = todayLuna
        ? normalizePhaseName((todayLuna as any)?.phase || (todayLuna as any)?.moon_phase || (todayLuna as any)?.moonPhase)
        : null;

      const nextWeekStart = new Date(weekEnd);
      nextWeekStart.setDate(weekEnd.getDate() + 1);
      nextWeekStart.setHours(0, 0, 0, 0);

      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      nextWeekEnd.setHours(23, 59, 59, 999);

      const nextWeekLunations = lunas.filter((luna: any) => {
        const lunaDate = parseLunaDate(luna.lunation_date || luna.date);
        if (!lunaDate) return false;
        return lunaDate >= nextWeekStart && lunaDate <= nextWeekEnd;
      });

      const nextWeekPhaseFreq = new Map<MoonPhase, number>();
      nextWeekLunations.forEach((l: any) => {
        const phase = normalizePhaseName(l.phase || l.moon_phase || l.moonPhase);
        nextWeekPhaseFreq.set(phase, (nextWeekPhaseFreq.get(phase) || 0) + 1);
      });

      const nextWeekDominantPhase =
        nextWeekPhaseFreq.size > 0
          ? Array.from(nextWeekPhaseFreq.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : currentPhaseCandidate ?? 'luaCrescente';

      // Fases únicas na semana
      const phasesInWeekSet = new Set<MoonPhase>();
      weekLunations.forEach((l: any) => {
        const phase = normalizePhaseName(l.phase || l.moon_phase || l.moonPhase);
        phasesInWeekSet.add(phase);
      });
      const phasesInWeek = Array.from(phasesInWeekSet);

      // Calcular fase dominante
      const phaseFreq = new Map<MoonPhase, number>();
      weekLunations.forEach((l: any) => {
        const phase = normalizePhaseName(l.phase || l.moon_phase || l.moonPhase);
        phaseFreq.set(phase, (phaseFreq.get(phase) || 0) + 1);
      });

      const dominantPhase =
        phaseFreq.size > 0
          ? Array.from(phaseFreq.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : currentPhaseCandidate ?? 'luaCrescente';

      const currentPhase = currentPhaseCandidate ?? dominantPhase;

      // Timeline de fases
      const phaseTimeline = weekLunations.map((l: any) => {
        const date = parseLunaDate(l.date || l.lunation_date) ?? new Date();
        return {
          phase: normalizePhaseName(l.phase || l.moon_phase || l.moonPhase),
          startDate: date,
          endDate: date,
        };
      });

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
  }, [lunations, cachedLunations?.days]);

  return data;
}
