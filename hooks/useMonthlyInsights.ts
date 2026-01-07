/**
 * 💡 useMonthlyInsights
 * 
 * @deprecated Use import from '@/lib/hooks' instead.
 * Este arquivo existe apenas para compatibilidade.
 */

export { useMonthlyInsights, type MonthlyInsight, type MonthlyInsightRecord } from '@/lib/hooks/useMonthlyInsights';


      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar insight');
      }

      const data = await response.json();
      return (data.item as MonthlyInsightRecord | null) ?? null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setFetchError(errorMessage);
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  return { insights, isLoading, error, saveInsight, loadInsight, isFetching, fetchError };
}
