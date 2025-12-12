"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { LuminousTrail } from "../components/LuminousTrail";
import MonthlyInsightModal from "@/components/MonthlyInsightModal";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { fetchMoonCalendar, MoonCalendarDay } from "@/lib/api/moonCalendar";
import type { CelestialType, ScreenProps } from "../types";

type LunarPhase = Extract<
  CelestialType,
  "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante"
>;
type HighlightablePhase = Extract<LunarPhase, "luaNova" | "luaCheia">;
const HIGHLIGHTABLE_PHASES: readonly HighlightablePhase[] = ["luaNova", "luaCheia"];
const isHighlightablePhase = (phase?: string | null): phase is HighlightablePhase =>
  !!phase && HIGHLIGHTABLE_PHASES.includes(phase as HighlightablePhase);

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Dimensões e layout
const MOON_TILE_WIDTH = 96;
const MOON_TILE_GAP = 12; // gap-3
const BASE_VISIBLE_COLUMNS = 4;
const SCROLLER_PADDING = 24; // px-6
const MONTHS_PER_YEAR = 12;
const TILE_SPAN = MOON_TILE_WIDTH + MOON_TILE_GAP;

// Configurações de animação
const ANIMATION_CONFIG = {
  spring: { type: "spring" as const, stiffness: 260, damping: 18 },
  float: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  glow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
} as const;

type MonthEntry = {
  year: number;
  monthNumber: number;
  monthName: string;
  newMoonSign: string;
  fullMoonSign: string;
  newMoonDate: string;
  fullMoonDate: string;
};

type HighlightTarget = {
  year: number;
  monthNumber: number;
  monthName: string;
  newMoonSign: string;
  fullMoonSign: string;
  newMoonDate: string;
  fullMoonDate: string;
  phase: HighlightablePhase;
  date: string;
};

type MoonRowProps = {
  phase: HighlightablePhase;
  direction: "up" | "down";
  months: MonthEntry[];
  highlightTarget: HighlightTarget | null;
  trackWidth: number;
  virtualOffsetPx: number;
  onMoonClick: (month: MonthEntry, phase: HighlightablePhase) => void;
};

const formatDateInTimezone = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const formatDateLabel = (isoDate?: string) => {
  if (!isoDate) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
  } catch (error) {
    return isoDate;
  }
};

const buildMonthEntries = (calendarByYear: Record<number, MoonCalendarDay[]>): MonthEntry[] => {
  const years = Object.keys(calendarByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return years.flatMap((year) => {
    const base = MONTH_NAMES.map((month, idx) => ({
      year,
      monthNumber: idx + 1,
      monthName: month,
      newMoonSign: "",
      fullMoonSign: "",
      newMoonDate: "",
      fullMoonDate: "",
    }));

    (calendarByYear[year] || []).forEach((day) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      const monthIndex = Number.isNaN(date.getTime()) ? null : date.getUTCMonth();
      if (monthIndex === null || monthIndex < 0 || monthIndex > 11) return;

      const sign = day.sign?.trim() || "";

      if (day.normalizedPhase === "luaNova" && !base[monthIndex].newMoonSign) {
        base[monthIndex].newMoonSign = sign;
        base[monthIndex].newMoonDate = day.date;
      }

      if (day.normalizedPhase === "luaCheia" && !base[monthIndex].fullMoonSign) {
        base[monthIndex].fullMoonSign = sign;
        base[monthIndex].fullMoonDate = day.date;
      }
    });

    return base;
  });
};

const flattenCalendarDays = (calendarByYear: Record<number, MoonCalendarDay[]>) =>
  Object.values(calendarByYear)
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date));

const findMonthEntryByDate = (monthEntries: MonthEntry[], isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  const monthNumber = parsed.getUTCMonth() + 1;
  return monthEntries.find((m) => m.year === year && m.monthNumber === monthNumber) || null;
};

const deriveHighlightTarget = (
  allDays: MoonCalendarDay[],
  todayIso: string,
  monthEntries: MonthEntry[],
): HighlightTarget | null => {
  const sortedMoonEvents = allDays
    .filter((day) => isHighlightablePhase(day.normalizedPhase))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate = allDays.find((day) => day.date === todayIso);
  const upcoming = sortedMoonEvents.find((day) => day.date >= todayIso) ?? sortedMoonEvents.at(-1);

  const targetDay = isHighlightablePhase(byDate?.normalizedPhase) ? byDate : upcoming;
  if (!targetDay || !isHighlightablePhase(targetDay.normalizedPhase)) return null;

  const monthEntry = findMonthEntryByDate(monthEntries, targetDay.date);
  if (!monthEntry) return null;

  return {
    ...monthEntry,
    phase: targetDay.normalizedPhase,
    date: targetDay.date,
  };
};

