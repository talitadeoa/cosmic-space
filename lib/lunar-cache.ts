/**
 * Cache global para requisições de fases lunares
 * Evita múltiplas requisições para a mesma data/mês
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // em ms
}

const cache = new Map<string, CacheEntry>();

// RequestCache para evitar requisições simultâneas duplicadas
const pendingRequests = new Map<string, Promise<any>>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export function getCacheKey(year: number, month?: number): string {
  if (month) {
    return `moon_phases_${year}_${String(month).padStart(2, '0')}`;
  }
  return `moon_phases_${year}`;
}

export function getCachedPhases(year: number, month?: number): any | null {
  const key = getCacheKey(year, month);
  const entry = cache.get(key);

  if (entry) {
    const age = Date.now() - entry.timestamp;
    if (age < entry.ttl) {
      console.log(`[Cache HIT] ${key} (age: ${Math.round(age / 1000)}s)`);
      return entry.data;
    } else {
      cache.delete(key);
    }
  }

  return null;
}

export function setCachedPhases(year: number, data: any, month?: number): void {
  const key = getCacheKey(year, month);
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });
  console.log(`[Cache SET] ${key}`);
}

export async function getPendingRequest(key: string): Promise<any> {
  return pendingRequests.get(key);
}

export function setPendingRequest(key: string, promise: Promise<any>): void {
  pendingRequests.set(key, promise);
  promise.finally(() => {
    pendingRequests.delete(key);
  });
}

export function getPendingRequestKey(year: number, month?: number): string {
  return `pending_${getCacheKey(year, month)}`;
}

export function clearCache(): void {
  cache.clear();
  console.log('[Cache CLEARED]');
}

export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}
