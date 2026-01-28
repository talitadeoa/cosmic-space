import { useState, useCallback } from 'react';

/**
 * Interface genérica para insights com período
 */
export interface GenericInsight {
  id?: number;
  insight: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Configuração do hook de insights
 */
interface InsightsConfig {
  /** Endpoint base (sem /api/form/) */
  endpoint: string;
  /** Metadados fixos enviados em todas requisições */
  metadata?: Record<string, any>;
}

/**
 * Hook genérico reutilizável para gerenciar diferentes tipos de insights
 * (mensal, trimestral, anual)
 *
 * @example
 * // Uso simples
 * const { saveInsight, loadInsight } = useInsights({ endpoint: 'monthly-insight' });
 * 
 * // Com metadados fixos
 * const { saveInsight } = useInsights({ 
 *   endpoint: 'quarterly-insight',
 *   metadata: { quarter: 1, year: 2025 }
 * });
 */
export function useInsights<T extends GenericInsight = GenericInsight>(
  config: InsightsConfig | string
) {
  // Suporta string (backward compat) ou objeto de config
  const { endpoint, metadata } = typeof config === 'string' 
    ? { endpoint: config, metadata: undefined }
    : config;

  const [insights, setInsights] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  /**
   * Salva um novo insight
   */
  const saveInsight = useCallback(
    async (insight: string, additionalData?: Record<string, any>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          insight,
          ...metadata,
          ...additionalData,
        };

        const response = await fetch(`/api/form/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Erro ao salvar ${endpoint}`);
        }

        const newInsight: T = {
          ...payload,
          timestamp: new Date().toISOString(),
        } as T;

        setInsights((prev) => [...prev, newInsight]);
        return newInsight;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, metadata]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Carrega um insight existente
   */
  const loadInsight = useCallback(
    async (params: Record<string, any>): Promise<T | null> => {
      setIsFetching(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, String(value));
          }
        });

        const response = await fetch(`/api/form/${endpoint}?${queryParams.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) return null;
          const data = await response.json();
          throw new Error(data.error || `Erro ao carregar ${endpoint}`);
        }

        const data = await response.json();
        return (data.item as T) ?? null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsFetching(false);
      }
    },
    [endpoint]
  );

  return {
    insights,
    isLoading,
    isFetching,
    error,
    saveInsight,
    loadInsight,
    clearError,
  };
}
