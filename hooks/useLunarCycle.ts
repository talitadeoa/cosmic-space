/**
 * Hook React para utilidades do ciclo lunar
 */

'use client';

import { useMemo } from 'react';
import {
  findNearestNewMoon,
  findCycleDay,
  findPhaseDay,
  getCycleKeyDates,
  generateMoonCycleCalendar,
  getCycleSummary,
  type CycleEvent,
  type MoonPhaseType,
} from '@/lib/lunar-cycle-utils';

/**
 * Hook para obter informações do ciclo lunar de uma data
 */
export function useLunarCycle(date: Date = new Date()) {
  return useMemo(() => {
    const newMoon = findNearestNewMoon(date, 'before');
    const keyDates = getCycleKeyDates(newMoon);
    const summary = getCycleSummary(newMoon);

    return {
      cycleStart: newMoon,
      keyDates,
      summary,
      findPhaseDay: (phase: MoonPhaseType, day: number) => findPhaseDay(newMoon, phase, day),
      findCycleDay: (day: number) => findCycleDay(newMoon, day),
    };
  }, [date]);
}

/**
 * Hook para gerar calendário lunar de um mês
 */
export function useMoonCalendarMonth(year: number, month: number) {
  return useMemo(() => generateMoonCycleCalendar(year, month), [year, month]);
}

/**
 * Hook para obter um dia específico do ciclo
 */
export function useCycleDay(newMoonDate: Date, dayInCycle: number): CycleEvent {
  return useMemo(() => findCycleDay(newMoonDate, dayInCycle), [newMoonDate, dayInCycle]);
}

/**
 * Hook para obter um dia específico de uma fase
 */
export function usePhaseDay(
  newMoonDate: Date,
  phase: MoonPhaseType,
  dayInPhase: number
): CycleEvent {
  return useMemo(
    () => findPhaseDay(newMoonDate, phase, dayInPhase),
    [newMoonDate, phase, dayInPhase]
  );
}
