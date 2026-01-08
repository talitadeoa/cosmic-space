/**
 * 💡 useInsights - Hook Genérico Reutilizável
 * 
 * Substitui useMonthlyInsights, useQuarterlyInsights, useAnnualInsights
 * com um único hook tipado e configurável.
 * 
 * @example
 * ```ts
 * const monthly = useInsights<MonthlyInsight>({
 *   endpoint: '/api/insights/monthly',
 *   storageKey: 'monthly-insights'
 * });
 * 
 * await monthly.fetch({ month: 5, year: 2024 });
 * await monthly.save({ period: 5, content: 'Meu insight' });
 * ```
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/utils/storage';
import type { GenericInsight, InsightConfig, InsightState } from '@/types/insights';

/**
 * Hook genérico para gerenciar insights
 */
export function useInsights<T extends GenericInsight>(config: InsightConfig) {
  const { endpoint, storageKey } = config;

  // State
  const [state, setState] = useState<InsightState<T>>(() => {
    // Carregar do storage se disponível
    if (storageKey) {
      const cached = storage.get<T[]>(storageKey, []);
      return {
        data: cached,
        isLoading: false,
        error: null,
      };
    }

    return {
      data: [],
      isLoading: false,
      error: null,
    };
  });

  /**
   * Buscar insights do servidor
   */
  const fetch = useCallback(
    async (params?: Record<string, any>) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await apiClient.post<T[]>(endpoint, params);

        setState({
          data,
          isLoading: false,
          error: null,
        });

        // Salvar em cache
        if (storageKey) {
          storage.set(storageKey, data);
        }

        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar insights';
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));

        throw error;
      }
    },
    [endpoint, storageKey]
  );

  /**
   * Salvar novo insight
   */
  const save = useCallback(
    async (insight: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const saved = await apiClient.post<T>(`${endpoint}/save`, insight);

        setState((prev) => {
          const updated = [saved, ...prev.data];
          
          // Atualizar cache
          if (storageKey) {
            storage.set(storageKey, updated);
          }

          return {
            data: updated,
            isLoading: false,
            error: null,
          };
        });

        return saved;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao salvar insight';
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));

        throw error;
      }
    },
    [endpoint, storageKey]
  );

  /**
   * Deletar insight
   */
  const remove = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await apiClient.delete(`${endpoint}/${id}`);

        setState((prev) => {
          const updated = prev.data.filter((item) => item.id !== id);
          
          // Atualizar cache
          if (storageKey) {
            storage.set(storageKey, updated);
          }

          return {
            data: updated,
            isLoading: false,
            error: null,
          };
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao deletar insight';
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));

        throw error;
      }
    },
    [endpoint, storageKey]
  );

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    insights: state.data,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    fetch,
    save,
    remove,
    clearError,
  };
}
