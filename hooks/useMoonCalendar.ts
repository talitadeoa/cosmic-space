"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const cacheKey = useMemo(() => buildCacheKey({ start, end, tz }), [start, end, tz]);

  const readCache = useCallback((): MoonCalendarResponse | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as MoonCalendarResponse;
    } catch (err) {
      console.warn("Falha ao ler cache de calendário lunar", err);
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    (payload: MoonCalendarResponse) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(payload));
      } catch (err) {
        console.warn("Falha ao salvar cache de calendário lunar", err);
      }
    },
    [cacheKey],
  );

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchMoonCalendar({ start, end, tz, signal });
        if (signal?.aborted || !mountedRef.current) return;

        setCalendar(response.days);
        setGeneratedAt(response.generatedAt);
        writeCache(response);
      } catch (err) {
        const fallback = readCache();
        if (fallback && !signal?.aborted && mountedRef.current) {
          setCalendar(fallback.days);
          setGeneratedAt(fallback.generatedAt);
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
    [end, readCache, start, tz, writeCache],
  );

  useEffect(() => {
    const controller = new AbortController();
    mountedRef.current = true;

    load(controller.signal);

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [load]);

  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs < 5_000) return;
    const id = setInterval(() => load(), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, load]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    await load(controller.signal);
  }, [load]);

  return {
    calendar,
    generatedAt,
    isLoading,
    error,
    refresh,
  };
}
