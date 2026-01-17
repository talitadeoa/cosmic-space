'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMoonPhaseForDate, getMoonPhasesForDates, type LunarPhase } from '@/lib/usno-client';

interface UseLunarPhaseUSNOOptions {
  enabled?: boolean;
  revalidateInterval?: number; // segundos
}

interface UseLunarPhaseUSNOResult {
  phase: LunarPhase | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar fase lunar de uma data específica via USNO API
 */
export function useLunarPhaseUSNO(
  date: Date,
  options: UseLunarPhaseUSNOOptions = {}
): UseLunarPhaseUSNOResult {
  const [phase, setPhase] = useState<LunarPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enabled = true, revalidateInterval } = options;

  const fetchPhase = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getMoonPhaseForDate(date);
      setPhase(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Erro ao buscar fase lunar:', err);
    } finally {
      setLoading(false);
    }
  }, [date, enabled]);

  useEffect(() => {
    fetchPhase();

    // Setup revalidação periódica se configurado
    if (revalidateInterval) {
      const interval = setInterval(fetchPhase, revalidateInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchPhase, revalidateInterval]);

  return { phase, loading, error, refetch: fetchPhase };
}

interface UseLunarBatchUSNOOptions {
  enabled?: boolean;
}

interface UseLunarBatchUSNOResult {
  phases: Map<string, LunarPhase>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar fases lunares para múltiplas datas via USNO API
 */
export function useLunarBatchUSNO(
  dates: Date[],
  options: UseLunarBatchUSNOOptions = {}
): UseLunarBatchUSNOResult {
  const [phases, setPhases] = useState<Map<string, LunarPhase>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enabled = true } = options;

  const fetchPhases = useCallback(async () => {
    if (!enabled || dates.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getMoonPhasesForDates(dates);
      setPhases(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Erro ao buscar fases lunares em batch:', err);
    } finally {
      setLoading(false);
    }
  }, [dates, enabled]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  return { phases, loading, error, refetch: fetchPhases };
}
