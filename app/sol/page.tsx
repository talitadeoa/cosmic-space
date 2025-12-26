'use client';

import React, { useRef } from 'react';
import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import { YearProvider, useYear } from '@/app/cosmos/context/YearContext';
import SolOrbitExperience from './SolOrbitExperience';
import GalaxySunsExperience from './GalaxySunsExperience';

const SolRouteContent: React.FC = () => {
  const { setSelectedYear } = useYear();
  const orbitRef = useRef<HTMLDivElement | null>(null);

  const handleSunSelect = (year: number) => {
    setSelectedYear(year);
    orbitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <section ref={orbitRef} className="mx-auto w-full max-w-5xl">
        <SolOrbitExperience />
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <GalaxySunsExperience onSunSelect={(year) => handleSunSelect(year)} />
      </section>
    </div>
  );
};

const SolPage = () => {
  return (
    <AuthGate>
      <YearProvider>
        <SpacePageLayout allowBackNavigation>
          <SolRouteContent />
        </SpacePageLayout>
      </YearProvider>
    </AuthGate>
  );
};

export default SolPage;
