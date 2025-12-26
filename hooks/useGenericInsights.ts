import { useState, useCallback } from 'react';

/**
 * Interface genérica para insights com período
 */
export interface GenericInsight {
  id?: number;
  insight: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Hook genérico reutilizável para gerenciar diferentes tipos de insights
 * (mensal, trimestral, anual)
 *
 * @example
 * const { insights, isLoading, error, saveInsight } = useInsights(
 *   'monthly-insight',
 *   { month: 5 }
 * );
 */
export function useInsights<T extends GenericInsight>(
  endpoint: string,
  metadata?: Record<string, any>
) {
  const [insights, setInsights] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveInsight = useCallback(
    async (insight: string, additionalData?: Record<string, any>) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          insight,
          ...(metadata && metadata),
          ...(additionalData && additionalData),
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

  return {
    insights,
    isLoading,
    error,
    saveInsight,
    clearError,
  };
}
