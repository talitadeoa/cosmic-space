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
  const { start, end, source = 'auto', signal } = options;

  const params = new URLSearchParams({
    start,
    end,
    source,
  });

  const response = await fetch(`/api/moons/lunations?${params.toString()}`, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<LunationsResponse>;
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
