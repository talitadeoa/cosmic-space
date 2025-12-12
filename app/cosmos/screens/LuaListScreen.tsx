"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import MonthlyInsightModal from "@/components/MonthlyInsightModal";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { fetchMoonCalendar, type MoonCalendarDay } from "@/lib/api/moonCalendar";
import ArrowButton from "../components/lua-list/ArrowButton";
import CalendarStatus from "../components/lua-list/CalendarStatus";
import EmptyState from "../components/lua-list/EmptyState";
import MoonRow from "../components/lua-list/MoonRow";
import MoonRowSkeleton from "../components/lua-list/MoonRowSkeleton";
import { CelestialObject } from "../components/CelestialObject";
import { LuminousTrail } from "../components/LuminousTrail";
import type { ScreenProps } from "../types";
import type { MoonPhase } from "../utils/todoStorage";
import {
  ANIMATION_CONFIG,
  buildMoonInfo,
  buildMonthEntries,
  deriveHighlightTarget,
  flattenCalendarDays,
  formatDateInTimezone,
  findMonthEntryByDate,
  MONTHS_PER_YEAR,
  MonthEntry,
  getResponsiveLayout,
} from "../utils/luaList";

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthEntry | null>(null);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase>("luaNova");
  const { saveInsight } = useMonthlyInsights();
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState({ startYear: currentYear - 1, endYear: currentYear + 1 });
  const [calendarByYear, setCalendarByYear] = useState<Record<number, MoonCalendarDay[]>>({});
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const loadedYearsRef = useRef<Set<number>>(new Set());
  const loadingYearsRef = useRef<Set<number>>(new Set());
  const pendingControllersRef = useRef<Map<number, AbortController>>(new Map());
  const loadingCounterRef = useRef(0);
  const pendingPrependPxRef = useRef(0);
  const previousStartRef = useRef(range.startYear);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportFraction, setViewportFraction] = useState(0);
  const [virtualWindow, setVirtualWindow] = useState({ start: 0, end: 40 });
  const [layout, setLayout] = useState(() =>
    getResponsiveLayout(typeof window !== "undefined" ? window.innerWidth : undefined),
  );
  const tileSpan = layout.tileWidth + layout.gap;
  const isCompactLayout = layout.tileWidth <= 90;

  const scrollerMaxWidth = useMemo(() => {
    const visibleWindowWidthPx = layout.visibleColumns * tileSpan - layout.gap;
    return Math.max(320, visibleWindowWidthPx + layout.padding * 2);
  }, [layout.gap, layout.padding, layout.visibleColumns, tileSpan]);

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
      pendingPrependPxRef.current += addedYears * MONTHS_PER_YEAR * tileSpan;
    }
    previousStartRef.current = range.startYear;
  }, [range.startYear, tileSpan]);

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

  const handleMoonClick = (month: MonthEntry, phase: MoonPhase) => {
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
      const columnCenter = layout.padding + columnIndex * tileSpan + layout.tileWidth / 2;
      const target = columnCenter - scroller.clientWidth / 2;
      scroller.scrollTo({
        left: Math.max(0, target),
        behavior: "smooth",
      });
    },
    [layout.padding, layout.tileWidth, tileSpan],
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
    const start = Math.max(0, Math.floor(scroller.scrollLeft / tileSpan) - bufferTiles);
    const visibleTiles = Math.ceil(scroller.clientWidth / tileSpan) + bufferTiles * 2;
    const end = Math.min(monthEntries.length, start + visibleTiles);
    setVirtualWindow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [monthEntries.length, tileSpan]);

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
    const threshold = tileSpan * 4;

    if (scroller.scrollLeft < threshold) {
      extendPast();
    }
    if (max - scroller.scrollLeft < threshold) {
      extendFuture();
    }
  }, [extendFuture, extendPast, isCalendarLoading, tileSpan]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      updateScrollMetrics();
      maybeExtendRange();
    };

    updateScrollMetrics();
    maybeExtendRange();

    scroller.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(() => updateScrollMetrics());
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [maybeExtendRange, updateScrollMetrics]);

  useEffect(() => {
    updateScrollMetrics();
  }, [layout.visibleColumns, monthEntries.length, updateScrollMetrics]);

  const scrollToProgress = useCallback((value: number) => {
    setScrollProgress(value);
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: max * value, behavior: "smooth" });
  }, []);

  const scrollByStep = useCallback(
    (direction: "left" | "right") => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const step = tileSpan * layout.visibleColumns;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const targetLeft =
        direction === "left"
          ? Math.max(0, scroller.scrollLeft - step)
          : Math.min(max, scroller.scrollLeft + step);

      scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
      setScrollProgress(max > 0 ? targetLeft / max : 0);
    },
    [layout.visibleColumns, tileSpan],
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
        scrollToProgress(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        scrollToProgress(1);
      }
    },
    [scrollByStep, scrollToProgress],
  );

  const hasOverflow = viewportFraction > 0 && viewportFraction < 0.999;
  const canScrollLeft = hasOverflow && scrollProgress > 0.01;
  const canScrollRight = hasOverflow && scrollProgress < 0.99;

  const trackWidth = useMemo(() => {
    const monthCount = Math.max(1, monthEntries.length);
    return monthCount * tileSpan - layout.gap;
  }, [layout.gap, monthEntries.length, tileSpan]);

  const virtualizedMonths = useMemo(
    () => monthEntries.slice(virtualWindow.start, virtualWindow.end),
    [monthEntries, virtualWindow.end, virtualWindow.start],
  );
  const virtualOffsetPx = virtualWindow.start * tileSpan;
  const isInitialLoading = isCalendarLoading && monthEntries.length === 0;
  const skeletonCount = useMemo(
    () => Math.max(Math.ceil(layout.visibleColumns) + 2, 8),
    [layout.visibleColumns],
  );
  const diagonalStep = Math.max(8, Math.min(18, Math.round(layout.tileWidth * 0.15)));
  const topBaseOffset = diagonalStep * 2.2;
  const bottomBaseOffset = diagonalStep * 6.4;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => {
      setLayout((prev) => {
        const next = getResponsiveLayout(window.innerWidth);
        if (
          prev.tileWidth === next.tileWidth &&
          prev.gap === next.gap &&
          prev.padding === next.padding &&
          prev.visibleColumns === next.visibleColumns
        ) {
          return prev;
        }
        return next;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-10 sm:py-14 lg:py-16">
      <LuminousTrail />
      <CalendarStatus
        isLoading={isCalendarLoading}
        error={calendarError}
        onRetry={handleRetry}
      />

      <CelestialObject
        type="sol"
        size={isCompactLayout ? "md" : "lg"}
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

      <div className="relative w-full max-w-5xl px-3 sm:px-4">
        {highlightTarget && highlightedMoonInfo && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={() => centerOnColumn(getColumnIndex(highlightTarget))}
              className="flex items-center gap-2 rounded-full border border-sky-300/30 bg-slate-900/80 px-4 py-3 text-[11px] text-slate-100 shadow-lg shadow-sky-900/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            >
              <span className="flex h-2.5 w-2.5 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-300/90 shadow-[0_0_12px_rgba(125,211,252,0.9)] animate-pulse" />
              </span>
              <span className="font-semibold">{highlightedMoonInfo.phaseLabel}</span>
              <span className="text-slate-300/80">{highlightedMoonInfo.monthName}</span>
              <span className="text-slate-300/80">{highlightedMoonInfo.signLabel}</span>
            </button>
          </div>
        )}

        <div
          ref={scrollerRef}
          className="group relative w-full overflow-x-auto overflow-y-visible rounded-3xl py-6 transition-[max-width] duration-200"
          onKeyDown={handleScrollerKeyDown}
          tabIndex={0}
          aria-label="Carrossel de luas"
          style={{
            maxWidth: scrollerMaxWidth,
            paddingLeft: layout.padding,
            paddingRight: layout.padding,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
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

          {isInitialLoading && (
            <MoonRowSkeleton
              count={skeletonCount}
              trackWidth={trackWidth}
              tileWidth={layout.tileWidth}
              gap={layout.gap}
            />
          )}

          {!isInitialLoading && monthEntries.length === 0 && !calendarError && (
            <EmptyState onRetry={handleRetry} />
          )}

          {!isInitialLoading && monthEntries.length > 0 && (
            <div
              className="flex min-w-max flex-col items-center gap-10"
              style={{ minWidth: trackWidth }}
            >
              {/* LINHA DE CIMA */}
              <MoonRow
                phase="luaNova"
                direction="up"
                months={virtualizedMonths}
                highlightTarget={highlightTarget}
                trackWidth={trackWidth}
                virtualOffsetPx={virtualOffsetPx}
                onMoonClick={handleMoonClick}
                tileWidth={layout.tileWidth}
                gap={layout.gap}
                diagonalStep={diagonalStep}
                baseYOffset={topBaseOffset}
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
                tileWidth={layout.tileWidth}
                gap={layout.gap}
                diagonalStep={diagonalStep}
                baseYOffset={bottomBaseOffset}
              />
            </div>
          )}
        </div>

      </div>

      <CelestialObject
        type="planeta"
        size={isCompactLayout ? "md" : "lg"}
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
