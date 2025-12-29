'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import { YearProvider, useYear } from '@/app/cosmos/context/YearContext';
import SolOrbitExperience from './visuals/SolOrbitExperience';
import GalaxySunsExperience from './visuals/GalaxySunsExperience';

type SolScreen = 'solorbit' | 'galaxysuns';

const SolRouteContent: React.FC<{
  screen: SolScreen;
  onOrbitClick: () => void;
  onOutsideClick: () => void;
  onSunSelect: () => void;
}> = ({ screen, onOrbitClick, onOutsideClick, onSunSelect }) => {
  const { setSelectedYear } = useYear();
  const handleSunSelect = (year: number) => {
    setSelectedYear(year);
    onSunSelect();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-10">
      {screen === 'solorbit' ? (
        <section className="mx-auto w-full max-w-5xl">
          <SolOrbitExperience onOrbitClick={onOrbitClick} onOutsideClick={onOutsideClick} />
        </section>
      ) : (
        <section
          className="mx-auto w-full max-w-5xl"
          onClick={(event) => event.stopPropagation()}
        >
          <GalaxySunsExperience onSunSelect={(year) => handleSunSelect(year)} />
        </section>
      )}
    </div>
  );
};

const SolPage = () => {
  const [screen, setScreen] = useState<SolScreen>('solorbit');
  const router = useRouter();

  const handleBackgroundClick = () => {
    router.push('/universo/home');
  };

  return (
    <YearProvider>
      <SpacePageLayout onBackgroundClick={handleBackgroundClick}>
        <SolRouteContent
          screen={screen}
          onOrbitClick={() => setScreen('galaxysuns')}
          onOutsideClick={() => router.push('/universo/home')}
          onSunSelect={() => setScreen('solorbit')}
        />
      </SpacePageLayout>
    </YearProvider>
  );
};

export default SolPage;