const buildMoonInfo = (month: MonthEntry | null, phase: LunarPhase) => {
  const monthName = month?.monthName ?? "Mês";
  const isNewMoon = phase === "luaNova";
  const isFullMoon = phase === "luaCheia";
  const signRaw = isNewMoon ? month?.newMoonSign : month?.fullMoonSign;
  const dateRaw = isNewMoon ? month?.newMoonDate : month?.fullMoonDate;
  const sign = signRaw?.trim();
  const dateLabel = formatDateLabel(dateRaw);
  const signParts = [
    sign && sign.length > 0 ? `em ${sign}` : null,
    dateLabel ? `• ${dateLabel}` : null,
    month?.year ? `• ${month.year}` : null,
  ].filter(Boolean);

  return {
    monthName,
    signLabel: signParts.length > 0 ? signParts.join(" ") : "— aguardando sincronização",
    phaseLabel: isNewMoon ? "Lua Nova" : isFullMoon ? "Lua Cheia" : "Lua",
  };
};

const ArrowIcon: React.FC<{ direction: "left" | "right" }> = ({ direction }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-5 w-5 stroke-[2.5] drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]"
  >
    <path
      d={
        direction === "left"
          ? "M14.5 5.5 8 12l6.5 6.5"
          : "M9.5 5.5 16 12l-6.5 6.5"
      }
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowButton: React.FC<{
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}> = ({ direction, disabled, onClick, label }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className="absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/85 text-slate-50 shadow-[0_10px_30px_rgba(8,47,73,0.55)] backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40"
    style={{ [direction === "left" ? "left" : "right"]: "8px" }}
  >
    <ArrowIcon direction={direction} />
  </button>
);

// Utilidade para calcular float offset com base na direção e índice
const getFloatOffset = (direction: "up" | "down", globalIdx: number): number => {
  const base = direction === "up" ? -1.5 : 1.5;
  return direction === "up" ? base + globalIdx * 0.05 : base - globalIdx * 0.05;
};

