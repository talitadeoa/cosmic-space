'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import { YearProvider, useYear } from '@/app/cosmos/context/YearContext';
import SolOrbitExperience from './SolOrbitExperience';
import GalaxySunsExperience from './GalaxySunsExperience';

type SolScreen = 'solorbit' | 'galaxysuns';

const SolRouteContent: React.FC<{
  screen: SolScreen;
  onSpaceClick: () => void;
  onSunSelect: () => void;
  onBackgroundClick: () => void;
}> = ({ screen, onSpaceClick, onSunSelect, onBackgroundClick }) => {
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
          <GalaxySunsExperience
            onSunSelect={(year) => handleSunSelect(year)}
            onBackgroundClick={onBackgroundClick}
          />
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
            onBackgroundClick={handleBackgroundClick}
          />
        </SpacePageLayout>
      </YearProvider>
    </AuthGate>
  );
};

export default SolPage;
