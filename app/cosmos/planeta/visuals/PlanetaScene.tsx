'use client';

import React from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';

export type PlanetaSceneProps = {
  children: React.ReactNode;
};

export const PlanetaScene: React.FC<PlanetaSceneProps> = ({ children }) => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      {children}
    </SpacePageLayout>
  );
};
