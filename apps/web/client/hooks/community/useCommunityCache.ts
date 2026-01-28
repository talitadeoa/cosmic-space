'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { CommunityPost } from '@/types/community';

/**
 * 🌐 Community Data Cache
 * 
 * Cache com deduplicação de requisições para APIs de comunidade:
 * - GET /api/community/posts?limit=X&q=query
 * - GET /api/community/profile
 * 
 * Padrão SWR-style com:
 * - TTL configurável (padrão 5 minutos para posts, 30 min para profile)
 * - Deduplicação de in-flight requests
 * - Subscriber pattern para cache invalidation
 * 
 * Reduz requisições ao compartilhar cache entre múltiplos hooks
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CommunityProfile {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

/**
 * Singleton cache store para dados de comunidade
 * Gerencia in-flight requests, TTL expiration e subscribers
 */
class CommunityCacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private requestsInFlight = new Map<string, Promise<any>>();
  private subscribers = new Map<string, Set<() => void>>();

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
  set<T>(key: string, data: T, ttl: number = 300000): void {
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
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
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
  subscribe(key: string, callback: () => void): () => void {
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
  invalidate(key: string): void {
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
const communityCache = new CommunityCacheStore();

/**
 * Hook principal para integração com React
 * Compartilha cache entre múltiplos componentes
 */
export function useCommunityCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    autoFetch?: boolean;
  } = {}
) {
  const { ttl = 300000, autoFetch = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch com auto-atualização via subscriber
  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await communityCache.fetch(key, fetcher, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);

  // Auto-fetch no mount ou quando key muda
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }

    // Subscribe a mudanças
    unsubscribeRef.current = communityCache.subscribe(key, () => {
      const cached = communityCache.get<T>(key);
      if (cached) {
        setData(cached);
      }
    });

    return () => {
      unsubscribeRef.current?.();
    };
  }, [key, fetch, autoFetch]);

  return {
    data,
    isLoading,
    error,
    mutate: fetch,
    invalidate: () => communityCache.invalidate(key),
  };
}

/**
 * Helper para buscar posts da comunidade
 * Deduplicação automática por limit + query
 */
export function useCommunityPosts(
  limit: number = 6,
  query?: string,
  options: { ttl?: number } = {}
) {
  const ttl = options.ttl ?? 300000; // 5 minutos

  const key = query
    ? `community-posts:${limit}:${query}`
    : `community-posts:${limit}`;

  return useCommunityCache<CommunityPost[]>(
    key,
    async () => {
      const encodedQuery = query ? `&q=${encodeURIComponent(query)}` : '';
      const response = await fetch(`/api/community/posts?limit=${limit}${encodedQuery}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data?.posts) ? data.posts : [];
    },
    { ttl, autoFetch: true }
  );
}

/**
 * Helper para buscar perfil do usuário da comunidade
 * Altamente cacheável (muda raramente)
 */
export function useCommunityProfile(options: { ttl?: number } = {}) {
  const ttl = options.ttl ?? 1800000; // 30 minutos

  return useCommunityCache<CommunityProfile>(
    'community-profile',
    async () => {
      const response = await fetch('/api/community/profile');

      if (!response.ok) {
        // Se falhar, retorna profile vazio em vez de erro
        return {
          displayName: '',
          avatarUrl: '',
          bio: '',
        };
      }

      const data = await response.json();
      return data?.profile ?? {
        displayName: '',
        avatarUrl: '',
        bio: '',
      };
    },
    { ttl, autoFetch: true }
  );
}

/**
 * Limpar todo o cache de comunidade
 */
export function clearCommunityCache(): void {
  communityCache.clear();
}

/**
 * Invalidar cache específico
 */
export function invalidateCommunityCache(key: string): void {
  communityCache.invalidate(key);
}

/**
 * Obter estatísticas do cache
 */
export function getCommunityInvocationStats() {
  return communityCache.stats();
}

export { communityCache };
