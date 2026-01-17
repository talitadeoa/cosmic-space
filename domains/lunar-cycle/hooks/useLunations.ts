/**
 * Hook para buscar e gerenciar dados de lunações
 * @module domains/lunar-cycle/hooks/useLunations
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export interface LunationDay {
  date: string;
  moonPhase: string;
  sign: string;
  illumination?: number;
  ageDays?: number;
  description?: string;
  source?: string;
}

export interface LunationsResponse {
  days: LunationDay[];
  source: 'database' | 'app/api/moons/lunations (geração local)' | string;
  generatedAt: string;
  range: { start: string; end: string };
}

interface FetchOptions {
  start: string;
  end: string;
  tz?: string;
  source?: 'auto' | 'db' | 'generated';
  signal?: AbortSignal;
}

export async function fetchLunations(options: FetchOptions): Promise<LunationsResponse> {
  const { start, end, signal } = options;

  const { getMoonPhases } = await import('@/lib/usno-client');
  
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const allPhases = [];

  for (let year = startYear; year <= endYear; year++) {
    const phases = await getMoonPhases(year);
    allPhases.push(...phases);
  }

  // Filtrar por data e mapear para LunationDay
  const days: LunationDay[] = allPhases
    .filter(p => p.date >= start && p.date <= end)
    .map(phase => ({
      date: phase.date,
      moonPhase: phase.phase,
      sign: '', // USNO não fornece signo
      illumination: phase.illumination,
      ageDays: phase.age_days,
      description: phase.phase,
      source: 'usno',
    }));

  return {
    days,
    source: 'usno',
    generatedAt: new Date().toISOString(),
    range: { start, end },
  };
}

export function useLunations() {
  const [data, setData] = useState<LunationDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string>('');

  const fetch = useCallback(
    async (start: string, end: string, source?: 'auto' | 'db' | 'generated') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchLunations({ start, end, source });
        setData(response.days);
        setSource(response.source);
        setGeneratedAt(response.generatedAt);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    data,
    isLoading,
    error,
    source,
    generatedAt,
    fetch,
  };
}

export function useLunationsForRange(start: string, end: string, enabled = true) {
  const lunations = useLunations();

  useEffect(() => {
    if (enabled && start && end) {
      lunations.fetch(start, end, 'auto');
    }
  }, [start, end, enabled, lunations]);

  return lunations;
}
