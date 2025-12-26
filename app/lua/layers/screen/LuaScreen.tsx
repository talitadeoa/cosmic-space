'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import { LuminousTrail } from '@/app/cosmos/components/LuminousTrail';
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

type LuaScreenProps = {
  navigateWithFocus?: ScreenProps['navigateWithFocus'];
};

type PhaseItem = {
  month: MonthEntry;
  phase: MoonPhase;
};

const LuaScreen: React.FC<LuaScreenProps> = ({ navigateWithFocus }) => {
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
  const pendingCenterTargetRef = useRef<HighlightTarget | null>(null);
  const [visibleYearIndex, setVisibleYearIndex] = useState(0);
  const [layout, setLayout] = useState(() =>
    getResponsiveLayout(typeof window !== 'undefined' ? window.innerWidth : undefined)
  );
  const tileSpan = layout.tileWidth + layout.gap;
  const isCompactLayout = layout.tileWidth <= 90;

  const scrollerMaxWidth = useMemo(() => {
    const visibleWindowWidthPx = layout.visibleColumns * tileSpan - layout.gap;
    return Math.max(320, visibleWindowWidthPx + layout.padding * 2);
  }, [layout.gap, layout.padding, layout.visibleColumns, tileSpan]);

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
        source: 'db',
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
    yearList.length > 0 ? yearList[Math.min(visibleYearIndex, yearList.length - 1)] : null;
  const visibleMonths = useMemo(
    () => (visibleYear === null ? [] : monthEntries.filter((month) => month.year === visibleYear)),
    [monthEntries, visibleYear]
  );

  const phaseSequence = useMemo<PhaseItem[]>(
    () =>
      visibleMonths.flatMap((month) => [
        { month, phase: 'luaNova' as MoonPhase },
        { month, phase: 'luaCheia' as MoonPhase },
      ]),
    [visibleMonths]
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
      setVisibleYearIndex(targetIndex >= 0 ? targetIndex : yearList.length - 1);
      hasInitializedYearRef.current = true;
      return;
    }

    if (visibleYearIndex > yearList.length - 1) {
      setVisibleYearIndex(yearList.length - 1);
    }
  }, [highlightTarget, visibleYearIndex, yearList]);

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

  const getColumnIndex = useCallback(
    (target: typeof highlightTarget) => {
      if (!target) return null;
      const idx = visibleMonths.findIndex(
        (month) => month.year === target.year && month.monthNumber === target.monthNumber
      );
      return idx >= 0 ? idx : null;
    },
    [visibleMonths]
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
        behavior: 'smooth',
      });
    },
    [layout.padding, layout.tileWidth, tileSpan]
  );

  const focusOnTarget = useCallback(
    (target: HighlightTarget | null) => {
      if (!target) return;
      const column = getColumnIndex(target);
      if (column === null) {
        pendingCenterTargetRef.current = target;
        const targetIndex = yearList.indexOf(target.year);
        if (targetIndex >= 0 && targetIndex !== visibleYearIndex) {
          setVisibleYearIndex(targetIndex);
        }
        return;
      }
      centerOnColumn(column);
    },
    [centerOnColumn, getColumnIndex, visibleYearIndex, yearList]
  );

  useEffect(() => {
    focusOnTarget(highlightTarget);
  }, [focusOnTarget, highlightTarget]);

  useEffect(() => {
    const pendingTarget = pendingCenterTargetRef.current;
    if (!pendingTarget) return;
    if (pendingTarget.year !== visibleYear) return;
    const column = getColumnIndex(pendingTarget);
    if (column === null) return;
    centerOnColumn(column);
    pendingCenterTargetRef.current = null;
  }, [centerOnColumn, getColumnIndex, visibleYear, visibleMonths]);

  const handleCycleReveal = useCallback((monthKey: string | null) => {
    setRevealedCycleKey(monthKey);
  }, []);

  const handleYearStep = useCallback(
    (direction: 'left' | 'right') => {
      setVisibleYearIndex((prev) => {
        const delta = direction === 'left' ? -1 : 1;
        const next = prev + delta;
        if (next < 0 || next >= yearList.length) return prev;
        return next;
      });
      requestAnimationFrame(() => {
        scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      });
    },
    [yearList.length]
  );

  const handleScrollerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (visibleYearIndex > 0) handleYearStep('left');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (visibleYearIndex < yearList.length - 1) handleYearStep('right');
      }
      if (event.key === 'Home') {
        event.preventDefault();
        scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      }
      if (event.key === 'End') {
        event.preventDefault();
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        scroller.scrollTo({ left: max, behavior: 'smooth' });
      }
    },
    [handleYearStep, visibleYearIndex, yearList.length]
  );

  const canScrollLeft = visibleYearIndex > 0;
  const canScrollRight = yearList.length > 0 && visibleYearIndex < yearList.length - 1;

  const virtualizedPhases = phaseSequence;
  const isInitialLoading = isCalendarLoading && visibleMonths.length === 0;
  const skeletonCount = useMemo(
    () => Math.max(Math.ceil(layout.visibleColumns * 2) + 4, 12),
    [layout.visibleColumns]
  );

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

  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col items-center py-10 sm:py-12 lg:py-14">
        <LuminousTrail />
        <CalendarStatus isLoading={isCalendarLoading} error={calendarError} onRetry={handleRetry} />

        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <CelestialObject
            type="sol"
            size={isCompactLayout ? 'md' : 'lg'}
            interactive
            onClick={(e) =>
              navigateWithFocus?.('planetCardBelowSun', {
                event: e,
                type: 'sol',
                size: 'lg',
              })
            }
            className="mb-4 sm:mb-5 lg:mb-4"
            floatOffset={-3}
          />

          <div className="relative w-full max-w-5xl px-3 sm:px-4">
            {highlightTarget && highlightedMoonInfo && (
              <HighlightBanner
                info={highlightedMoonInfo}
                onClick={() => focusOnTarget(highlightTarget)}
              />
            )}

            <MoonCarousel
              scrollerRef={scrollerRef}
              scrollerMaxWidth={scrollerMaxWidth}
              onKeyDown={handleScrollerKeyDown}
              layoutPadding={layout.padding}
              tileWidth={layout.tileWidth}
              gap={layout.gap}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              onScrollLeft={() => handleYearStep('left')}
              onScrollRight={() => handleYearStep('right')}
              onRetry={handleRetry}
              isInitialLoading={isInitialLoading}
              monthEntries={visibleMonths}
              calendarError={calendarError}
              skeletonCount={skeletonCount}
              virtualizedPhases={virtualizedPhases}
              highlightTarget={highlightTarget}
              onMoonClick={handleMoonClick}
              revealedCycleKey={revealedCycleKey}
              onCycleReveal={handleCycleReveal}
            />
          </div>
        </div>

        <div className="mt-auto flex w-full justify-center pt-4 pb-3 sm:pt-5 sm:pb-4 lg:pt-3 lg:pb-3">
          <CelestialObject
            type="planeta"
            size={isCompactLayout ? 'md' : 'lg'}
            interactive
            onClick={(e) =>
              navigateWithFocus?.('planetCardStandalone', {
                event: e,
                type: 'planeta',
                size: 'lg',
              })
            }
            className="mb-2"
            floatOffset={2}
          />
        </div>
      </div>

      <CosmosChatModal
        isOpen={isModalOpen}
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
