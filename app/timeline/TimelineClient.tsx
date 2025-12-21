"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import TimelineFilters from "@/components/timeline/TimelineFilters";
import TimelineItemCard from "@/components/timeline/TimelineItemCard";
import TimelinePagination from "@/components/timeline/TimelinePagination";
import type {
  TimelineFiltersState,
  TimelineItemType,
  TimelineResponse,
} from "@/types/timeline";

type TimelineClientProps = {
  filters: TimelineFiltersState;
  meta: TimelineResponse | null;
  page: number;
  pageSize: number;
  error: string | null;
  typeError: string | null;
};

type QueryUpdates = {
  period?: TimelineFiltersState["period"];
  types?: TimelineItemType[];
  moonPhase?: string | null;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 10;

export default function TimelineClient({
  filters,
  meta,
  page,
  pageSize,
  error,
  typeError,
}: TimelineClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localTypeError, setLocalTypeError] = useState<string | null>(typeError);

  useEffect(() => {
    setLocalTypeError(typeError);
  }, [typeError]);

  const updateQuery = (updates: QueryUpdates) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.period) {
      params.set("period", updates.period);
    }

    if ("moonPhase" in updates) {
      const value = updates.moonPhase?.trim();
      if (value) {
        params.set("moonPhase", value);
      } else {
        params.delete("moonPhase");
      }
    }

    if ("types" in updates) {
      const nextTypes = updates.types ?? [];
      if (nextTypes.length) {
        params.set("types", nextTypes.join(","));
      } else {
        params.delete("types");
      }
    }

    if ("page" in updates) {
      const nextPage = updates.page ?? 1;
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
    }

    if ("pageSize" in updates) {
      const nextSize = updates.pageSize ?? pageSize;
      if (nextSize === DEFAULT_PAGE_SIZE) {
        params.delete("pageSize");
      } else {
        params.set("pageSize", String(nextSize));
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handlePeriodChange = (period: TimelineFiltersState["period"]) => {
    updateQuery({ period, page: 1 });
  };

  const handleMoonPhaseChange = (moonPhase: string | null) => {
    updateQuery({ moonPhase, page: 1 });
  };

  const handleTypeToggle = (value: TimelineItemType) => {
    setLocalTypeError(null);
    const nextTypes = filters.types.includes(value)
      ? filters.types.filter((type) => type !== value)
      : [...filters.types, value];

    if (nextTypes.length === 0) {
      setLocalTypeError("Selecione ao menos um tipo.");
      return;
    }

    updateQuery({ types: nextTypes, page: 1 });
  };

  const handlePageChange = (nextPage: number) => {
    updateQuery({ page: nextPage });
  };

  const items = meta?.items ?? [];
  const statsLabel = useMemo(() => {
    if (meta) {
      return `${meta.totalItems} registros encontrados no periodo selecionado`;
    }
    if (error) {
      return "Nao foi possivel carregar os registros.";
    }
    if (localTypeError) {
      return "Ajuste os filtros para carregar os registros.";
    }
    return "Carregando registros...";
  }, [meta, error, localTypeError]);

  return (
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
          typeError={localTypeError}
          onPeriodChange={handlePeriodChange}
          onMoonPhaseChange={handleMoonPhaseChange}
          onTypeToggle={handleTypeToggle}
        />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>{statsLabel}</span>
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

          {!error && items.length === 0 ? (
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
            page={page}
            totalPages={meta.totalPages}
            hasNext={meta.hasNext}
            hasPrevious={meta.hasPrevious}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>
    </main>
  );
}
