'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * 💡 Insights Query Cache
 * 
 * Cache com deduplicação para APIs de insights:
 * - GET /api/form/monthly-insight?moonPhase=X&year=Y&month=Z
 * - GET /api/form/quarterly-insight?moonPhase=X&quarter=Q&year=Y
 * - GET /api/form/annual-insight?year=Y
 * 
 * Padrão SWR-style com:
 * - TTL configurável (padrão 24 horas)
 * - Deduplicação de in-flight requests por params
 * - Subscriber pattern para cache invalidation
 * - Cache key gerada a partir de params
 * 
 * Reduz requisições ao compartilhar cache entre múltiplos hooks
 * que carregam insights com mesmos parâmetros
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface GenericInsight {
  id?: number;
  insight: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Singleton cache store para dados de insights
 * Gerencia in-flight requests, TTL expiration e subscribers
 */
class InsightsCacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private requestsInFlight = new Map<string, Promise<any>>();
  private subscribers = new Map<string, Set<() => void>>();

  /**
   * Gera cache key a partir de params
   * Garante mesmos params = mesma chave
   */
  private generateKey(endpoint: string, params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${String(params[k])}`)
      .join('&');
    return `${endpoint}:${sorted}`;
  }

  /**
   * Recupera do cache se ainda válido (não expirou)
   */
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

  /**
   * Armazena no cache com TTL
   */
  set<T>(key: string, data: T, ttl: number = 86400000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Notificar subscribers
    this.notify(key);
  }

  /**
   * Faz fetch com deduplicação de in-flight requests
   * Se já há requisição em progresso, retorna a mesma promise
   */
  async fetch<T>(
    endpoint: string,
    params: Record<string, any>,
    fetcher: () => Promise<T>,
    ttl: number = 86400000
  ): Promise<T> {
    const key = this.generateKey(endpoint, params);

    // Se já há no cache e válido, retorna
    const cached = this.get<T>(key);
    if (cached) return cached;

    // Se já há requisição em progresso, retorna essa promise
    if (this.requestsInFlight.has(key)) {
      return this.requestsInFlight.get(key) as Promise<T>;
    }

    // Inicia nova requisição
    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttl);
        return data;
      })
      .catch((error) => {
        // Se fetch falha, remove do in-flight e relança erro
        this.requestsInFlight.delete(key);
        throw error;
      })
      .finally(() => {
        // Remove do in-flight após completar (sucesso ou erro)
        this.requestsInFlight.delete(key);
      });

    this.requestsInFlight.set(key, promise);
    return promise;
  }

  /**
   * Subscribe a mudanças no cache
   */
  subscribe(endpoint: string, params: Record<string, any>, callback: () => void): () => void {
    const key = this.generateKey(endpoint, params);

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    // Retorna função para unsubscribe
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Notifica todos subscribers de uma chave
   */
  private notify(key: string): void {
    this.subscribers.get(key)?.forEach((callback) => callback());
  }

  /**
   * Limpa uma chave específica
   */
  invalidate(endpoint: string, params: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
    this.notify(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.requestsInFlight.clear();
    this.subscribers.forEach((set) => set.forEach((cb) => cb()));
  }

  /**
   * Estatísticas do cache
   */
  stats() {
    return {
      cacheSize: this.cache.size,
      inFlightCount: this.requestsInFlight.size,
      subscriberCount: this.subscribers.size,
    };
  }
}

// Singleton instance
const insightsCache = new InsightsCacheStore();

/**
 * Hook principal para integração com React
 * Compartilha cache entre múltiplos componentes por endpoint + params
 */
export function useInsightsCache<T extends GenericInsight>(
  endpoint: string,
  params: Record<string, any>,
  fetcher: () => Promise<T | null>,
  options: {
    ttl?: number;
    autoFetch?: boolean;
  } = {}
) {
  const { ttl = 86400000, autoFetch = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch com auto-atualização via subscriber
  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await insightsCache.fetch(endpoint, params, fetcher, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, params, fetcher, ttl]);

  // Auto-fetch no mount ou quando params mudam
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }

    // Subscribe a mudanças
    unsubscribeRef.current = insightsCache.subscribe(endpoint, params, () => {
      const cached = insightsCache.get<T>(insightsCache['generateKey'](endpoint, params));
      if (cached) {
        setData(cached);
      }
    });

    return () => {
      unsubscribeRef.current?.();
    };
  }, [endpoint, JSON.stringify(params), fetch, autoFetch]);

  return {
    data,
    isLoading,
    error,
    mutate: fetch,
    invalidate: () => insightsCache.invalidate(endpoint, params),
  };
}

/**
 * Helper para carregar insights mensais com cache
 * Deduplicação automática por moonPhase + year + monthNumber
 */
export function useMonthlyInsightQuery(
  moonPhase: string,
  year: number,
  monthNumber: number,
  options: { ttl?: number } = {}
) {
  const ttl = options.ttl ?? 86400000; // 24 horas

  return useInsightsCache<{ insight: string; id?: number }>(
    'monthly-insight',
    { moonPhase, year, monthNumber },
    async () => {
      const params = new URLSearchParams({
        moonPhase,
        year: String(year),
        monthNumber: String(monthNumber),
      });

      const response = await fetch(`/api/form/monthly-insight?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar insight');
      }

      const data = await response.json();
      return data.item ?? null;
    },
    { ttl, autoFetch: true }
  );
}

/**
 * Helper para carregar insights trimestrais com cache
 * Deduplicação automática por moonPhase + quarter + year
 */
export function useQuarterlyInsightQuery(
  moonPhase: string,
  quarterNumber: number,
  year: number,
  options: { ttl?: number } = {}
) {
  const ttl = options.ttl ?? 86400000; // 24 horas

  return useInsightsCache<{ insight: string; id?: number }>(
    'quarterly-insight',
    { moonPhase, quarterNumber, year },
    async () => {
      const params = new URLSearchParams({
        moonPhase,
        quarterNumber: String(quarterNumber),
        year: String(year),
      });

      const response = await fetch(`/api/form/quarterly-insight?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar insight');
      }

      const data = await response.json();
      return data.item ?? null;
    },
    { ttl, autoFetch: true }
  );
}

/**
 * Helper para carregar insights anuais com cache
 * Deduplicação automática por year
 */
export function useAnnualInsightQuery(
  year: number,
  options: { ttl?: number } = {}
) {
  const ttl = options.ttl ?? 86400000; // 24 horas

  return useInsightsCache<{ insight: string; id?: number }>(
    'annual-insight',
    { year },
    async () => {
      const params = new URLSearchParams({
        year: String(year),
      });

      const response = await fetch(`/api/form/annual-insight?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar insight');
      }

      const data = await response.json();
      return data.item ?? null;
    },
    { ttl, autoFetch: true }
  );
}

/**
 * Limpar todo o cache de insights
 */
export function clearInsightsCache(): void {
  insightsCache.clear();
}

/**
 * Invalidar cache específico
 */
export function invalidateInsightsCache(endpoint: string, params: Record<string, any>): void {
  insightsCache.invalidate(endpoint, params);
}

/**
 * Obter estatísticas do cache
 */
export function getInsightsCacheStats() {
  return insightsCache.stats();
}

export { insightsCache };
