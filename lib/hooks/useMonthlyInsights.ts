/**
 * 💡 useMonthlyInsights - Hook Migrado
 * 
 * DEPRECATION NOTICE:
 * Este hook é um wrapper de compatibilidade sobre useInsights.
 * Para novos usos, prefira usar useInsights diretamente:
 * 
 * ```ts
 * import { useInsights } from '@/lib/hooks/useInsights';
 * const { data, isLoading, save } = useInsights<MonthlyInsight>({
 *   endpoint: '/api/form/monthly-insight'
 * });
 * ```
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/utils/storage';

// ============================================
// TYPES (mantendo compatibilidade)
// ============================================

export interface MonthlyInsight {
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  year: number;
  monthNumber: number;
  insight: string;
  timestamp: string;
}

export interface MonthlyInsightRecord {
  id: number;
  moonPhase: string;
  year: number;
  monthNumber: number;
  insight: string;
  createdAt: string;
  updatedAt: string | null;
}

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'flua-monthly-insights';

// ============================================
// HOOK
// ============================================

export function useMonthlyInsights() {
  const [insights, setInsights] = useState<MonthlyInsight[]>(() => 
    storage.get<MonthlyInsight[]>(STORAGE_KEY, [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Salva um novo insight
   */
  const saveInsight = useCallback(
    async (moonPhase: string, year: number, monthNumber: number, insight: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post('/api/form/monthly-insight', {
          moonPhase,
          year,
          monthNumber,
          insight,
        });

        const newInsight: MonthlyInsight = {
          moonPhase: moonPhase as MonthlyInsight['moonPhase'],
          year,
          monthNumber,
          insight,
          timestamp: new Date().toISOString(),
        };

        setInsights((prev: MonthlyInsight[]) => {
          const updated = [...prev, newInsight];
          storage.set(STORAGE_KEY, updated);
          return updated;
        });

        return newInsight;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Carrega insight existente
   */
  const loadInsight = useCallback(
    async (moonPhase: string, year: number, monthNumber: number) => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const params = new URLSearchParams({
          moonPhase,
          year: String(year),
          monthNumber: String(monthNumber),
        });

        const data = await apiClient.get<MonthlyInsightRecord | null>(
          `/api/form/monthly-insight?${params.toString()}`
        );

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar';
        setFetchError(errorMessage);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  return {
    insights,
    isLoading,
    error,
    isFetching,
    fetchError,
    saveInsight,
    loadInsight,
  };
}
