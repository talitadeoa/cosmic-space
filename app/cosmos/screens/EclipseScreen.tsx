'use client';

import React from 'react';
import EclipseProductivityView from '@/app/cosmos/eclipse/EclipseProductivityView';
import type { ScreenProps } from '../types';

const EclipseProductivityScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  return <EclipseProductivityView navigateWithFocus={navigateWithFocus} />;
};

export default EclipseProductivityScreen;
