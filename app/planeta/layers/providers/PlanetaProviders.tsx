'use client';

import React from 'react';
import { YearProvider } from '@/app/cosmos/context/YearContext';

export type PlanetaProvidersProps = {
  children: React.ReactNode;
};

export const PlanetaProviders: React.FC<PlanetaProvidersProps> = ({ children }) => {
  return <YearProvider>{children}</YearProvider>;
};
