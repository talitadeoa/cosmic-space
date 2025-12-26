import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import RingGalaxyExperience from './RingGalaxyExperience';

const GalaxiaPage = () => {
  return (
    <AuthGate>
      <SpacePageLayout allowBackNavigation>
        <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
          <div className="w-full max-w-5xl h-[70vh]">
            <RingGalaxyExperience />
          </div>
        </div>
      </SpacePageLayout>
    </AuthGate>
  );
};

export default GalaxiaPage;
