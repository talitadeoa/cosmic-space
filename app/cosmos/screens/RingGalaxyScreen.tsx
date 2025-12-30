'use client';

import React from 'react';
import RingGalaxyExperience from '@/app/universo/galaxia/RingGalaxyExperience';
import type { ScreenProps } from '../types';

const RingGalaxyScreen: React.FC<ScreenProps> = ({ navigateTo, navigateWithFocus }) => {
  return (
    <RingGalaxyExperience
      onNavigateToColumn={() => navigateTo('columnSolLuaPlaneta')}
      onNavigateToLuaInsights={(moon) =>
        navigateWithFocus('luaList', {
          type: moon,
          size: 'sm',
        })
      }
    />
  );
};

export default RingGalaxyScreen;
