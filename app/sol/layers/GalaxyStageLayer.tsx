'use client';

import React, { useMemo } from 'react';
import GalaxySunsStage, { type YearSun } from '../components/GalaxySunsStage';
import type { YearMoonData } from '@/hooks/useGalaxySunsSync';

const BASE_ORBIT_SIZE = 240;
const ORBIT_STEP = 78;

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
  const orbitSizes = useMemo(
    () => Array.from({ length: 4 }, (_, idx) => BASE_ORBIT_SIZE + idx * ORBIT_STEP),
    []
  );

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
