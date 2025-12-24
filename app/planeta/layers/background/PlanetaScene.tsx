'use client';

import React from 'react';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';

export type PlanetaSceneProps = {
  children: React.ReactNode;
};

export const PlanetaScene: React.FC<PlanetaSceneProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <SpaceBackground />
      {children}
    </div>
  );
};
