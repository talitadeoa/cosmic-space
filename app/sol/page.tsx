'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import { YearProvider, useYear } from '@/app/cosmos/context/YearContext';
import SolOrbitExperience from './visuals/SolOrbitExperience';
import GalaxySunsExperience from './visuals/GalaxySunsExperience';

type SolScreen = 'solorbit' | 'galaxysuns';

const SolRouteContent: React.FC<{
  screen: SolScreen;
  onSpaceClick: () => void;
  onSunSelect: () => void;
}> = ({ screen, onSpaceClick, onSunSelect }) => {
  const { setSelectedYear } = useYear();
  const handleSunSelect = (year: number) => {
    setSelectedYear(year);
    onSunSelect();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-10">
      {screen === 'solorbit' ? (
        <section className="mx-auto w-full max-w-5xl">
          <SolOrbitExperience onSpaceClick={onSpaceClick} />
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
    router.push('/home');
  };

  return (
    <AuthGate>
      <YearProvider>
        <SpacePageLayout onBackgroundClick={handleBackgroundClick}>
          <SolRouteContent
            screen={screen}
            onSpaceClick={() => setScreen('galaxysuns')}
            onSunSelect={() => setScreen('solorbit')}
          />
        </SpacePageLayout>
      </YearProvider>
    </AuthGate>
  );
};

export default SolPage;
