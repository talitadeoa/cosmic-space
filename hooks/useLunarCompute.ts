/**
 * Hook otimizado para dados lunares usando o novo serviço Python
 * Substitui cálculos JavaScript pesados por chamadas ao microserviço
 * 
 * Uso:
 * const { phases, loading, error } = useLunarBatch(dates);
 */

import { useEffect, useState, useCallback } from 'react';
import { lunarComputeClient, type LunarPhaseResponse } from '@/lib/lunar-compute-client';

interface UseLunarBatchOptions {
  includeZodiac?: boolean;
  enabled?: boolean;
}

interface UseLunarBatchResult {
  phases: Map<string, LunarPhaseResponse>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para carregar múltiplas fases lunares em batch
 * Otimizado com cache automático
 */
export function useLunarBatch(
  dates: Date[],
  options: UseLunarBatchOptions = {}
): UseLunarBatchResult {
  const [phases, setPhases] = useState<Map<string, LunarPhaseResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { includeZodiac = true, enabled = true } = options;

  const fetchPhases = useCallback(async () => {
    if (!enabled || dates.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await lunarComputeClient.getLunarBatch(dates, {
        includeZodiac,
      });

      // Converter para Map indexado por data
      const phaseMap = new Map<string, LunarPhaseResponse>();
      result.forEach((phase) => {
        phaseMap.set(phase.date, phase);
      });

      setPhases(phaseMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Erro ao carregar fases lunares:', err);
    } finally {
      setLoading(false);
    }
  }, [dates, includeZodiac, enabled]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  return { phases, loading, error, refetch: fetchPhases };
}

/**
 * Hook para uma única data com cache
 */
export function useLunarPhase(date: Date, options: UseLunarBatchOptions = {}) {
  const { phases, loading, error } = useLunarBatch([date], options);
  const phase = phases.get(date.toISOString());

  return { phase, loading, error };
}

/**
 * Hook para lunações de um ano
 */
export function useLunationsYear(year: number) {
  const [lunations, setLunations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await lunarComputeClient.getLunationsYear(year);
        setLunations(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [year]);

  return { lunations, loading, error };
}

/**
 * Hook para gerar datas de um mês
 */
export function useMonthDates(year: number, month: number): Date[] {
  return Array.from({ length: getDaysInMonth(year, month) }, (_, i) => {
    const date = new Date(year, month - 1, i + 1);
    date.setHours(12, 0, 0, 0); // Noon UTC
    return date;
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export type { LunarPhaseResponse };
