'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * 🎯 Generic Data Cache Hook
 * 
 * Factory para criar hooks de cache reutilizáveis
 * Consolidado de: useInsightsCache, useLunationCache, useCommunityCache
 * 
 * Padrão SWR com:
 * - TTL configurável
 * - Deduplicação de in-flight requests
 * - Subscriber pattern para invalidação
 * - Request coalescing (múltiplos requests = 1 requisição)
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttlMs?: number;
  enabled?: boolean;
}

/**
 * Singleton cache store genérico
 * Gerencia cache, in-flight requests e subscribers
 */
class GenericCacheStore<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private requestsInFlight = new Map<string, Promise<T>>();
  private subscribers = new Map<string, Set<() => void>>();

  /**
   * Recupera do cache se ainda válido
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.notifySubscribers(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Armazena no cache com TTL
   */
  set(key: string, data: T, ttlMs: number = 3600000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    this.notifySubscribers(key);
  }

  /**
   * Fetch com deduplicação
   * Se há requisição em andamento, retorna a mesma promise
   */
  async fetch(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 3600000
  ): Promise<T> {
    // 1. Verificar cache
    const cached = this.get(key);
    if (cached) return cached;

    // 2. Verificar in-flight request
    const inFlight = this.requestsInFlight.get(key);
    if (inFlight) return inFlight;

    // 3. Executar novo fetch
    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttlMs);
        this.requestsInFlight.delete(key);
        return data;
      })
      .catch((error) => {
        this.requestsInFlight.delete(key);
        throw error;
      });

    this.requestsInFlight.set(key, promise);
    return promise;
  }

  /**
   * Invalidar cache por chave
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.notifySubscribers(key);
  }

  /**
   * Invalidar tudo
   */
  clear(): void {
    this.cache.clear();
    this.requestsInFlight.clear();
    this.subscribers.clear();
  }

  /**
   * Subscrever a mudanças
   */
  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Notificar subscribers
   */
  private notifySubscribers(key: string): void {
    this.subscribers.get(key)?.forEach((callback) => callback());
  }
}

/**
 * Hook genérico para usar cache
 * 
 * Exemplo:
 * ```tsx
 * const { data, isLoading, error } = useDataCache(
 *   'insights-monthly-2024-01',
 *   () => fetch('/api/insights?month=1&year=2024').then(r => r.json()),
 *   { ttlMs: 24 * 60 * 60 * 1000 }
 * );
 * ```
 */
export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttlMs = 3600000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storeRef = useRef<GenericCacheStore<T>>(new GenericCacheStore());

  const store = storeRef.current;

  const fetch = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await store.fetch(key, fetcher, ttlMs);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttlMs, enabled, store]);

  // Fazer fetch inicial
  useEffect(() => {
    if (!enabled) return;
    fetch();
  }, [fetch, enabled]);

  // Subscrever a mudanças
  useEffect(() => {
    return store.subscribe(key, () => {
      const cached = store.get(key);
      if (cached) {
        setData(cached);
      }
    });
  }, [key, store]);

  return {
    data,
    isLoading,
    error,
    refresh: fetch,
    invalidate: () => store.invalidate(key),
    clear: () => store.clear(),
  };
}

/**
 * Factory para criar stores tipadas
 * Útil para singleton patterns
 */
export function createCacheStore<T>() {
  return new GenericCacheStore<T>();
}
