import { useEffect, useMemo, useState } from 'react';
import { useYearMoonData } from './useLunationCache';

export interface YearMoonData {
  year: number;
  totalLunations: number;
  dominantPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' | null;
  dominantSign: string | null;
  moonPhases: Record<'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante', number>;
  signs: Record<string, number>;
  syncedAt?: string;
}

interface UseGalaxySunsSyncReturn {
  data: Record<number, YearMoonData>;
  isLoading: boolean;
  error: string | null;
  refresh: (year?: number) => Promise<void>;
}

/**
 * Processa dados crus da API e calcula estatísticas
 */
function processYearData(year: number, days: any[]): YearMoonData {
  const phaseCount: Record<'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante', number> = {
    luaNova: 0,
    luaCrescente: 0,
    luaCheia: 0,
    luaMinguante: 0,
  };

  const signCount: Record<string, number> = {};

  days.forEach((day: any) => {
    if (day.normalizedPhase && day.normalizedPhase in phaseCount) {
      const phase = day.normalizedPhase as keyof typeof phaseCount;
      phaseCount[phase] = (phaseCount[phase] || 0) + 1;
    }
    if (day.sign) {
      signCount[day.sign] = (signCount[day.sign] || 0) + 1;
    }
  });

  let dominantPhaseKey: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' = 'luaNova';
  let maxPhaseCount = 0;

  Object.entries(phaseCount).forEach(([phase, count]) => {
    if (count > maxPhaseCount) {
      maxPhaseCount = count;
      dominantPhaseKey = phase as 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
    }
  });

  let dominantSign = '';
  let maxSignCount = 0;

  Object.entries(signCount).forEach(([sign, count]) => {
    if (count > maxSignCount) {
      maxSignCount = count;
      dominantSign = sign;
    }
  });

  return {
    year,
    totalLunations: days.length,
    dominantPhase: dominantPhaseKey || null,
    dominantSign: dominantSign || null,
    moonPhases: phaseCount,
    signs: signCount,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Hook para sincronizar dados lunares do calendário com GalaxySunsScreen
 * Usa cache compartilhado para evitar requisições duplicadas
 * (Backend entende que referencia 1 ano atrás, UI não mostra isso)
 */
export function useGalaxySunsSync(years: number[] = []): UseGalaxySunsSyncReturn {
  const [processedData, setProcessedData] = useState<Record<number, YearMoonData>>({});
  const [error, setError] = useState<string | null>(null);

  // Determinar quais anos buscar
  const yearsToFetch = useMemo(() => {
    if (years.length > 0) return years;
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1, now + 2];
  }, [years]);

  // Buscar cada ano com cache deduplica
  const yearHooks = useMemo(
    () =>
      yearsToFetch.map((year) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useYearMoonData(year, { autoFetch: true, ttl: 86400000 })
      ),
    [yearsToFetch]
  );

  // Processar dados conforme chegam
  useEffect(() => {
    const newData: Record<number, YearMoonData> = {};
    let hasError = false;

    yearsToFetch.forEach((year, index) => {
      const hook = yearHooks[index];
      if (hook.error) {
        hasError = true;
        setError(`Erro ao carregar ano ${year}: ${hook.error.message}`);
      } else if (hook.data?.days) {
        newData[year] = processYearData(year, hook.data.days);
      }
    });

    if (!hasError) {
      setError(null);
    }

    setProcessedData(newData);
  }, [yearHooks, yearsToFetch]);

  const isLoading = yearHooks.some((h) => h.isLoading);

  const refresh = async (year?: number) => {
    if (year) {
      const index = yearsToFetch.indexOf(year);
      if (index >= 0) {
        await yearHooks[index].mutate();
      }
    } else {
      await Promise.all(yearHooks.map((h) => h.mutate()));
    }
  };

  return { data: processedData, isLoading, error, refresh };
}