// Componente para controles de timeline
const TimelineControls: React.FC<{
  progress: number;
  onProgressChange: (value: number) => void;
}> = ({ progress, onProgressChange }) => (
  <div className="mt-4 px-2 space-y-2">
    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-300/80">
      <span>Timeline</span>
      <span>{Math.round(progress * 100)}%</span>
    </div>
    <input
      type="range"
      min={0}
      max={1000}
      value={Math.round(progress * 1000)}
      onChange={(e) => onProgressChange(Number(e.target.value) / 1000)}
      aria-label="Controle da timeline lunar"
      className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800/80 accent-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-0"
    />
  </div>
);
const EmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-6 text-center text-slate-200 shadow-lg shadow-sky-900/40">
    <div className="text-sm font-semibold uppercase tracking-[0.25em]">Linha vazia</div>
    <p className="text-[12px] text-slate-300/80">
      Ainda não temos dados para este intervalo. Tente sincronizar novamente.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full border border-sky-200/30 bg-sky-500/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
    >
      Recarregar calendário
    </button>
  </div>
);
const MoonRowSkeleton: React.FC<{ count: number; trackWidth: number }> = ({ count, trackWidth }) => (
  <div className="flex min-w-max flex-col items-center gap-6" style={{ minWidth: trackWidth }}>
    <div className="flex min-w-max items-center gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skeleton-top-${idx}`}
          className="h-16 w-[96px] animate-pulse rounded-full bg-slate-700/50 ring-1 ring-white/5"
        />
      ))}
    </div>
    <div className="h-0.5 w-full min-w-[320px] animate-pulse bg-slate-700/70" />
    <div className="flex min-w-max items-center gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skeleton-bottom-${idx}`}
          className="h-16 w-[96px] animate-pulse rounded-full bg-slate-700/50 ring-1 ring-white/5"
        />
      ))}
    </div>
  </div>
);
const CalendarStatus: React.FC<{
  isLoading: boolean;
  error: string | null;
  generatedAt: string | undefined;
  onRetry: () => void;
  formatDate: (iso?: string) => string;
}> = ({ isLoading, error, generatedAt, onRetry, formatDate }) => (
  <div
    className="absolute right-4 top-4 flex items-center gap-3 rounded-full border border-white/5 bg-slate-900/60 px-4 py-2 text-[11px] text-slate-100 shadow-lg shadow-sky-900/30 backdrop-blur-md"
    role="status"
    aria-live="polite"
  >
    <span>
      {isLoading && "Sincronizando calendário lunar..."}
      {!isLoading && error && `Erro ao sincronizar: ${error}`}
      {!isLoading &&
        !error &&
        (generatedAt ? `Dados gerados em ${formatDate(generatedAt)}` : "Calendário lunar pronto")}
    </span>
    {error && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-sky-200/30 bg-sky-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
      >
        Tentar novamente
      </button>
    )}
  </div>
);
const MoonRow: React.FC<MoonRowProps> = ({
  phase,
  direction,
  months,
  highlightTarget,
  trackWidth,
  virtualOffsetPx,
  onMoonClick,
}) => {
  return (
    <div
      className="flex min-w-max items-center gap-3"
      style={{ minWidth: trackWidth, paddingLeft: virtualOffsetPx }}
    >
      {months.map((month, idx) => {
        const isHighlighted =
          highlightTarget &&
          highlightTarget.phase === phase &&
          highlightTarget.monthNumber === month.monthNumber &&
          highlightTarget.year === month.year;

        const floatOffset = getFloatOffset(direction, idx);
        const delay = idx * 0.018;

        return (
          <motion.div
            key={`${phase}-${month.year}-${String(month.monthNumber).padStart(2, "0")}`}
            transition={{
              ...ANIMATION_CONFIG.spring,
              delay,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            style={{ width: MOON_TILE_WIDTH }}
          >
            <div className="relative flex items-center justify-center">
              {isHighlighted && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-400/20 blur-xl"
                  animate={{ opacity: [0.5, 0.25, 0.5], scale: [1, 1.05, 1] }}
                  transition={ANIMATION_CONFIG.glow}
                />
              )}
              <CelestialObject
                type={phase}
                interactive
                onClick={() => onMoonClick(month, phase)}
                floatOffset={floatOffset}
                className={
                  isHighlighted
                    ? "ring-2 ring-sky-300/80 shadow-[0_0_0_5px_rgba(56,189,248,0.28)]"
                    : "ring-1 ring-white/5"
                }
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthEntry | null>(null);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<LunarPhase>("luaNova");
  const { saveInsight } = useMonthlyInsights();
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState({ startYear: currentYear - 1, endYear: currentYear + 1 });
  const [calendarByYear, setCalendarByYear] = useState<Record<number, MoonCalendarDay[]>>({});
  const [generatedAt, setGeneratedAt] = useState<string | undefined>(undefined);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const loadedYearsRef = useRef<Set<number>>(new Set());
  const loadingYearsRef = useRef<Set<number>>(new Set());
  const pendingControllersRef = useRef<Map<number, AbortController>>(new Map());
  const loadingCounterRef = useRef(0);
  const pendingPrependPxRef = useRef(0);
  const previousStartRef = useRef(range.startYear);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportFraction, setViewportFraction] = useState(0);
  const [virtualWindow, setVirtualWindow] = useState({ start: 0, end: 40 });

  const visibleColumns = BASE_VISIBLE_COLUMNS;
  const scrollerMaxWidth = useMemo(() => {
    const visibleWindowWidthPx = visibleColumns * TILE_SPAN - MOON_TILE_GAP;
    return visibleWindowWidthPx + SCROLLER_PADDING * 2;
  }, [visibleColumns]);

  const todayIso = useMemo(() => formatDateInTimezone(new Date(), timezone), [timezone]);

  const ensureYearLoaded = useCallback(
    async (year: number) => {
      if (loadedYearsRef.current.has(year) || loadingYearsRef.current.has(year)) return;
      loadingYearsRef.current.add(year);
      loadingCounterRef.current += 1;
      setIsCalendarLoading(true);

      const controller = new AbortController();
      pendingControllersRef.current.set(year, controller);

      try {
        const response = await fetchMoonCalendar({
          start: `${year}-01-01`,
          end: `${year}-12-31`,
          tz: timezone,
          signal: controller.signal,
        });

        loadedYearsRef.current.add(year);
        setCalendarByYear((prev) => ({ ...prev, [year]: response.days }));
        setGeneratedAt(response.generatedAt);
        setCalendarError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Erro ao carregar calendário lunar";
        setCalendarError(message);
      } finally {
        loadingYearsRef.current.delete(year);
        pendingControllersRef.current.delete(year);
        loadingCounterRef.current = Math.max(0, loadingCounterRef.current - 1);
        if (loadingCounterRef.current === 0) {
          setIsCalendarLoading(false);
        }
      }
    },
    [timezone],
  );

  useEffect(() => {
    const years: number[] = [];
    for (let year = range.startYear; year <= range.endYear; year += 1) {
      years.push(year);
    }
    years.forEach((year) => ensureYearLoaded(year));
  }, [ensureYearLoaded, range.endYear, range.startYear]);

  useEffect(() => {
    if (range.startYear < previousStartRef.current) {
      const addedYears = previousStartRef.current - range.startYear;
      pendingPrependPxRef.current += addedYears * MONTHS_PER_YEAR * TILE_SPAN;
    }
    previousStartRef.current = range.startYear;
  }, [range.startYear]);

  const monthEntries = useMemo(() => buildMonthEntries(calendarByYear), [calendarByYear]);

  useEffect(() => {
    if (pendingPrependPxRef.current > 0 && scrollerRef.current) {
      scrollerRef.current.scrollLeft += pendingPrependPxRef.current;
      pendingPrependPxRef.current = 0;
    }
  }, [monthEntries.length]);

  useEffect(
    () => () => {
      pendingControllersRef.current.forEach((controller) => controller.abort());
      pendingControllersRef.current.clear();
    },
    [],
  );

  const allDays = useMemo(() => flattenCalendarDays(calendarByYear), [calendarByYear]);

  const findMonthEntry = useCallback(
    (isoDate: string) => findMonthEntryByDate(monthEntries, isoDate),
    [monthEntries],
  );

  const highlightTarget = useMemo(
    () => deriveHighlightTarget(allDays, todayIso, monthEntries),
    [allDays, monthEntries, todayIso],
  );

  useEffect(() => {
    if (!selectedMonth && monthEntries.length > 0) {
      const highlighted = highlightTarget
        ? monthEntries.find(
            (m) => m.year === highlightTarget.year && m.monthNumber === highlightTarget.monthNumber,
          )
        : null;
      const todayMonth = findMonthEntry(todayIso);
      const initial = highlighted || todayMonth || monthEntries[monthEntries.length - 1];
      setSelectedMonth(initial ?? null);
    }
  }, [findMonthEntry, highlightTarget, monthEntries, selectedMonth, todayIso]);

  const handleMoonClick = (month: MonthEntry, phase: HighlightablePhase) => {
    setSelectedMonth(month);
    setSelectedMoonPhase(phase);
    setIsModalOpen(true);
  };

  const handleInsightSubmit = async (insight: string) => {
    const monthNumber = selectedMonth?.monthNumber ?? 1;
    await saveInsight(selectedMoonPhase, monthNumber, insight);
  };

  const handleRetry = useCallback(() => {
    pendingControllersRef.current.forEach((controller) => controller.abort());
    pendingControllersRef.current.clear();
    loadedYearsRef.current.clear();
    loadingYearsRef.current.clear();
    setCalendarByYear({});
    setCalendarError(null);
    setGeneratedAt(undefined);
    setIsCalendarLoading(true);

    for (let year = range.startYear; year <= range.endYear; year += 1) {
      ensureYearLoaded(year);
    }
  }, [ensureYearLoaded, range.endYear, range.startYear]);

  const selectedMoonInfo = buildMoonInfo(selectedMonth, selectedMoonPhase);
  const highlightedMoonInfo = highlightTarget
    ? buildMoonInfo(highlightTarget, highlightTarget.phase)
    : null;

  const getColumnIndex = useCallback(
    (target: typeof highlightTarget) => {
      if (!target) return null;
      const idx = monthEntries.findIndex(
        (month) => month.year === target.year && month.monthNumber === target.monthNumber,
      );
      return idx >= 0 ? idx : null;
    },
    [monthEntries],
  );

  const centerOnColumn = useCallback(
    (columnIndex: number | null) => {
      if (columnIndex === null) return;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const columnCenter =
        SCROLLER_PADDING + columnIndex * TILE_SPAN + MOON_TILE_WIDTH / 2;
      const target = columnCenter - scroller.clientWidth / 2;
      scroller.scrollTo({
        left: Math.max(0, target),
        behavior: "smooth",
      });
    },
    [],
  );

  const updateScrollMetrics = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const max = scroller.scrollWidth - scroller.clientWidth;
    const progress = max > 0 ? Math.min(scroller.scrollLeft / max, 1) : 0;
    const fraction =
      scroller.scrollWidth > 0 ? Math.min(scroller.clientWidth / scroller.scrollWidth, 1) : 0;

    setScrollProgress(progress);
    setViewportFraction(fraction);

    const bufferTiles = 6;
    const start = Math.max(0, Math.floor(scroller.scrollLeft / TILE_SPAN) - bufferTiles);
    const visibleTiles = Math.ceil(scroller.clientWidth / TILE_SPAN) + bufferTiles * 2;
    const end = Math.min(monthEntries.length, start + visibleTiles);
    setVirtualWindow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [monthEntries.length]);

  useEffect(() => {
    const column = getColumnIndex(highlightTarget);
    centerOnColumn(column);
  }, [centerOnColumn, getColumnIndex, highlightTarget]);

  const extendPast = useCallback(() => {
    setRange((prev) => ({ ...prev, startYear: prev.startYear - 1 }));
  }, []);

  const extendFuture = useCallback(() => {
    setRange((prev) => ({ ...prev, endYear: prev.endYear + 1 }));
  }, []);

  const maybeExtendRange = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isCalendarLoading) return;

    const max = scroller.scrollWidth - scroller.clientWidth;
    const threshold = TILE_SPAN * 4;

    if (scroller.scrollLeft < threshold) {
      extendPast();
    }
    if (max - scroller.scrollLeft < threshold) {
      extendFuture();
    }
  }, [extendFuture, extendPast, isCalendarLoading]);

  const scheduleScrollUpdate = useCallback(() => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      updateScrollMetrics();
      maybeExtendRange();
    });
  }, [maybeExtendRange, updateScrollMetrics]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      scheduleScrollUpdate();
    };

    updateScrollMetrics();
    maybeExtendRange();

    scroller.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(() => updateScrollMetrics());
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [maybeExtendRange, scheduleScrollUpdate, updateScrollMetrics]);

  useEffect(() => {
    updateScrollMetrics();
  }, [updateScrollMetrics, visibleColumns, monthEntries.length]);

  const handleSliderChange = (value: number) => {
    setScrollProgress(value);
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: max * value, behavior: "smooth" });
  };

  const scrollByStep = useCallback(
    (direction: "left" | "right") => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const step = TILE_SPAN * visibleColumns;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const targetLeft =
        direction === "left"
          ? Math.max(0, scroller.scrollLeft - step)
          : Math.min(max, scroller.scrollLeft + step);

      scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
      setScrollProgress(max > 0 ? targetLeft / max : 0);
    },
    [visibleColumns],
  );

  const handleScrollerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByStep("left");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByStep("right");
      }
      if (event.key === "Home") {
        event.preventDefault();
        handleSliderChange(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        handleSliderChange(1);
      }
    },
    [handleSliderChange, scrollByStep],
  );

  const hasOverflow = viewportFraction > 0 && viewportFraction < 0.999;
  const canScrollLeft = hasOverflow && scrollProgress > 0.01;
  const canScrollRight = hasOverflow && scrollProgress < 0.99;

  const trackWidth = useMemo(() => {
    const monthCount = Math.max(1, monthEntries.length);
    return monthCount * TILE_SPAN - MOON_TILE_GAP;
  }, [monthEntries.length]);

  const virtualizedMonths = useMemo(
    () => monthEntries.slice(virtualWindow.start, virtualWindow.end),
    [monthEntries, virtualWindow.end, virtualWindow.start],
  );
  const virtualOffsetPx = virtualWindow.start * TILE_SPAN;
  const isInitialLoading = isCalendarLoading && monthEntries.length === 0;
  const skeletonCount = useMemo(() => Math.max(visibleColumns + 2, 8), [visibleColumns]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-16">
      <LuminousTrail />
      <CalendarStatus
        isLoading={isCalendarLoading}
        error={calendarError}
        generatedAt={generatedAt}
        onRetry={handleRetry}
        formatDate={formatDateLabel}
      />

      <CelestialObject
        type="sol"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardBelowSun", {
            event: e,
            type: "sol",
            size: "lg",
          })
        }
        className="mt-4"
        floatOffset={-3}
      />

      <div className="relative w-full max-w-5xl px-4">
        <div className="mb-3 flex items-center justify-between px-2 text-[11px] uppercase tracking-[0.25em] text-slate-200/80">
          <span>Linha do tempo lunar • {range.startYear} → {range.endYear}</span>
          <span className="text-[10px] text-slate-300/80">
            Arraste, use as setas ou o mini slide — novos anos carregam automaticamente
          </span>
        </div>

        {highlightTarget && highlightedMoonInfo && (
          <button
            type="button"
            onClick={() => centerOnColumn(getColumnIndex(highlightTarget))}
            className="mb-4 flex items-center gap-2 rounded-full border border-sky-300/30 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100 shadow-lg shadow-sky-900/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          >
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-300/90 shadow-[0_0_12px_rgba(125,211,252,0.9)] animate-pulse" />
            </span>
            <span className="font-semibold">{highlightedMoonInfo.phaseLabel}</span>
            <span className="text-slate-300/80">
              {highlightedMoonInfo.monthName} {highlightedMoonInfo.signLabel}
            </span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="group relative w-full overflow-x-auto overflow-y-visible rounded-3xl border border-white/5 bg-slate-900/60 px-6 py-6 shadow-xl shadow-sky-900/40 backdrop-blur-xl transition-[max-width] duration-200"
          onKeyDown={handleScrollerKeyDown}
          tabIndex={0}
          aria-label="Linha do tempo lunar"
          style={{ maxWidth: scrollerMaxWidth, marginLeft: "auto", marginRight: "auto" }}
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent opacity-80" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-950 via-slate-950/70 to-transparent opacity-80" />

          <ArrowButton
            direction="left"
            disabled={!canScrollLeft}
            onClick={() => scrollByStep("left")}
            label="Ver luas anteriores"
          />
          <ArrowButton
            direction="right"
            disabled={!canScrollRight}
            onClick={() => scrollByStep("right")}
            label="Ver próximas luas"
          />

          {isInitialLoading && <MoonRowSkeleton count={skeletonCount} trackWidth={trackWidth} />}

          {!isInitialLoading && monthEntries.length === 0 && !calendarError && (
            <EmptyState onRetry={handleRetry} />
          )}

          {!isInitialLoading && monthEntries.length > 0 && (
            <div className="flex min-w-max flex-col items-center gap-6" style={{ minWidth: trackWidth }}>
              {/* LINHA DE CIMA */}
              <MoonRow
                phase="luaNova"
                direction="up"
                months={virtualizedMonths}
                highlightTarget={highlightTarget}
                trackWidth={trackWidth}
                virtualOffsetPx={virtualOffsetPx}
                onMoonClick={handleMoonClick}
              />

              <motion.div
                className="h-0.5 w-full bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
                style={{ minWidth: trackWidth, marginLeft: virtualOffsetPx }}
                animate={{ x: [-10, 10, -10] }}
                transition={ANIMATION_CONFIG.float}
              />

              {/* LINHA DE BAIXO */}
              <MoonRow
                phase="luaCheia"
                direction="down"
                months={virtualizedMonths}
                highlightTarget={highlightTarget}
                trackWidth={trackWidth}
                virtualOffsetPx={virtualOffsetPx}
                onMoonClick={handleMoonClick}
              />
            </div>
          )}
        </div>

        <TimelineControls progress={scrollProgress} onProgressChange={handleSliderChange} />

      </div>

      <CelestialObject
        type="planeta"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardStandalone", {
            event: e,
            type: "planeta",
            size: "lg",
          })
        }
        className="mb-4"
        floatOffset={2}
      />

      <MonthlyInsightModal
        isOpen={isModalOpen}
        moonIndex={selectedMonth?.monthNumber ?? 1}
        moonPhase={selectedMoonPhase}
        moonSignLabel={selectedMoonInfo.signLabel}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInsightSubmit}
      />
    </div>
  );
};

export default LuaListScreen;
