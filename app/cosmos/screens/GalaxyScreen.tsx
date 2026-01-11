'use client';

import React from 'react';
import RingGalaxyExperience from '@/app/cosmos/galaxia/RingGalaxyExperience';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';

const RingGalaxyScreen: React.FC = () => {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();
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
