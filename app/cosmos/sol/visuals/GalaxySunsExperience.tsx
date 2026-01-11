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
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[28px] px-3 py-5 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(180deg, rgba(5, 5, 20, 1) 0%, rgba(10, 8, 30, 1) 50%, rgba(5, 5, 20, 1) 100%)',
      }}
    >
      {/* Camada de fundo com estrelas, nebulosas e partículas */}
      <GalaxyBackgroundLayer />
      
      {/* Efeito de vinheta nas bordas */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, 
              transparent 0%, 
              transparent 60%, 
              rgba(0, 0, 10, 0.4) 80%, 
              rgba(0, 0, 10, 0.7) 100%
            )
          `,
        }}
      />

      {/* Brilho de borda sutil */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          boxShadow: `
            inset 0 0 60px rgba(99, 102, 241, 0.08),
            inset 0 0 120px rgba(14, 165, 233, 0.05)
          `,
        }}
      />
      
      {/* Camada de metadados (título, loading) */}
      <GalaxyMetaLayer isLoading={isLoading} />
      
      {/* Camada principal com órbitas e sóis */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      >
        <GalaxyStageLayer
          yearSuns={yearSuns}
          moonData={moonData}
          onSunClick={onSunSelect}
          onGalaxyCoreClick={onGalaxyCoreClick}
        />
      </motion.div>

      {/* Instrução sutil */}
      <motion.p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[0.6rem] tracking-wider text-indigo-200/40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        Toque nos sóis para explorar cada ano • Núcleo para visão geral
      </motion.p>
    </motion.div>
  );
};

export default GalaxySunsExperience;
