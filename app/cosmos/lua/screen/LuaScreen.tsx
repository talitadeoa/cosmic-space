'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { ScreenProps } from '@/app/cosmos/types';
import {
  MONTHLY_INSIGHT_LABELS,
  MONTHLY_PROMPTS,
  MONTHLY_RESPONSES,
  MONTHLY_TONES,
  buildMonthlyStorageKey,
} from '@/app/cosmos/utils/insightChatPresets';
import {
  buildMoonInfo,
  buildMonthEntries,
  deriveHighlightTarget,
  flattenCalendarDays,
  formatDateInTimezone,
  findMonthEntryByDate,
  getResponsiveLayout,
  type HighlightTarget,
  type MonthEntry,
} from '@/app/cosmos/utils/luaList';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import { useMonthlyInsights } from '@/hooks/useMonthlyInsights';
import { fetchLunations } from '@/hooks/useLunations';
import { normalizeMoonPhase, type MoonCalendarDay } from '@/lib/api/moonCalendar';
import { formatSavedAtLabel, getResolvedTimezone } from '@/lib/utils/format';
import HighlightBanner from '../components/HighlightBanner';
import MoonCarousel from '../components/MoonCarousel';
import CalendarStatus from '../components/CalendarStatus';
import LuaCycleMenu from '../components/LuaCycleMenu';
import { LuminousTrail } from '@/app/cosmos/components/LuminousTrail';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';

type LuaScreenProps = {
  navigateWithFocus?: ScreenProps['navigateWithFocus'];
};

type PhaseItem = {
  month: MonthEntry;
  phase: MoonPhase;
};

