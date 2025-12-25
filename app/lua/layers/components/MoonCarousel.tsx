import React from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import type { HighlightTarget, MonthEntry } from '@/app/cosmos/utils/luaList';
import { ANIMATION_CONFIG } from '@/app/cosmos/utils/luaList';
import ArrowButton from './ArrowButton';
import EmptyState from './EmptyState';
import MoonRow from './MoonRow';
import MoonRowSkeleton from './MoonRowSkeleton';

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
  virtualizedMonths: MonthEntry[];
  highlightTarget: HighlightTarget | null;
  virtualOffsetPx: number;
  onMoonClick: (month: MonthEntry, phase: MoonPhase) => void;
  diagonalStep: number;
  topBaseOffset: number;
  bottomBaseOffset: number;
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
  virtualizedMonths,
  highlightTarget,
  virtualOffsetPx,
  onMoonClick,
  diagonalStep,
  topBaseOffset,
  bottomBaseOffset,
}) => (
  <div
    ref={scrollerRef}
    className="group relative w-full overflow-x-auto overflow-y-visible rounded-3xl py-6 transition-[max-width] duration-200"
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
    {!isInitialLoading && monthEntries.length === 0 && !calendarError && (
      <EmptyState onRetry={onRetry} />
    )}

    {!isInitialLoading && monthEntries.length > 0 && (
      <div className="flex min-w-max flex-col items-center gap-10" style={{ minWidth: trackWidth }}>
        <MoonRow
          phase="luaNova"
          direction="up"
          months={virtualizedMonths}
          highlightTarget={highlightTarget}
          trackWidth={trackWidth}
          virtualOffsetPx={virtualOffsetPx}
          onMoonClick={onMoonClick}
          tileWidth={tileWidth}
          gap={gap}
          diagonalStep={diagonalStep}
          baseYOffset={topBaseOffset}
        />

        <motion.div
          className="h-0.5 w-full bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
          style={{ minWidth: trackWidth, marginLeft: virtualOffsetPx }}
          animate={{ x: [-10, 10, -10] }}
          transition={ANIMATION_CONFIG.float}
        />

        <MoonRow
          phase="luaCheia"
          direction="down"
          months={virtualizedMonths}
          highlightTarget={highlightTarget}
          trackWidth={trackWidth}
          virtualOffsetPx={virtualOffsetPx}
          onMoonClick={onMoonClick}
          tileWidth={tileWidth}
          gap={gap}
          diagonalStep={diagonalStep}
          baseYOffset={bottomBaseOffset}
        />
      </div>
    )}
  </div>
);

export default MoonCarousel;
