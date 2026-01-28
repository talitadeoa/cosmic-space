'use client';

import React, { useCallback, memo } from 'react';
import Image from 'next/image';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { MoonPhase } from '@/client/storage';

type MoonZodiacInfo = {
  sign?: string;
  emoji?: string;
};

const ZODIAC_SIGN_TO_IMAGE: Record<string, string> = {
  'Áries': 'aries.png',
  'Touro': 'taurus.png',
  'Gêmeos': 'gemini.png',
  'Câncer': 'cancer.png',
  'Leão': 'leo.png',
  'Virgem': 'virgo.png',
  'Libra': 'libra.png',
  'Escorpião': 'scorpio.png',
  'Sagitário': 'sagittarius.png',
  'Capricórnio': 'capricornus.png',
  'Aquário': 'aquarius.png',
  'Peixes': 'pisces.png',
};

type MoonClusterProps = {
  activeDrop: MoonPhase | null;
  moonCounts: Record<MoonPhase, number>;
  isDraggingTodo: boolean;
  selectedPhase: MoonPhase | null;
  currentPhase?: MoonPhase | null;
  highlightPhases?: MoonPhase[];
  zodiacByPhase?: Partial<Record<MoonPhase, MoonZodiacInfo>>;
  onMoonNavigate: (phase: MoonPhase, event: React.MouseEvent<HTMLDivElement>) => void;
  onMoonFilter: (phase: MoonPhase | null) => void;
  onDrop: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragOver: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragLeave: () => void;
};

const MOON_TYPES = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as const;

export const MoonCluster: React.FC<MoonClusterProps> = memo(function MoonCluster({
  activeDrop,
  moonCounts,
  isDraggingTodo,
  selectedPhase,
  currentPhase,
  highlightPhases,
  zodiacByPhase,
  onMoonNavigate: _onMoonNavigate,
  onMoonFilter,
  onDrop,
  onDragOver,
  onDragLeave,
}) {
  // Handler estável para click nas luas
  const handleMoonClick = useCallback(
    (moonType: MoonPhase, isSelected: boolean) => {
      if (isDraggingTodo) return;
      onMoonFilter(isSelected ? null : moonType);
    },
    [isDraggingTodo, onMoonFilter]
  );

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-5 lg:flex-col lg:items-center lg:gap-6">
        {Array.from({ length: MOON_TYPES.length }).map((_, index) => {
          const moonType = MOON_TYPES[index % MOON_TYPES.length];
          const isActiveDrop = activeDrop === moonType;
          const isSelectedPhase = selectedPhase === moonType;
          const isCurrentPhase = currentPhase === moonType;
          const isHighlighted = isCurrentPhase || highlightPhases?.includes(moonType);
          const zodiacInfo = zodiacByPhase?.[moonType];
          const badgeCount = moonCounts[moonType] ?? 0;
          const floatOffset = index * 1.5 - 3;

          return (
            <div
              key={`moon-${index}`}
              data-drop-target="moon"
              data-phase={moonType}
              className="relative flex flex-col items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-105 touch-manipulation"
            >
              <div className="relative">
                {badgeCount > 0 && (
                  <span className="absolute -right-2 sm:-right-3 top-1/2 flex h-5 min-w-5 sm:h-6 sm:min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 px-1.5 sm:px-2 text-[0.6rem] sm:text-[0.65rem] font-semibold text-white shadow-md">
                    {badgeCount}
                  </span>
                )}
                <CelestialObject
                  type={moonType}
                  size="sm"
                  interactive
                  onClick={() => handleMoonClick(moonType, isSelectedPhase)}
                  floatOffset={floatOffset}
                  onDrop={onDrop(moonType)}
                  onDragOver={onDragOver(moonType)}
                  onDragLeave={onDragLeave}
                  className={`transition-all duration-300 ${
                    isActiveDrop ? 'scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]' : ''
                  } ${isSelectedPhase ? 'drop-shadow-[0_0_20px_rgba(129,140,248,0.9)]' : ''} ${
                    isHighlighted
                      ? 'ring-2 ring-amber-200/80 shadow-[0_0_22px_rgba(251,191,36,0.6)]'
                      : ''
                  } ${
                    isCurrentPhase ? 'animate-pulse' : ''
                  } group-hover:drop-shadow-[0_0_25px_rgba(129,140,248,0.8)]`}
                />
                {zodiacInfo && (zodiacInfo.emoji || zodiacInfo.sign) && (
                  <Image
                    src={`/signs/${ZODIAC_SIGN_TO_IMAGE[zodiacInfo.sign || ''] || 'aries.png'}`}
                    alt={zodiacInfo.sign || 'Zodiac sign'}
                    width={28}
                    height={28}
                    className="pointer-events-none absolute -right-7 -bottom-1 h-7 w-7 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
                    priority={false}
                  />
                )}
              </div>
              {zodiacInfo && (zodiacInfo.emoji || zodiacInfo.sign) && (
                zodiacInfo.sign && (
                  <span className="pointer-events-none mt-1 block text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-amber-100/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                    {zodiacInfo.sign}
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
