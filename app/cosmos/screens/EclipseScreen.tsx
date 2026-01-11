'use client';

import React from 'react';
import EclipseProductivityView from '@/app/cosmos/eclipse/EclipseProductivityView';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';

const EclipseProductivityScreen: React.FC = () => {
  const { navigateWithFocus } = useUniverseNavigation();
  return <EclipseProductivityView navigateWithFocus={navigateWithFocus} />;
};

export default EclipseProductivityScreen;
