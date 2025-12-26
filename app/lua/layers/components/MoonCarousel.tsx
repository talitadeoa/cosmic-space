import React, { useMemo } from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import { buildMonthKey, type HighlightTarget, type MonthEntry } from '@/app/cosmos/utils/luaList';
import ArrowButton from './ArrowButton';
import EmptyState from './EmptyState';
import MoonRow from './MoonRow';
import MoonRowSkeleton from './MoonRowSkeleton';
import HiddenPhasesBridge from './HiddenPhasesBridge';

type PhaseItem = {
  month: MonthEntry;
  phase: MoonPhase;
};

type MoonCarouselProps = {
  scrollerRef: React.RefObject<HTMLDivElement>;
  scrollerMaxWidth: number;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  layoutPadding: number;
  tileWidth: number;
  gap: number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onRetry: () => void;
  isInitialLoading: boolean;
  monthEntries: MonthEntry[];
  calendarError: string | null;
  skeletonCount: number;
  trackWidth: number;
  virtualizedPhases: PhaseItem[];
  highlightTarget: HighlightTarget | null;
  virtualOffsetPx: number;
  onMoonClick: (month: MonthEntry, phase: MoonPhase) => void;
  revealedCycleKey: string | null;
  onCycleReveal: (monthKey: string | null) => void;
};

const MoonCarousel: React.FC<MoonCarouselProps> = ({
  scrollerRef,
  scrollerMaxWidth,
  onKeyDown,
  layoutPadding,
  tileWidth,
  gap,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  onRetry,
  isInitialLoading,
  monthEntries,
  calendarError,
  skeletonCount,
  trackWidth,
  virtualizedPhases,
  highlightTarget,
  virtualOffsetPx,
  onMoonClick,
  revealedCycleKey,
  onCycleReveal,
}) => {
  const tileSpan = tileWidth + gap;
  const orbitRadius = Math.max(48, Math.round(tileWidth * 0.55));
  const cycleAnchors = useMemo(
    () => {
      const seen = new Set<string>();
      return virtualizedPhases.reduce<{ month: MonthEntry; localIndex: number }[]>(
        (acc, item, idx) => {
          const key = buildMonthKey(item.month);
          if (seen.has(key)) return acc;
          seen.add(key);
          acc.push({ month: item.month, localIndex: idx });
          return acc;
        },
        []
      );
    },
    [virtualizedPhases]
  );

  return (
    <div
    ref={scrollerRef}
    className="group relative w-full min-h-[24rem] overflow-x-auto overflow-y-visible rounded-3xl py-12 sm:min-h-[26rem] sm:py-14 lg:min-h-[30rem] lg:py-16 transition-[max-width] duration-200"
    onKeyDown={onKeyDown}
    tabIndex={0}
    aria-label="Carrossel de luas"
    style={{
      maxWidth: scrollerMaxWidth,
      paddingLeft: layoutPadding,
      paddingRight: layoutPadding,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}
  >
    <ArrowButton
      direction="left"
      disabled={!canScrollLeft}
      onClick={onScrollLeft}
      label="Ver luas anteriores"
    />
    <ArrowButton
      direction="right"
      disabled={!canScrollRight}
      onClick={onScrollRight}
      label="Ver próximas luas"
    />

    {isInitialLoading && (
      <MoonRowSkeleton
        count={skeletonCount}
        trackWidth={trackWidth}
        tileWidth={tileWidth}
        gap={gap}
      />
    )}

    {!isInitialLoading && monthEntries.length === 0 && !calendarError && (
      <EmptyState onRetry={onRetry} />
    )}

      {!isInitialLoading && monthEntries.length > 0 && (
        <div className="relative flex min-w-max items-center" style={{ minWidth: trackWidth }}>
          <HiddenPhasesBridge
            anchors={cycleAnchors}
            tileWidth={tileWidth}
            gap={gap}
            virtualOffsetPx={virtualOffsetPx}
            trackWidth={trackWidth}
            revealedCycleKey={revealedCycleKey}
            orbitRadius={orbitRadius}
          />

          <MoonRow
            items={virtualizedPhases}
            highlightTarget={highlightTarget}
            trackWidth={trackWidth}
            virtualOffsetPx={virtualOffsetPx}
            onMoonClick={onMoonClick}
            tileWidth={tileWidth}
            gap={gap}
            orbitRadius={orbitRadius}
            revealedCycleKey={revealedCycleKey}
            onCycleReveal={onCycleReveal}
          />
        </div>
      )}
    </div>
  );
};

export default MoonCarousel;
