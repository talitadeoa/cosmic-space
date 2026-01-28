import { useEffect, useMemo, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar quais anos buscar - usar string serializada para comparação estável
  const yearsString = useMemo(() => {
    if (years.length > 0) {
      return years.sort((a, b) => a - b).join(',');
    }
    const now = new Date().getFullYear();
    return [now - 1, now, now + 1, now + 2].join(',');
  }, [years]);

  // Buscar dados via API diretamente sem chamar hooks dentro de useEffect
  useEffect(() => {
    const fetchYearData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const newData: Record<number, YearMoonData> = {};
        let hasError = false;
        let errorMsg = '';

        // Converter string de anos de volta para array
        const yearsToFetch = yearsString.split(',').map(Number);

        // Buscar cada ano sequencialmente para evitar explosão de requisições
        for (const year of yearsToFetch) {
          try {
            const { getMoonPhases } = await import('@/lib/usno-client');
            const phases = await getMoonPhases(year);
            
            if (phases && phases.length > 0) {
              newData[year] = processYearData(year, phases);
            }
          } catch (yearError) {
            hasError = true;
            const msg = yearError instanceof Error ? yearError.message : String(yearError);
            errorMsg = `Erro ao carregar ano ${year}: ${msg}`;
            console.error(errorMsg);
          }
        }

        setProcessedData(newData);
        setError(hasError ? errorMsg : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYearData();
  }, [yearsString]);

  const refresh = async (year?: number) => {
    // Implementação futura se necessário
    // Por enquanto mantém o comportamento compatível
  };

  return { data: processedData, isLoading, error, refresh };
}
