'use client';

import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import RingGalaxyExperience from './RingGalaxyExperience';

const GalaxiaPage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="flex min-h-[100dvh] items-center justify-center px-3 py-6 sm:px-5 sm:py-10 safe-area-inset">
        <div className="w-full max-w-5xl h-[65vh] sm:h-[70vh]">
          <RingGalaxyExperience />
        </div>
      </div>
      <CosmosRouteHelper routeKey="galaxia" position="bottom-right" />
    </SpacePageLayout>
  );
};

export default GalaxiaPage;
