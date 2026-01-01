'use client';

import React from 'react';
import { SpacePageLayout } from '@/components/layouts';

export type PlanetaSceneProps = {
  children: React.ReactNode;
};

export const PlanetaScene: React.FC<PlanetaSceneProps> = ({ children }) => {
  return <SpacePageLayout allowBackNavigation>{children}</SpacePageLayout>;
};
