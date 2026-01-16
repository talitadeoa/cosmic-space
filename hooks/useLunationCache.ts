'use client';

import { useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface RequestInFlight<T> {
  promise: Promise<T>;
  settled: boolean;
}

class LunationCacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private requestsInFlight = new Map<string, RequestInFlight<any>>();
  private subscribers = new Map<string, Set<() => void>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 3600000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    this.notify(key);
  }

  /**
   * Deduplicação de requisições em voo
   * Se já há uma requisição em andamento, retorna a mesma promise
   */
  async fetch<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 3600000): Promise<T> {
    // 1. Verificar cache
    const cached = this.get<T>(key);
    if (cached) return cached;

    // 2. Verificar se há requisição em voo
    const inFlight = this.requestsInFlight.get(key);
    if (inFlight && !inFlight.settled) {
      return inFlight.promise as Promise<T>;
    }

    // 3. Criar nova requisição
    const promise = fetcher().then(
      (data) => {
        this.set(key, data, ttlMs);
        const entry = this.requestsInFlight.get(key);
        if (entry) {
          entry.settled = true;
        }
        return data;
      },
      (error) => {
        const entry = this.requestsInFlight.get(key);
        if (entry) {
          entry.settled = true;
        }
        throw error;
      }
    );

    this.requestsInFlight.set(key, {
      promise,
      settled: false,
    });

    return promise;
  }

  private notify(key: string) {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((cb) => cb());
    }
  }

  subscribe(key: string, callback: () => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  clear() {
    this.cache.clear();
    this.requestsInFlight.clear();
    this.subscribers.clear();
  }
}

// Singleton global
const cacheStore = new LunationCacheStore();

export interface UseLunationCacheOptions {
  /** TTL em milissegundos (padrão: 1 hora) */
  ttl?: number;
  /** Se false, não faz fetch automático no mount */
  autoFetch?: boolean;
  /** Revalidar em segundos (refetch periodicamente) */
  revalidateInterval?: number;
}

export function useLunationCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseLunationCacheOptions = {}
) {
  const { ttl = 3600000, autoFetch = true, revalidateInterval } = options;

  const [data, setData] = useState<T | null>(() => cacheStore.get(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Subscribe to cache updates
    unsubscribeRef.current = cacheStore.subscribe(key, () => {
      const cached = cacheStore.get<T>(key);
      if (cached) {
        setData(cached);
        setError(null);
      }
    });

    if (autoFetch) {
      const load = async () => {
        setIsLoading(true);
        try {
          const result = await cacheStore.fetch(key, fetcher, ttl);
          setData(result);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setIsLoading(false);
        }
      };

      load();

      // Setup revalidation interval
      if (revalidateInterval) {
        intervalRef.current = setInterval(() => {
          load();
        }, revalidateInterval * 1000);
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, ttl, autoFetch, revalidateInterval, fetcher]);

  const mutate = async (newData?: T | Promise<T>) => {
    if (newData instanceof Promise) {
      setIsLoading(true);
      try {
        const resolved = await newData;
        cacheStore.set(key, resolved, ttl);
      } finally {
        setIsLoading(false);
      }
    } else if (newData !== undefined) {
      cacheStore.set(key, newData, ttl);
    } else {
      // Revalidar
      setIsLoading(true);
      try {
        const result = await cacheStore.fetch(key, fetcher, ttl);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook para buscar fases lunares de um intervalo
 */
export function useMoonPhaseRange(
  startDate: Date | string,
  endDate: Date | string,
  options: UseLunationCacheOptions = {}
) {
  const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
  const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];

  const cacheKey = `moon-phase-range:${start}:${end}`;

  return useLunationCache(
    cacheKey,
    async () => {
      const response = await fetch(`/api/moons?start=${start}&end=${end}&tz=UTC`);
      if (!response.ok) throw new Error(`Failed to fetch moon phases: ${response.statusText}`);
      return response.json();
    },
    { ttl: 86400000, ...options } // 24 horas por padrão
  );
}

/**
 * Hook para buscar lunações de um período
 */
export function useLunations(
  startDate: Date | string,
  endDate: Date | string,
  options: UseLunationCacheOptions = {}
) {
  const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
  const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];

  const cacheKey = `lunations:${start}:${end}`;

  return useLunationCache(
    cacheKey,
    async () => {
      const response = await fetch(`/api/moons/lunations?start=${start}&end=${end}`);
      if (!response.ok) throw new Error(`Failed to fetch lunations: ${response.statusText}`);
      return response.json();
    },
    { ttl: 86400000, ...options } // 24 horas por padrão
  );
}

/**
 * Hook para buscar dados lunares do ano (GalaxySuns)
 */
export function useYearMoonData(
  year: number,
  options: UseLunationCacheOptions = {}
) {
  const cacheKey = `moon-year:${year}`;

  return useLunationCache(
    cacheKey,
    async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const response = await fetch(`/api/moons?start=${startDate}&end=${endDate}&tz=UTC`);
      if (!response.ok) throw new Error(`Failed to fetch year ${year}: ${response.statusText}`);
      return response.json();
    },
    { ttl: 86400000, ...options } // 24 horas por padrão
  );
}

/**
 * Hook para buscar fase lunar de uma data específica
 */
export function useLunarPhase(
  date: Date,
  options: UseLunationCacheOptions & { includeZodiac?: boolean } = {}
) {
  const { includeZodiac = false, ...cacheOptions } = options;
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `lunar-phase:${dateStr}:${includeZodiac ? 'zodiac' : 'no-zodiac'}`;

  return useLunationCache(
    cacheKey,
    async () => {
      const response = await fetch(
        `/api/lunar/phase?date=${date.toISOString()}${includeZodiac ? '&zodiac=true' : ''}`
      );
      if (!response.ok) throw new Error(`Failed to fetch lunar phase: ${response.statusText}`);
      return response.json();
    },
    { ttl: 86400000, autoFetch: true, ...cacheOptions } // 24 horas
  );
}

/**
 * Hook para buscar múltiplas fases lunares em batch
 */
export function useLunarBatch(
  dates: Date[],
  options: UseLunationCacheOptions & { includeZodiac?: boolean } = {}
) {
  const { includeZodiac = false, ...cacheOptions } = options;
  const dateStrs = dates.map((d) => d.toISOString().split('T')[0]).join(',');
  const cacheKey = `lunar-batch:${dateStrs}:${includeZodiac ? 'zodiac' : 'no-zodiac'}`;

  return useLunationCache(
    cacheKey,
    async () => {
      const response = await fetch('/api/lunar/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: dates.map((d) => d.toISOString()),
          includeZodiac,
        }),
      });
      if (!response.ok) throw new Error(`Failed to fetch lunar batch: ${response.statusText}`);
      return response.json();
    },
    { ttl: 86400000, autoFetch: true, ...cacheOptions } // 24 horas
  );
}

/**
 * Limpar todo o cache
 */
export function clearLunationCache() {
  cacheStore.clear();
}
