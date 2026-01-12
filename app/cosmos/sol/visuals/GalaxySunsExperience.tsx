'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GalaxyBackgroundLayer from '../components/GalaxyBackgroundLayer';
import GalaxyMetaLayer from '../components/GalaxyMetaLayer';
import GalaxyStageLayer from '../components/GalaxyStageLayer';
import { useGalaxySunsSync } from '@/hooks/useGalaxySunsSync';
import type { YearSun } from '../components/GalaxySunsStage';

const GalaxySunsExperience: React.FC<{
  onSunSelect?: (year: number, event?: React.MouseEvent<HTMLDivElement>) => void;
  onGalaxyCoreClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ onSunSelect, onGalaxyCoreClick }) => {
  const currentYear = new Date().getFullYear();
  const { data: moonData, isLoading } = useGalaxySunsSync();

  const yearSuns = useMemo<YearSun[]>(() => {
    return [
      { id: 'past', label: 'Ano', year: currentYear, orbitIndex: 0 },
      { id: 'present', label: 'Ano', year: currentYear + 1, orbitIndex: 1 },
      { id: 'next1', label: 'Ano', year: currentYear + 2, orbitIndex: 2 },
      { id: 'next2', label: 'Ano', year: currentYear + 3, orbitIndex: 3 },
    ];
  }, [currentYear]);

  return (
    <motion.div 
      className="relative flex h-full w-full flex-col items-center justify-center overflow-visible px-2 py-4 sm:px-6 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Camada de fundo com galáxia 3D */}
      <GalaxyBackgroundLayer />
      
      {/* Camada de metadados (título, loading) */}
      <GalaxyMetaLayer isLoading={isLoading} />
      
      {/* Camada principal com órbitas e sóis */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <GalaxyStageLayer
          yearSuns={yearSuns}
          moonData={moonData}
          onSunClick={onSunSelect}
          onGalaxyCoreClick={onGalaxyCoreClick}
        />
      </motion.div>
    </motion.div>
  );
};

export default GalaxySunsExperience;
