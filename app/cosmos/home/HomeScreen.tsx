'use client';

import React, { useMemo } from 'react';
import { CelestialObject } from '../components/CelestialObject';
import MoonPhaseDisplay from '../lua/components/MoonPhaseDisplay';
import { useLunarPhaseUSNO } from '@/hooks/useLunarPhaseUSNO';
import type { CelestialSize, CelestialType, ScreenId, ScreenProps } from '../types';

type HomeCelestial = {
  id: string;
  type: CelestialType;
  target: ScreenId;
  floatOffset?: number;
  row: number;
  col: number;
};

const HOME_OBJECT_SIZE: CelestialSize = 'md';

// Ajuste row/col aqui para reposicionar rapidamente cada objeto na grade.
const HOME_OBJECTS: HomeCelestial[] = [
  { id: 'lua', type: 'lua', target: 'luaList', floatOffset: -2, row: 1, col: 1 },
  {
    id: 'eclipse',
    type: 'eclipse',
    target: 'eclipseProductivity',
    floatOffset: -3,
    row: 1,
    col: 2,
  },
  {
    id: 'galaxiaNorte',
    type: 'galaxia',
    target: 'ringGalaxy',
    floatOffset: 1,
    row: 1,
    col: 3,
  },
  {
    id: 'galaxiaSul',
    type: 'galaxia',
    target: 'galaxySuns',
    floatOffset: 2,
    row: 2,
    col: 1,
  },
  { id: 'sol', type: 'sol', target: 'solOrbit', floatOffset: 0, row: 2, col: 2 },
  {
    id: 'planeta',
    type: 'planeta',
    target: 'sidePlanetCard',
    floatOffset: -1,
    row: 2,
    col: 3,
  },
];

type HomeScreenProps = Pick<ScreenProps, 'navigateTo' | 'navigateWithFocus'>;

const getMoonTypeByPhase = (phase: string | undefined): CelestialType => {
  if (!phase) return 'lua';
  const normalized = phase.toLowerCase();
  // Nomes em inglês da API USNO
  if (normalized.includes('new moon')) return 'luaNova';
  if (normalized.includes('waxing crescent')) return 'luaCrescente';
  if (normalized.includes('first quarter')) return 'QuartoCrescente';
  if (normalized.includes('waxing gibbous')) return 'luaGibosaCrescente';
  if (normalized.includes('full moon')) return 'luaCheia';
  if (normalized.includes('waning gibbous')) return 'luaGibosaMinguante';
  if (normalized.includes('last quarter')) return 'QuartoMinguante';
  if (normalized.includes('waning crescent')) return 'luaMinguante';
  return 'lua';
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateWithFocus }) => {
  const { phase } = useLunarPhaseUSNO(new Date());
  
  const moonType = useMemo(() => getMoonTypeByPhase(phase?.phase), [phase?.phase]);
  return (
    <div className="relative flex h-full w-full items-center justify-center px-4 sm:px-10">
      <MoonPhaseDisplay />

      <div className="grid h-full w-full max-w-5xl grid-cols-3 grid-rows-2 place-items-center gap-6 sm:gap-12">
        {HOME_OBJECTS.map(({ id, type, target, floatOffset, row, col }) => {
          // Use dynamic moon type if this is the moon object
          const celestialType = id === 'lua' ? moonType : type;
          
          return (
            <div
              key={id}
              style={{ gridColumn: col, gridRow: row }}
              className="flex items-center justify-center"
            >
              <CelestialObject
                type={celestialType}
                size={HOME_OBJECT_SIZE}
                interactive
                floatOffset={floatOffset}
                className="sm:scale-110"
                onClick={(event) =>
                  navigateWithFocus(target, { event, type: celestialType, size: HOME_OBJECT_SIZE })
                }
              />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] uppercase text-slate-300/60 px-2 text-center">
        -
      </div>
    </div>
  );
};

export default HomeScreen;
