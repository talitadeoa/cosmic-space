'use client';

import React, { useMemo } from 'react';
import GalaxyBackgroundLayer from './layers/GalaxyBackgroundLayer';
import GalaxyMetaLayer from './layers/GalaxyMetaLayer';
import GalaxyStageLayer from './layers/GalaxyStageLayer';
import { useGalaxySunsSync } from '@/hooks/useGalaxySunsSync';
import type { YearSun } from './components/GalaxySunsStage';

const GalaxySunsExperience: React.FC<{
  onSunSelect?: (year: number, event?: React.MouseEvent<HTMLDivElement>) => void;
  onGalaxyCoreClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ onSunSelect, onGalaxyCoreClick }) => {
  const currentYear = new Date().getFullYear();
  const { data: moonData, isLoading } = useGalaxySunsSync();

  const yearSuns = useMemo<YearSun[]>(() => {
    return [
      { id: 'past', label: 'Ano', year: currentYear - 1, orbitIndex: 0 },
      { id: 'present', label: 'Ano', year: currentYear, orbitIndex: 1 },
      { id: 'next1', label: 'Ano', year: currentYear + 1, orbitIndex: 2 },
      { id: 'next2', label: 'Ano', year: currentYear + 2, orbitIndex: 3 },
    ];
  }, [currentYear]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-3 py-5 shadow-2xl shadow-indigo-900/30 sm:px-6">
      <GalaxyBackgroundLayer />
      <GalaxyMetaLayer isLoading={isLoading} />
      <GalaxyStageLayer
        yearSuns={yearSuns}
        moonData={moonData}
        onSunClick={onSunSelect}
        onGalaxyCoreClick={onGalaxyCoreClick}
      />
    </div>
  );
};

export default GalaxySunsExperience;
