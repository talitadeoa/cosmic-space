import { useState, useCallback } from 'react';

export interface AnnualInsight {
  year: number;
  insight: string;
  timestamp: string;
}

export function useAnnualInsights() {
  const [insights, setInsights] = useState<AnnualInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveInsight = useCallback(async (insight: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/form/annual-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insight }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar insight');
      }

      const year = new Date().getFullYear();
      const newInsight: AnnualInsight = {
        year,
        insight,
        timestamp: new Date().toISOString(),
      };

      setInsights((prev) => [...prev, newInsight]);
      return newInsight;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { insights, isLoading, error, saveInsight };
}
