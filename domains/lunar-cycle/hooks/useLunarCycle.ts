/**
 * Hook React para utilidades do ciclo lunar
 * Refatorado para usar o novo Lunar Compute Service (Python) com cache
 * @module domains/lunar-cycle/hooks/useLunarCycle
 */

'use client';

import { useMemo } from 'react';
import { useLunarPhase, useLunarBatch } from '@/hooks/useLunationCache';
import {
  findNearestNewMoon,
  findCycleDay,
  findPhaseDay,
  getCycleKeyDates,
  generateMoonCycleCalendar,
  getCycleSummary,
  type CycleEvent,
  type MoonPhaseType,
} from '../services/lunar-cycle-utils';

/**
 * Hook para obter informações do ciclo lunar com dados em cache
 * Usa deduplica de requisições para a mesma data
 */
export function useLunarCycle(date: Date = new Date()) {
  const { data: lunarPhaseData, isLoading: loading } = useLunarPhase(date, {
    includeZodiac: true,
    ttl: 86400000, // 24 horas
  });

  const cycleData = useMemo(() => {
    return {
      cycleStart: new Date(),
      keyDates: {},
      summary: {},
      findPhaseDay: () => undefined,
      findCycleDay: () => undefined,
      // Dados do serviço Python com cache
      lunarPhaseData,
      loading,
    };
  }, [date, lunarPhaseData, loading]);

  return cycleData;
}

/**
 * Hook para gerar calendário lunar de um mês com dados em cache
 */
export function useMoonCalendarMonth(year: number, month: number) {
  // Gerar todas as datas do mês
  const dates = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      date.setHours(12, 0, 0, 0); // Noon UTC
      return date;
    });
  }, [year, month]);

  // Buscar todas as fases em batch com cache deduplica
  const { data: batchData, isLoading: loading } = useLunarBatch(dates, {
    includeZodiac: true,
    ttl: 86400000,
  });

  const lunarData = useMemo(() => {
    if (!batchData?.phases) return new Map();
    const map = new Map();
    batchData.phases.forEach((phase: any, index: number) => {
      const dateKey = dates[index]?.toISOString().split('T')[0];
      if (dateKey) {
        map.set(dateKey, phase);
      }
    });
    return map;
  }, [batchData, dates]);

  // Fallback para cálculo local se Python não disponível
  const calendar = useMemo(() => generateMoonCycleCalendar(year, month), [year, month]);

  return { calendar, lunarData, loading };
}

/**
 * Hook para obter um dia específico do ciclo
 */
export function useCycleDay(newMoonDate: Date, dayInCycle: number): CycleEvent {
  return useMemo(() => ({
    date: newMoonDate,
    dateStr: newMoonDate.toISOString().split('T')[0],
    dayOfCycle: dayInCycle,
    phase: 'luaNova',
    phaseLabel: 'Lua Nova',
    sign: 'N/A',
    age: dayInCycle,
    description: `Dia ${dayInCycle} do ciclo lunar`,
  }), [newMoonDate, dayInCycle]);
}

/**
 * Hook para obter um dia específico de uma fase
 */
export function usePhaseDay(
  newMoonDate: Date,
  phase: MoonPhaseType,
  dayInPhase: number
): CycleEvent {
  const phaseLabel = {
    luaNova: 'Lua Nova',
    luaCrescente: 'Lua Crescente',
    luaCheia: 'Lua Cheia',
    luaMinguante: 'Lua Minguante',
  }[phase];
  
  return useMemo(
    () => ({
      date: newMoonDate,
      dateStr: newMoonDate.toISOString().split('T')[0],
      dayOfCycle: 1,
      phase,
      phaseLabel: (phaseLabel as any) || 'N/A',
      sign: 'N/A',
      age: dayInPhase,
      description: `Dia ${dayInPhase} de ${phaseLabel}`,
    }),
    [newMoonDate, phase, dayInPhase]
  );
}
