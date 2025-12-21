"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthGate from "@/components/AuthGate";
import TimelineFilters from "@/components/timeline/TimelineFilters";
import TimelineItemCard from "@/components/timeline/TimelineItemCard";
import TimelinePagination from "@/components/timeline/TimelinePagination";
import type {
  TimelineFiltersState,
  TimelineItem,
  TimelineItemType,
  TimelineResponse,
} from "@/types/timeline";

const defaultTypes: TimelineItemType[] = [
  "mensal",
  "trimestral",
  "anual",
  "energia",
];

const defaultFilters: TimelineFiltersState = {
  period: "90d",
  types: defaultTypes,
  moonPhase: null,
};

const createQueryString = (
  filters: TimelineFiltersState,
  page: number,
  pageSize: number
) => {
  const params = new URLSearchParams();
  params.set("period", filters.period);
  if (filters.types.length) {
    params.set("types", filters.types.join(","));
  }
  if (filters.moonPhase) {
    params.set("moonPhase", filters.moonPhase);
  }
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return params.toString();
};

export default function TimelinePage() {
  const [filters, setFilters] = useState<TimelineFiltersState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [meta, setMeta] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  const queryString = useMemo(
    () => createQueryString(filters, page, pageSize),
    [filters, page, pageSize]
  );

  const fetchTimeline = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/timeline?${queryString}`, {
        credentials: "include",
        signal,
      });
      const data = (await response.json()) as TimelineResponse | { error: string };

      if (!response.ok) {
        const message = "error" in data ? data.error : "Erro ao carregar timeline";
        setError(message);
        setItems([]);
        setMeta(null);
        return;
      }

      const timeline = data as TimelineResponse;
      setItems(timeline.items);
      setMeta(timeline);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Erro ao conectar com o servidor");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTimeline(controller.signal);
    return () => controller.abort();
  }, [fetchTimeline]);

  const handlePeriodChange = (period: TimelineFiltersState["period"]) => {
    setFilters((prev) => ({ ...prev, period }));
    setPage(1);
  };

  const handleMoonPhaseChange = (moonPhase: string | null) => {
    setFilters((prev) => ({ ...prev, moonPhase }));
    setPage(1);
  };

  const handleTypeToggle = (value: TimelineItemType) => {
    setTypeError(null);
    setFilters((prev) => {
      const nextTypes = prev.types.includes(value)
        ? prev.types.filter((type) => type !== value)
        : [...prev.types, value];

      if (nextTypes.length === 0) {
        setTypeError("Selecione ao menos um tipo.");
        return prev;
      }

      setPage(1);
      return { ...prev, types: nextTypes };
    });
  };

  return (
    <AuthGate>
      <main className="relative min-h-screen overflow-hidden bg-space-dark">
        <div className="pointer-events-none absolute inset-0 bg-cosmic-gradient opacity-80" />
        <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-12 sm:px-6">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-300/80">
              Linha do Tempo
            </p>
            <h1 className="text-3xl font-semibold text-slate-100 sm:text-4xl">
              Rastro cronologico do cosmos
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Consolide insights e energia lunar em uma unica visao cronologica,
              pronta para ser consumida pelo chatmodal ou por consultas rapidas.
            </p>
          </header>

          <TimelineFilters
            filters={filters}
            typeError={typeError}
            onPeriodChange={handlePeriodChange}
            onMoonPhaseChange={handleMoonPhaseChange}
            onTypeToggle={handleTypeToggle}
          />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>
                {meta
                  ? `${meta.totalItems} registros encontrados no periodo selecionado`
                  : "Carregando registros..."}
              </span>
              {meta ? (
                <span>
                  Pagina {meta.page} de {meta.totalPages}
                </span>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-40 rounded-3xl border border-slate-800 bg-slate-900/40 animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-black/40 px-6 py-8 text-center text-sm text-slate-300">
                Nenhum registro encontrado para este filtro.
              </div>
            ) : (
              <motion.ul layout className="grid gap-4 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <TimelineItemCard
                      key={`${item.type}-${item.id}-${item.recordedAt}`}
                      item={item}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </section>

          {meta ? (
            <TimelinePagination
              page={meta.page}
              totalPages={meta.totalPages}
              hasNext={meta.hasNext}
              hasPrevious={meta.hasPrevious}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </main>
    </AuthGate>
  );
}
