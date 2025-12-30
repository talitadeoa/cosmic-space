'use client';

import React from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { MoonPhase } from '@/app/cosmos/utils/todoStorage';

type MoonClusterProps = {
  activeDrop: MoonPhase | null;
  moonCounts: Record<MoonPhase, number>;
  isDraggingTodo: boolean;
  selectedPhase: MoonPhase | null;
  onMoonNavigate: (phase: MoonPhase, event: React.MouseEvent<HTMLDivElement>) => void;
  onMoonFilter: (phase: MoonPhase | null) => void;
  onDrop: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragOver: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragLeave: () => void;
};

const MOON_TYPES = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as const;

export const MoonCluster: React.FC<MoonClusterProps> = ({
  activeDrop,
  moonCounts,
  isDraggingTodo,
  selectedPhase,
  onMoonNavigate: _onMoonNavigate,
  onMoonFilter,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:flex-col lg:items-center">
        {Array.from({ length: MOON_TYPES.length }).map((_, index) => {
          const moonType = MOON_TYPES[index % MOON_TYPES.length];
          const isActiveDrop = activeDrop === moonType;
          const isSelectedPhase = selectedPhase === moonType;
          const badgeCount = moonCounts[moonType] ?? 0;
          const floatOffset = index * 1.5 - 3;

          return (
            <div
              key={`moon-${index}`}
              data-drop-target="moon"
              data-phase={moonType}
              className="relative flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-110"
            >
              {badgeCount > 0 && (
                <span className="absolute -right-3 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 px-2 text-[0.65rem] font-semibold text-white shadow-md">
                  {badgeCount}
                </span>
              )}
              <CelestialObject
                type={moonType}
                size="sm"
                interactive
                onClick={() => {
                  if (isDraggingTodo) return;
                  if (isSelectedPhase) {
                    onMoonFilter(null);
                  } else {
                    onMoonFilter(moonType);
                  }
                }}
                floatOffset={floatOffset}
                onDrop={onDrop(moonType)}
                onDragOver={onDragOver(moonType)}
                onDragLeave={onDragLeave}
                className={`transition-all duration-300 ${
                  isActiveDrop ? 'scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]' : ''
                } ${isSelectedPhase ? 'drop-shadow-[0_0_20px_rgba(129,140,248,0.9)]' : ''} group-hover:drop-shadow-[0_0_25px_rgba(129,140,248,0.8)]`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
