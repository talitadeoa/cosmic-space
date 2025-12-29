import React, { useMemo, useRef } from 'react';
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
  virtualizedPhases: PhaseItem[];
  highlightTarget: HighlightTarget | null;
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
  virtualizedPhases,
  highlightTarget,
  onMoonClick,
  revealedCycleKey,
  onCycleReveal,
}) => {
  const tileSpan = tileWidth + gap;
  const orbitRadius = Math.max(48, Math.round(tileWidth * 0.55));
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const cycleAnchors = useMemo(
    () => {
      const seen = new Set<string>();
      let newMoonIndex = 0;
      return virtualizedPhases.reduce<{ month: MonthEntry; localIndex: number }[]>(
        (acc, item, idx) => {
          const key = buildMonthKey(item.month);
          if (seen.has(key)) {
            if (item.phase === 'luaNova') newMoonIndex++;
            return acc;
          }
          seen.add(key);
          // Usar o índice da lua nova como referência para o posicionamento
          if (item.phase === 'luaNova') {
            acc.push({ month: item.month, localIndex: newMoonIndex });
          }
          if (item.phase === 'luaNova') newMoonIndex++;
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
      className="group relative w-full min-h-[20rem] overflow-hidden rounded-3xl py-8 sm:min-h-[24rem] sm:py-12 lg:min-h-[30rem] lg:py-16 transition-[max-width] duration-200"
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        swipeStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!swipeStartRef.current) return;
        const deltaX = event.clientX - swipeStartRef.current.x;
        const deltaY = event.clientY - swipeStartRef.current.y;
        swipeStartRef.current = null;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
        if (deltaX > 0 && canScrollLeft) onScrollLeft();
        if (deltaX < 0 && canScrollRight) onScrollRight();
      }}
      onPointerCancel={() => {
        swipeStartRef.current = null;
      }}
      tabIndex={0}
      aria-label="Carrossel de luas"
      style={{
        maxWidth: scrollerMaxWidth,
        paddingLeft: layoutPadding,
        paddingRight: layoutPadding,
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        alignItems: 'center',
      }}
    >
    {isInitialLoading && (
      <div className="flex items-center gap-4">
        <ArrowButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={onScrollLeft}
          label="Ver luas anteriores"
          placement="inline"
        />
        <MoonRowSkeleton count={skeletonCount} tileWidth={tileWidth} gap={gap} />
        <ArrowButton
          direction="right"
          disabled={!canScrollRight}
          onClick={onScrollRight}
          label="Ver próximas luas"
          placement="inline"
        />
      </div>
    )}

    {!isInitialLoading && monthEntries.length === 0 && !calendarError && (
      <EmptyState onRetry={onRetry} />
    )}

      {!isInitialLoading && monthEntries.length > 0 && (
        <div className="flex items-center gap-4">
          <ArrowButton
            direction="left"
            disabled={!canScrollLeft}
            onClick={onScrollLeft}
            label="Ver luas anteriores"
            placement="inline"
          />
          <div className="relative flex items-center">
            <HiddenPhasesBridge
              anchors={cycleAnchors}
              tileWidth={tileWidth}
              gap={gap}
              revealedCycleKey={revealedCycleKey}
              orbitRadius={orbitRadius}
            />

            <div className="relative z-10">
              <MoonRow
                items={virtualizedPhases}
                highlightTarget={highlightTarget}
                onMoonClick={onMoonClick}
                tileWidth={tileWidth}
                gap={gap}
                orbitRadius={orbitRadius}
                revealedCycleKey={revealedCycleKey}
                onCycleReveal={onCycleReveal}
              />
            </div>
          </div>
          <ArrowButton
            direction="right"
            disabled={!canScrollRight}
            onClick={onScrollRight}
            label="Ver próximas luas"
            placement="inline"
          />
        </div>
      )}
    </div>
  );
};

export default MoonCarousel;
