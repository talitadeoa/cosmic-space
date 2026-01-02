'use client';

import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import RingGalaxyExperience from './RingGalaxyExperience';

const GalaxiaPage = () => {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push('/cosmos/home')}>
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl h-[70vh]">
          <RingGalaxyExperience />
        </div>
      </div>
    </SpacePageLayout>
  );
};

export default GalaxiaPage;
