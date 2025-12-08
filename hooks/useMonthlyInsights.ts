import { useState, useCallback } from 'react';

export interface MonthlyInsight {
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  monthNumber: number;
  insight: string;
  timestamp: string;
}

export function useMonthlyInsights() {
  const [insights, setInsights] = useState<MonthlyInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveInsight = useCallback(
    async (moonPhase: string, monthNumber: number, insight: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/form/monthly-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moonPhase, monthNumber, insight }),
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao salvar insight');
        }

        const newInsight: MonthlyInsight = {
          moonPhase: moonPhase as any,
          monthNumber,
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
    },
    []
  );

  return { insights, isLoading, error, saveInsight };
}
