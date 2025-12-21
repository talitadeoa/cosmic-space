"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMoonCalendar, MoonCalendarDay, MoonCalendarResponse } from "@/lib/api/moonCalendar";

type UseMoonCalendarParams = {
  start: string;
  end: string;
  tz?: string;
  autoRefreshMs?: number;
};

type UseMoonCalendarResult = {
  calendar: MoonCalendarDay[];
  generatedAt?: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const buildCacheKey = (params: { start: string; end: string; tz?: string }) =>
  `moon-calendar:${params.start}:${params.end}:${params.tz || "UTC"}`;

export function useMoonCalendar({
  start,
  end,
  tz,
  autoRefreshMs,
}: UseMoonCalendarParams): UseMoonCalendarResult {
  const [calendar, setCalendar] = useState<MoonCalendarDay[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const cacheKey = buildCacheKey({ start, end, tz });

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchMoonCalendar({ start, end, tz, signal });
        if (signal?.aborted || !mountedRef.current) return;

        setCalendar(response.days);
        setGeneratedAt(response.generatedAt);
        
        // Cache response
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(response));
          } catch (err) {
            console.warn("Falha ao salvar cache", err);
          }
        }
      } catch (err) {
        // Tenta ler cache em caso de erro
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(cacheKey);
            const fallback = raw ? JSON.parse(raw) : null;
            if (fallback && !signal?.aborted && mountedRef.current) {
              setCalendar(fallback.days);
              setGeneratedAt(fallback.generatedAt);
            }
          } catch (cacheErr) {
            console.warn("Falha ao ler cache", cacheErr);
          }
        }

        const message = err instanceof Error ? err.message : "Erro desconhecido ao carregar calendário lunar";
        if (!signal?.aborted && mountedRef.current) {
          setError(message);
        }
      } finally {
        if (!signal?.aborted && mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [start, end, tz, cacheKey],
  );

  // Carrega dados quando start, end ou tz mudam
  useEffect(() => {
    const controller = new AbortController();
    mountedRef.current = true;

    loadData(controller.signal);

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [start, end, tz]);

  // Auto-refresh em intervalo
  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs < 5_000) return;
    
    const id = setInterval(() => {
      loadData();
    }, autoRefreshMs);
    
    return () => clearInterval(id);
  }, [autoRefreshMs, loadData]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    await loadData(controller.signal);
  }, [loadData]);

  return {
    calendar,
    generatedAt,
    isLoading,
    error,
    refresh,
  };
}
