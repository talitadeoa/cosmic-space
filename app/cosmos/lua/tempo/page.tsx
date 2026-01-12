'use client';

import React from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LunarTimeScrubber from '../components/LunarTimeScrubber';
import LuaCycleMenu from '../components/LuaCycleMenu';

const LuaTempoPage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/cosmos/lua/tempo" />
      </div>
      <LunarTimeScrubber />
    </SpacePageLayout>
  );
};

export default LuaTempoPage;
