import AuthGate from '@/components/AuthGate';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';
import RingGalaxyExperience from './RingGalaxyExperience';

const GalaxiaPage = () => {
  return (
    <AuthGate>
      <div className="relative min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
        <SpaceBackground />

        <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-10">
          <div className="w-full max-w-5xl h-[70vh]">
            <RingGalaxyExperience />
          </div>
        </div>
      </div>
    </AuthGate>
  );
};

export default GalaxiaPage;
