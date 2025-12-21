import { useEffect, useState } from "react";

export interface YearMoonData {
  year: number;
  totalLunations: number;
  dominantPhase: "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante" | null;
  dominantSign: string | null;
  moonPhases: Record<"luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante", number>;
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
 * Hook para sincronizar dados lunares do calendário com GalaxySunsScreen
 * Busca fases lunares do ano anterior via API /api/moons
 * (Backend entende que referencia 1 ano atrás, UI não mostra isso)
 */
export function useGalaxySunsSync(
  years: number[] = []
): UseGalaxySunsSyncReturn {
  const [data, setData] = useState<Record<number, YearMoonData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYearData = async (year: number) => {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const response = await fetch(
        `/api/moons?start=${startDate}&end=${endDate}&tz=UTC`
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar dados lunares para ${year}`);
      }

      const { days } = await response.json();

      // Processar estatísticas
      const phaseCount: Record<"luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante", number> = {
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

      // Encontrar fase dominante (mais dias durante o ano)
      let dominantPhaseKey: "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante" =
        "luaNova";
      let maxPhaseCount = 0;

      Object.entries(phaseCount).forEach(([phase, count]) => {
        if (count > maxPhaseCount) {
          maxPhaseCount = count;
          dominantPhaseKey = phase as
            | "luaNova"
            | "luaCrescente"
            | "luaCheia"
            | "luaMinguante";
        }
      });

      // Encontrar signo dominante
      let dominantSign = "";
      let maxSignCount = 0;

      Object.entries(signCount).forEach(([sign, count]) => {
        if (count > maxSignCount) {
          maxSignCount = count;
          dominantSign = sign;
        }
      });

      const yearData: YearMoonData = {
        year,
        totalLunations: days.length,
        dominantPhase: dominantPhaseKey || null,
        dominantSign: dominantSign || null,
        moonPhases: phaseCount,
        signs: signCount,
        syncedAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        [year]: yearData,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error(`❌ Erro ao sincronizar GalaxySuns ${year}:`, message);
    }
  };

  useEffect(() => {
    const yearsToFetch = years.length > 0 ? years : [
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
      new Date().getFullYear() + 2,
    ];

    async function sync() {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all(yearsToFetch.map(fetchYearData));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    sync();
  }, []);

  const refresh = async (year?: number) => {
    setIsLoading(true);
    try {
      if (year) {
        await fetchYearData(year);
      } else {
        const yearsToFetch = Object.keys(data).map(Number);
        await Promise.all(yearsToFetch.map(fetchYearData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refresh };
}
