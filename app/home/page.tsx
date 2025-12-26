'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';
import HomeScreen from '@/app/cosmos/screens/HomeScreen';
import type { ScreenId, ScreenProps } from '@/app/cosmos/types';

const SCREEN_ROUTE_MAP: Partial<Record<ScreenId, string>> = {
  home: '/home',
  solOrbit: '/sol',
  galaxySuns: '/sol',
  luaList: '/lua',
  ringGalaxy: '/galaxia',
  sidePlanetCard: '/planeta',
  planetCardBelowSun: '/planeta',
  planetCardStandalone: '/planeta',
  columnSolLuaPlaneta: '/planeta',
  eclipseProductivity: '/eclipse',
};

const getRouteForScreen = (screen: ScreenId) => SCREEN_ROUTE_MAP[screen] ?? '/cosmos';

const StandaloneHomePage = () => {
  const router = useRouter();

  const navigateToRoute = useCallback<ScreenProps['navigateTo']>(
    (next) => {
      router.push(getRouteForScreen(next));
    },
    [router]
  );

  const navigateWithFocus = useCallback<ScreenProps['navigateWithFocus']>(
    (next, _params) => {
      navigateToRoute(next);
    },
    [navigateToRoute]
  );

  return (
    <AuthGate>
      <main className="relative min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
        <SpaceBackground />

        <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-10">
          <div className="h-[70vh] w-full max-w-5xl">
            <HomeScreen navigateTo={navigateToRoute} navigateWithFocus={navigateWithFocus} />
          </div>
        </div>
      </main>
    </AuthGate>
  );
};

export default StandaloneHomePage;
