'use client';

import React, { useCallback, useRef } from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';

export type PlanetaSceneProps = {
  children: React.ReactNode;
};

export const PlanetaScene: React.FC<PlanetaSceneProps> = ({ children }) => {
  const { navigateToHome } = useBackToHome();
  const lastClickRef = useRef(0);

  const handleBackgroundClick = useCallback(() => {
    const now = Date.now();
    const doubleClickThreshold = 400;

    if (now - lastClickRef.current <= doubleClickThreshold) {
      lastClickRef.current = 0;
      navigateToHome();
      return;
    }

    lastClickRef.current = now;
  }, [navigateToHome]);

  return (
    <SpacePageLayout onBackgroundClick={handleBackgroundClick}>
      {children}
    </SpacePageLayout>
  );
};
