'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useYear } from '@/app/cosmos/context/YearContext';
import SolOrbitExperience from '../visuals/SolOrbitExperience';
import GalaxySunsExperience from '../visuals/GalaxySunsExperience';

type SolScreenType = 'solorbit' | 'galaxysuns';

/**
 * SolScreen - Gerencia a lógica e renderização das duas telas Sol
 * - 'solorbit': Visualização da órbita solar
 * - 'galaxysuns': Experiência de seleção de sóis/anos
 */
const SolScreen: React.FC = () => {
  const [screen, setScreen] = useState<SolScreenType>('solorbit');
  const router = useRouter();
  const { setSelectedYear } = useYear();

  const handleSunSelect = (year: number) => {
    setSelectedYear(year);
    setScreen('solorbit');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      {screen === 'solorbit' ? (
        <section className="mx-auto w-full max-w-5xl">
          <SolOrbitExperience 
            onOrbitClick={() => setScreen('galaxysuns')} 
            onOutsideClick={() => router.push('/cosmos/home')} 
          />
        </section>
      ) : (
        <section className="mx-auto w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
          <GalaxySunsExperience onSunSelect={handleSunSelect} />
        </section>
      )}
    </div>
  );
};

export default SolScreen;
