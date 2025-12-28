'use client';

import React from 'react';
import { YearProvider } from '@/app/cosmos/context/YearContext';
import { TemporalProvider } from './TemporalContext';

export type PlanetaProvidersProps = {
  children: React.ReactNode;
};

export const PlanetaProviders: React.FC<PlanetaProvidersProps> = ({ children }) => {
  return (
    <TemporalProvider>
      <YearProvider>{children}</YearProvider>
    </TemporalProvider>
  );
};
