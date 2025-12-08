import { useState, useCallback } from 'react';

export interface QuarterlyInsight {
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  insight: string;
  timestamp: string;
}

export function useQuarterlyInsights() {
  const [insights, setInsights] = useState<QuarterlyInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveInsight = useCallback(async (moonPhase: string, insight: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/form/quarterly-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moonPhase, insight }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar insight');
      }

      const newInsight: QuarterlyInsight = {
        moonPhase: moonPhase as any,
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