const LuaScreen: React.FC<LuaScreenProps> = ({ navigateWithFocus }) => {
  const { navigateToHome } = useBackToHome();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthEntry | null>(null);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase>('luaNova');
  const { saveInsight, loadInsight } = useMonthlyInsights();
  const [existingInsight, setExistingInsight] = useState('');
  const [existingInsightUpdatedAt, setExistingInsightUpdatedAt] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [revealedCycleKey, setRevealedCycleKey] = useState<string | null>(null);
  const timezone = getResolvedTimezone();
  const MIN_YEAR = 2025;
  const MAX_YEAR = 2028;
  const rangeStart = `${MIN_YEAR}-01-01`;
  const rangeEnd = `${MAX_YEAR}-12-31`;
  const [calendarByYear, setCalendarByYear] = useState<Record<number, MoonCalendarDay[]>>({});
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const pendingControllerRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedYearRef = useRef(false);
  const [visiblePeriod, setVisiblePeriod] = useState({ yearIndex: 0, quarterIndex: 0 });
  const [layout, setLayout] = useState(() =>
    getResponsiveLayout(typeof window !== 'undefined' ? window.innerWidth : undefined)
  );
  const tileSpan = layout.tileWidth + layout.gap;
  const isCompactLayout = layout.tileWidth <= 90;

  const scrollerMaxWidth = useMemo(() => {
    const visibleWindowWidthPx = 3 * tileSpan - layout.gap;
    return Math.max(320, visibleWindowWidthPx + layout.padding * 2);
  }, [layout.gap, layout.padding, tileSpan]);

  const todayIso = useMemo(() => formatDateInTimezone(new Date(), timezone), [timezone]);

  const loadCalendar = useCallback(async () => {
    pendingControllerRef.current?.abort();
    const controller = new AbortController();
    pendingControllerRef.current = controller;
    setIsCalendarLoading(true);
    setCalendarError(null);

    try {
      const response = await fetchLunations({
        start: rangeStart,
        end: rangeEnd,
        source: 'auto',
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      const grouped: Record<number, MoonCalendarDay[]> = {};
      response.days.forEach((day) => {
        const year = Number(day.date.slice(0, 4));
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push({
          date: day.date,
          moonPhase: day.moonPhase,
          sign: day.sign,
          normalizedPhase: normalizeMoonPhase(day.moonPhase),
        });
      });

      setCalendarByYear(grouped);
      setCalendarError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erro ao carregar calendário lunar';
      setCalendarError(message);
    } finally {
      if (!controller.signal.aborted) {
        setIsCalendarLoading(false);
      }
    }
  }, [rangeEnd, rangeStart]);

  const monthEntries = useMemo(() => buildMonthEntries(calendarByYear), [calendarByYear]);
  const yearList = useMemo(() => {
    const years = Array.from(new Set(monthEntries.map((month) => month.year))).sort(
      (a, b) => a - b
    );
    return years;
  }, [monthEntries]);
  const visibleYear =
    yearList.length > 0 ? yearList[Math.min(visiblePeriod.yearIndex, yearList.length - 1)] : null;
  const visibleMonths = useMemo(
    () => (visibleYear === null ? [] : monthEntries.filter((month) => month.year === visibleYear)),
    [monthEntries, visibleYear]
  );

  const getQuarterIndex = useCallback(
    (monthNumber: number) => Math.floor((monthNumber - 1) / 3),
    []
  );

  const quarterBuckets = useMemo(() => {
    if (visibleYear === null) return [] as MonthEntry[][];
    const monthsForYear = visibleMonths;
    return Array.from({ length: 4 }, (_, idx) => monthsForYear.slice(idx * 3, idx * 3 + 3));
  }, [visibleMonths, visibleYear]);

  const visibleQuarterMonths = quarterBuckets[visiblePeriod.quarterIndex] ?? [];

  const phaseSequence = useMemo<PhaseItem[]>(
    () =>
      visibleQuarterMonths.flatMap((month) => [
        { month, phase: 'luaNova' as MoonPhase },
        { month, phase: 'luaCheia' as MoonPhase },
      ]),
    [visibleQuarterMonths]
  );

  useEffect(() => {
    loadCalendar();
    return () => {
      pendingControllerRef.current?.abort();
    };
  }, [loadCalendar]);

  const allDays = useMemo(() => flattenCalendarDays(calendarByYear), [calendarByYear]);

  const findMonthEntry = useCallback(
    (isoDate: string) => findMonthEntryByDate(monthEntries, isoDate),
    [monthEntries]
  );

  const highlightTarget = useMemo(
    () => deriveHighlightTarget(allDays, todayIso, monthEntries),
    [allDays, monthEntries, todayIso]
  );

  useEffect(() => {
    if (!yearList.length) return;
    if (!hasInitializedYearRef.current) {
      const targetYear = highlightTarget?.year ?? yearList[yearList.length - 1];
      const targetIndex = yearList.indexOf(targetYear);
      const fallbackYearIndex = targetIndex >= 0 ? targetIndex : yearList.length - 1;
      const quarterIndex = highlightTarget ? getQuarterIndex(highlightTarget.monthNumber) : 0;
      setVisiblePeriod({
        yearIndex: fallbackYearIndex,
        quarterIndex,
      });
      hasInitializedYearRef.current = true;
      return;
    }

    if (visiblePeriod.yearIndex > yearList.length - 1) {
      setVisiblePeriod((prev) => ({
        ...prev,
        yearIndex: yearList.length - 1,
      }));
    }
  }, [getQuarterIndex, highlightTarget, visiblePeriod.yearIndex, yearList]);

  useEffect(() => {
    if (!selectedMonth && monthEntries.length > 0) {
      const highlighted = highlightTarget
        ? monthEntries.find(
            (m) => m.year === highlightTarget.year && m.monthNumber === highlightTarget.monthNumber
          )
        : null;
      const todayMonth = findMonthEntry(todayIso);
      const initial = highlighted || todayMonth || monthEntries[monthEntries.length - 1];
      setSelectedMonth(initial ?? null);
    }
  }, [findMonthEntry, highlightTarget, monthEntries, selectedMonth, todayIso]);

  useEffect(() => {
    if (visibleYear === null) return;
    if (!selectedMonth) return;
    if (selectedMonth.year === visibleYear) return;
    const sameMonth = monthEntries.find(
      (month) => month.year === visibleYear && month.monthNumber === selectedMonth.monthNumber
    );
    const fallback = monthEntries.find((month) => month.year === visibleYear);
    setSelectedMonth(sameMonth ?? fallback ?? null);
  }, [monthEntries, selectedMonth, visibleYear]);

  const handleMoonClick = (month: MonthEntry, phase: MoonPhase) => {
    setSelectedMonth(month);
    setSelectedMoonPhase(phase);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let isActive = true;

    const fetchExistingInsight = async () => {
      if (!isModalOpen || !selectedMonth) return;
      setIsLoadingInsight(true);
      setExistingInsight('');
      setExistingInsightUpdatedAt(null);

      try {
        const item = await loadInsight(
          selectedMoonPhase,
          selectedMonth.year,
          selectedMonth.monthNumber
        );
        if (!isActive) return;
        setExistingInsight(item?.insight ?? '');
        setExistingInsightUpdatedAt(item?.updatedAt ?? item?.createdAt ?? null);
      } catch {
        if (!isActive) return;
        setExistingInsight('');
        setExistingInsightUpdatedAt(null);
      } finally {
        if (isActive) setIsLoadingInsight(false);
      }
    };

    fetchExistingInsight();

    return () => {
      isActive = false;
    };
  }, [isModalOpen, loadInsight, selectedMonth, selectedMoonPhase]);

  const handleInsightSubmit = async (insight: string) => {
    const monthNumber = selectedMonth?.monthNumber ?? 1;
    const year = selectedMonth?.year ?? new Date().getFullYear();
    await saveInsight(selectedMoonPhase, year, monthNumber, insight);
  };

  const handleRetry = useCallback(() => {
    setCalendarByYear({});
    setCalendarError(null);
    loadCalendar();
  }, [loadCalendar]);

  const selectedMoonInfo = buildMoonInfo(selectedMonth, selectedMoonPhase);
  const highlightedMoonInfo = highlightTarget
    ? buildMoonInfo(highlightTarget, highlightTarget.phase)
    : null;
  const selectedMonthName = selectedMonth?.monthName ?? 'Mês';
  const prompt = MONTHLY_PROMPTS[selectedMoonPhase];
  const savedAtLabel = formatSavedAtLabel(existingInsightUpdatedAt);
  const chatStorageKey = buildMonthlyStorageKey(
    selectedMonth?.year ?? 'ano',
    selectedMonth?.monthNumber ?? 1,
    selectedMoonPhase
  );
  const signBadge =
    selectedMoonInfo.signLabel && selectedMoonInfo.signLabel.trim().length > 0
      ? `Signo ${selectedMoonInfo.signLabel}`
      : undefined;
  const chatPlaceholder = isLoadingInsight ? 'Carregando insight salvo...' : prompt.placeholder;

  const focusOnTarget = useCallback(
    (target: HighlightTarget | null) => {
      if (!target) return;
      const targetIndex = yearList.indexOf(target.year);
      if (targetIndex < 0) return;
      setVisiblePeriod({
        yearIndex: targetIndex,
        quarterIndex: getQuarterIndex(target.monthNumber),
      });
    },
    [getQuarterIndex, yearList]
  );

  const handleCycleReveal = useCallback((monthKey: string | null) => {
    setRevealedCycleKey(monthKey);
  }, []);

  const canScrollLeft =
    yearList.length > 0 && (visiblePeriod.yearIndex > 0 || visiblePeriod.quarterIndex > 0);
  const canScrollRight =
    yearList.length > 0 &&
    (visiblePeriod.yearIndex < yearList.length - 1 || visiblePeriod.quarterIndex < 3);

  const handleQuarterStep = useCallback(
    (direction: 'left' | 'right') => {
      setVisiblePeriod((prev) => {
        const delta = direction === 'left' ? -1 : 1;
        let nextQuarter = prev.quarterIndex + delta;
        let nextYearIndex = prev.yearIndex;

        if (nextQuarter < 0) {
          if (prev.yearIndex > 0) {
            nextYearIndex = prev.yearIndex - 1;
            nextQuarter = 3;
          } else {
            nextQuarter = 0;
          }
        }

        if (nextQuarter > 3) {
          if (prev.yearIndex < yearList.length - 1) {
            nextYearIndex = prev.yearIndex + 1;
            nextQuarter = 0;
          } else {
            nextQuarter = 3;
          }
        }

        return { yearIndex: nextYearIndex, quarterIndex: nextQuarter };
      });
    },
    [yearList.length]
  );

  const handleScrollerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (canScrollLeft) handleQuarterStep('left');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (canScrollRight) handleQuarterStep('right');
      }
    },
    [canScrollLeft, canScrollRight, handleQuarterStep]
  );

  const isInvertedLayout = visiblePeriod.quarterIndex >= 2;

  const virtualizedPhases = phaseSequence;
  const isInitialLoading = isCalendarLoading && visibleMonths.length === 0;
  const skeletonCount = 6;
  const quarterLabel = useMemo(() => {
    const quarterNumber = visiblePeriod.quarterIndex + 1;
    if (!visibleQuarterMonths.length) return `T${quarterNumber}`;
    const firstMonth = visibleQuarterMonths[0]?.monthName?.slice(0, 3) ?? '';
    const lastMonth =
      visibleQuarterMonths[visibleQuarterMonths.length - 1]?.monthName?.slice(0, 3) ?? '';
    const yearLabel = visibleYear ? ` • ${visibleYear}` : '';
    return `T${quarterNumber} • ${firstMonth}–${lastMonth}${yearLabel}`;
  }, [visiblePeriod.quarterIndex, visibleQuarterMonths, visibleYear]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Navigate to home if clicking directly on the background, not on child elements
      if (e.target === e.currentTarget) {
        navigateToHome();
      }
    },
    [navigateToHome]
  );

  return (
    <>
      <div
        className="relative flex min-h-[100dvh] w-full flex-col items-center px-3 py-4 sm:px-4 sm:py-8 md:py-10 lg:py-12 cursor-pointer safe-area-inset"
        onClick={handleBackgroundClick}
      >
        {/* Menu de ciclos lunares */}
        <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
          <LuaCycleMenu currentPath="/cosmos/lua" />
        </div>

        <LuminousTrail quadrant={visiblePeriod.quarterIndex as 0 | 1 | 2 | 3} />
        <CalendarStatus isLoading={isCalendarLoading} error={calendarError} onRetry={handleRetry} />

        <div className="flex w-full flex-1 flex-col items-center justify-center">
          {!isInvertedLayout && (
            <CelestialObject
              type="sol"
              size={isCompactLayout ? 'sm' : 'md'}
              interactive
              onClick={(e) =>
                navigateWithFocus?.('planetCardBelowSun', {
                  event: e,
                  type: 'sol',
                  size: 'lg',
                })
              }
              className="mb-2 sm:mb-4 md:mb-5 lg:mb-4"
              floatOffset={-3}
            />
          )}

          {isInvertedLayout && (
            <CelestialObject
              type="planeta"
              size={isCompactLayout ? 'sm' : 'md'}
              interactive
              onClick={(e) =>
                navigateWithFocus?.('planetCardStandalone', {
                  event: e,
                  type: 'planeta',
                  size: 'lg',
                })
              }
              className="mb-2 sm:mb-4 md:mb-5 lg:mb-4"
              floatOffset={-3}
            />
          )}

          <div className="relative w-full max-w-5xl px-2 sm:px-4 md:px-6">
            {highlightTarget && highlightedMoonInfo && (
              <HighlightBanner
                info={highlightedMoonInfo}
                onClick={() => focusOnTarget(highlightTarget)}
              />
            )}

            <div className="relative">
              <MoonCarousel
                scrollerRef={scrollerRef}
                scrollerMaxWidth={scrollerMaxWidth}
                onKeyDown={handleScrollerKeyDown}
                layoutPadding={layout.padding}
                tileWidth={layout.tileWidth}
                gap={layout.gap}
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                onScrollLeft={() => handleQuarterStep('left')}
                onScrollRight={() => handleQuarterStep('right')}
                onRetry={handleRetry}
                isInitialLoading={isInitialLoading}
                monthEntries={visibleQuarterMonths}
                calendarError={calendarError}
                skeletonCount={skeletonCount}
                virtualizedPhases={virtualizedPhases}
                highlightTarget={highlightTarget}
                onMoonClick={handleMoonClick}
                revealedCycleKey={revealedCycleKey}
                onCycleReveal={handleCycleReveal}
              />
            </div>

            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-5 sm:gap-2.5 md:mt-6">
              <div className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-sky-200/90 shadow-[0_12px_30px_rgba(8,47,73,0.45)] sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.18em]">
                {quarterLabel}
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <span
                    key={`quarter-dot-${idx}`}
                    className={`h-2 w-2 rounded-full transition-all duration-200 sm:h-2.5 sm:w-2.5 ${
                      idx === visiblePeriod.quarterIndex
                        ? 'bg-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.85)] scale-110'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex w-full justify-center pt-4 pb-4 sm:pt-5 sm:pb-4 md:pt-6 md:pb-5 lg:pt-4 lg:pb-4">
          {isInvertedLayout ? (
            <CelestialObject
              type="sol"
              size={isCompactLayout ? 'sm' : 'md'}
              interactive
              onClick={(e) =>
                navigateWithFocus?.('planetCardBelowSun', {
                  event: e,
                  type: 'sol',
                  size: 'lg',
                })
              }
              className="mb-1 sm:mb-2"
              floatOffset={2}
            />
          ) : (
            <CelestialObject
              type="planeta"
              size={isCompactLayout ? 'sm' : 'md'}
              interactive
              onClick={(e) =>
                navigateWithFocus?.('planetCardStandalone', {
                  event: e,
                  type: 'planeta',
                  size: 'lg',
                })
              }
              className="mb-1 sm:mb-2"
              floatOffset={2}
            />
          )}
        </div>
      </div>

      <CosmosChatModal
        isOpen={isModalOpen}
        requiresAuthOnSave
        storageKey={chatStorageKey}
        title={selectedMonthName}
        eyebrow={MONTHLY_INSIGHT_LABELS[selectedMoonPhase]}
        subtitle={`Mês #${selectedMonth?.monthNumber ?? 1}`}
        badge={signBadge}
        placeholder={chatPlaceholder}
        systemGreeting={prompt.greeting.replace('{month}', selectedMonthName)}
        systemQuestion={prompt.systemQuestion}
        initialValue={existingInsight}
        initialValueLabel={savedAtLabel || undefined}
        submitLabel="✨ Concluir insight"
        tone={MONTHLY_TONES[selectedMoonPhase]}
        systemResponses={MONTHLY_RESPONSES[selectedMoonPhase]}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (value) => {
          await handleInsightSubmit(value);
        }}
      />
    </>
  );
};

export default LuaScreen;
