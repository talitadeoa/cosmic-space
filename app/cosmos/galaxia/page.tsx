'use client';

import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import RingGalaxyExperience from './RingGalaxyExperience';

const GalaxiaPage = () => {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push('/cosmos')}>
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
