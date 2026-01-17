/**
 * Hook React para utilidades do ciclo lunar
 * Refatorado para usar o novo Lunar Compute Service (Python) com cache
 * @module domains/lunar-cycle/hooks/useLunarCycle
 */

'use client';

import { useMemo } from 'react';
import { useLunarPhaseUSNO, useLunarBatchUSNO } from '@/hooks/useLunarPhaseUSNO';

/**
 * Hook para obter informações do ciclo lunar com dados em cache
 * Usa deduplica de requisições para a mesma data
 */
export function useLunarCycle(date: Date = new Date()) {
  const { phase: lunarPhaseData, loading } = useLunarPhaseUSNO(date);

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

  // Buscar todas as fases em batch com USNO
  const { phases: batchData, loading } = useLunarBatchUSNO(dates);

  const lunarData = useMemo(() => {
    if (!batchData) return new Map();
    return batchData;
  }, [batchData, dates]);

  return { lunarData, loading };
}

/**
 * Hook para obter um dia específico do ciclo
 */
export function useCycleDay(newMoonDate: Date, dayInCycle: number) {
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
  phase: string,
  dayInPhase: number
) {
  const phaseLabelMap: Record<string, string> = {
    luaNova: 'Lua Nova',
    luaCrescente: 'Lua Crescente',
    luaCheia: 'Lua Cheia',
    luaMinguante: 'Lua Minguante',
  };
  
  const phaseLabel = phaseLabelMap[phase] || 'N/A';
  
  return useMemo(
    () => ({
      date: newMoonDate,
      dateStr: newMoonDate.toISOString().split('T')[0],
      dayOfCycle: 1,
      phase,
      phaseLabel,
      sign: 'N/A',
      age: dayInPhase,
      description: `Dia ${dayInPhase} de ${phaseLabel}`,
    }),
    [newMoonDate, phase, dayInPhase]
  );
}
