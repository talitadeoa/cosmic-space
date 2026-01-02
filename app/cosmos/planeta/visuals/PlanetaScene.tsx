'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';

export type PlanetaSceneProps = {
  children: React.ReactNode;
};

export const PlanetaScene: React.FC<PlanetaSceneProps> = ({ children }) => {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push('/cosmos/home')}>
      {children}
    </SpacePageLayout>
  );
};
