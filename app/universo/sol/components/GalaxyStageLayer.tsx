'use client';

import React, { useEffect, useState } from 'react';
import GalaxySunsStage, { type YearSun } from './GalaxySunsStage';
import type { YearMoonData } from '@/hooks/useGalaxySunsSync';

const BASE_ORBIT_SIZE = 240;
const ORBIT_STEP = 78;
const DEFAULT_ORBIT_COUNT = 4;

const buildOrbitSizes = (viewportWidth: number, viewportHeight: number) => {
  const shortestSide = Math.min(viewportWidth, viewportHeight);
  const baseOrbit = Math.min(BASE_ORBIT_SIZE, Math.max(180, Math.round(shortestSide * 0.5)));
  const orbitStep = Math.min(ORBIT_STEP, Math.max(56, Math.round(shortestSide * 0.12)));

  return Array.from({ length: DEFAULT_ORBIT_COUNT }, (_, idx) => baseOrbit + idx * orbitStep);
};

type GalaxyStageLayerProps = {
  yearSuns: YearSun[];
  moonData: Record<number, YearMoonData>;
  onSunClick?: (year: number, event: React.MouseEvent<HTMLDivElement>) => void;
  onGalaxyCoreClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const GalaxyStageLayer: React.FC<GalaxyStageLayerProps> = ({
  yearSuns,
  moonData,
  onSunClick,
  onGalaxyCoreClick,
}) => {
  const [orbitSizes, setOrbitSizes] = useState<number[]>(() =>
    typeof window === 'undefined'
      ? Array.from({ length: DEFAULT_ORBIT_COUNT }, (_, idx) => BASE_ORBIT_SIZE + idx * ORBIT_STEP)
      : buildOrbitSizes(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const updateSizes = () => {
      setOrbitSizes(buildOrbitSizes(window.innerWidth, window.innerHeight));
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);

    return () => {
      window.removeEventListener('resize', updateSizes);
    };
  }, []);

  return (
    <GalaxySunsStage
      orbitSizes={orbitSizes}
      yearSuns={yearSuns}
      moonData={moonData}
      onSunClick={onSunClick}
      onGalaxyCoreClick={onGalaxyCoreClick}
    />
  );
};

export default GalaxyStageLayer;
