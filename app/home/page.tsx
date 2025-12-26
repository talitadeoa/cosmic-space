'use client';

import { useCallback, useRef, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import HomeScreen from '@/app/cosmos/screens/HomeScreen';
import type { ScreenId, ScreenProps, FocusState } from '@/app/cosmos/types';

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
  const [isPending, startTransition] = useTransition();
  const [focus, setFocus] = useState<FocusState | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout>();
  const prefetchedRef = useRef(new Set<string>());

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Prefetch todas as rotas possíveis ao montar para evitar delays
  useEffect(() => {
    const routes = Object.values(SCREEN_ROUTE_MAP).filter(Boolean);
    routes.forEach((route) => {
      if (route && !prefetchedRef.current.has(route)) {
        router.prefetch(route);
        prefetchedRef.current.add(route);
      }
    });
  }, [router]);

  const navigateToRoute = useCallback<ScreenProps['navigateTo']>(
    (next) => {
      const route = getRouteForScreen(next);
      startTransition(() => {
        router.push(route);
      });
    },
    [router]
  );

  const navigateWithFocus = useCallback<ScreenProps['navigateWithFocus']>(
    (next, params) => {
      const { event, type = 'sol', size = 'md' } = params;

      if (!event || typeof window === 'undefined') {
        navigateToRoute(next);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Prefetch da página de destino durante o zoom
      const route = getRouteForScreen(next);
      router.prefetch(route);

      setFocus({
        target: next,
        x,
        y,
        centerX,
        centerY,
        type,
        size,
      });

      focusTimeoutRef.current = setTimeout(() => {
        navigateToRoute(next);
        setFocus(null);
      }, 1000);
    },
    [navigateToRoute]
  );

  return (
    <AuthGate>
      <SpacePageLayout>
        <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
          <div className="h-[70vh] w-full max-w-5xl">
            <HomeScreen navigateTo={navigateToRoute} navigateWithFocus={navigateWithFocus} />
          </div>
        </div>

        <AnimatePresence>
          {focus && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.div
                className="relative"
                initial={{
                  x: focus.x - focus.centerX,
                  y: focus.y - focus.centerY,
                  scale: 0.4,
                  opacity: 1,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  scale: 3,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <CelestialObject
                  type={focus.type}
                  size={focus.size}
                  interactive={false}
                  pulseOnMount={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SpacePageLayout>
    </AuthGate>
  );
};

export default StandaloneHomePage;
