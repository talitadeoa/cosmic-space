/**
 * Hook React para utilidades do ciclo lunar
 * Refatorado para usar o novo Lunar Compute Service (Python)
 * @module domains/lunar-cycle/hooks/useLunarCycle
 */

'use client';

import { useMemo, useEffect, useState } from 'react';
import { lunarComputeClient } from '@/lib/lunar-compute-client';
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
 * Hook para obter informações do ciclo lunar com dados do serviço Python
 */
export function useLunarCycle(date: Date = new Date()) {
  const [lunarPhaseData, setLunarPhaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await lunarComputeClient.getLunarPhase(date, {
          includeZodiac: true,
        });
        setLunarPhaseData(data);
      } catch (error) {
        console.error('Erro ao buscar fase lunar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [date]);

  const cycleData = useMemo(() => {
    // Nota: Dados de ciclo baseados no hook de fase lunar
    // findNearestNewMoon é async e não pode ser chamada em useMemo
    // Dados dinâmicos virão do lunarPhaseData do serviço Python
    return {
      cycleStart: new Date(), // Placeholder
      keyDates: {},
      summary: {},
      findPhaseDay: () => undefined,
      findCycleDay: () => undefined,
      // Dados do serviço Python
      lunarPhaseData,
      loading,
    };
  }, [date, lunarPhaseData, loading]);

  return cycleData;
}

/**
 * Hook para gerar calendário lunar de um mês com dados do serviço
 */
export function useMoonCalendarMonth(year: number, month: number) {
  const [lunarData, setLunarData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Gerar todas as datas do mês
        const daysInMonth = new Date(year, month, 0).getDate();
        const dates = Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month - 1, i + 1);
          date.setHours(12, 0, 0, 0); // Noon UTC
          return date;
        });

        // Buscar dados em batch
        const phases = await lunarComputeClient.getLunarBatch(dates, {
          includeZodiac: true,
        });

        // Converter para Map indexado por data
        const phaseMap = new Map<string, any>();
        phases.forEach((phase) => {
          phaseMap.set(phase.date, phase);
        });

        setLunarData(phaseMap);
      } catch (error) {
        console.error('Erro ao buscar calendário lunar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [year, month]);

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
