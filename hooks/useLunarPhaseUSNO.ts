'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getMoonPhaseForDate, getMoonPhasesForDates, type LunarPhase } from '@/lib/usno-client';

interface UseLunarPhaseUSNOOptions {
  enabled?: boolean;
  revalidateInterval?: number; // segundos
  maxRetries?: number;
  retryDelay?: number; // milliseconds
}

interface UseLunarPhaseUSNOResult {
  phase: LunarPhase | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar fase lunar de uma data específica via USNO API
 * Com retry automático, cache e deduplicação
 */
export function useLunarPhaseUSNO(
  date: Date,
  options: UseLunarPhaseUSNOOptions = {}
): UseLunarPhaseUSNOResult {
  const [phase, setPhase] = useState<LunarPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enabled = true, revalidateInterval, maxRetries = 3, retryDelay = 1000 } = options;
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Normalizar data para evitar re-renders desnecessários
  const dateKey = useMemo(() => {
    return date.toISOString().split('T')[0];
  }, [date]);

  const fetchPhase = useCallback(async () => {
    if (!enabled || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    // Cancelar requisição anterior se existir
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await getMoonPhaseForDate(date);
      
      if (isMountedRef.current) {
        setPhase(result);
        retryCountRef.current = 0; // Reset retry counter on success
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.warn(`Retrying fetch phase (attempt ${retryCountRef.current}/${maxRetries})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
        
        // Recursively retry se ainda montado
        if (isMountedRef.current) {
          return fetchPhase();
        }
      }

      if (isMountedRef.current) {
        setError(error);
        console.error('Erro ao buscar fase lunar após retentativas:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [date, enabled, maxRetries, retryDelay]);

  useEffect(() => {
    isMountedRef.current = true;

    fetchPhase();

    // Setup revalidação periódica se configurado
    let interval: NodeJS.Timeout | null = null;
    if (revalidateInterval) {
      interval = setInterval(fetchPhase, revalidateInterval * 1000);
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (interval) clearInterval(interval);
    };
  }, [dateKey, enabled, revalidateInterval]); // Usar dateKey em vez de date

  return { phase, loading, error, refetch: fetchPhase };
}

interface UseLunarBatchUSNOOptions {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number; // milliseconds
}

interface UseLunarBatchUSNOResult {
  phases: Map<string, LunarPhase>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar fases lunares para múltiplas datas via USNO API
 * Com cache automático e deduplicação
 */
export function useLunarBatchUSNO(
  dates: Date[],
  options: UseLunarBatchUSNOOptions = {}
): UseLunarBatchUSNOResult {
  const [phases, setPhases] = useState<Map<string, LunarPhase>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enabled = true, maxRetries = 3, retryDelay = 1000 } = options;
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Normalizar dates array para evitar re-renders desnecessários
  const datesKey = useMemo(() => {
    return dates.map(d => d.toISOString().split('T')[0]).sort().join(',');
  }, [dates]);

  const fetchPhases = useCallback(async () => {
    if (!enabled || dates.length === 0 || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    // Cancelar requisição anterior se existir
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await getMoonPhasesForDates(dates);
      
      if (isMountedRef.current) {
        setPhases(result);
        retryCountRef.current = 0; // Reset retry counter on success
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.warn(`Retrying batch fetch (attempt ${retryCountRef.current}/${maxRetries})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
        
        // Recursively retry se ainda montado
        if (isMountedRef.current) {
          return fetchPhases();
        }
      }

      if (isMountedRef.current) {
        setError(error);
        console.error('Erro ao buscar fases lunares em batch após retentativas:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [datesKey, enabled, maxRetries, retryDelay]); // Usar datesKey em vez de dates

  useEffect(() => {
    isMountedRef.current = true;

    fetchPhases();

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [datesKey, enabled]); // Usar datesKey em vez de fetchPhases

  return { phases, loading, error, refetch: fetchPhases };
}
