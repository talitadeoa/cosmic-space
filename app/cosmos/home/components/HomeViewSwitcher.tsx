'use client';

import { useCallback, useRef, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SpacePageLayout } from '@/components/layouts';
import { CelestialObject, CosmosRouteHelper } from '@/app/cosmos/components';
import { useCosmosNavigationSafe, HomeViewType } from '@/app/cosmos/context/CosmosNavigationContext';
import { CosmosParallax } from '@/components/home/CosmosParallax';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import HomeScreen from '@/app/cosmos/screens/HomeScreen';
import type { ScreenId, ScreenProps, FocusState, CelestialType, } from '@/app/cosmos/types';

// ============================================
// CONFIGURAÇÃO COMPARTILHADA
// ============================================

const SCREEN_ROUTE_MAP: Partial<Record<ScreenId, string>> = {
  home: '/cosmos/home',
  solOrbit: '/cosmos/sol',
  galaxySuns: '/comunidade',
  luaList: '/cosmos/lua',
  ringGalaxy: '/cosmos/galaxia',
  sidePlanetCard: '/cosmos/planeta',
  planetCardBelowSun: '/cosmos/planeta',
  planetCardStandalone: '/cosmos/planeta',
  columnSolLuaPlaneta: '/cosmos/planeta',
  eclipseProductivity: '/cosmos/eclipse',
};

const getRouteForScreen = (screen: ScreenId) => SCREEN_ROUTE_MAP[screen] ?? '/cosmos';

// Mapeamento de tipo celestial por hotspot
const CELESTIAL_TYPES: Record<string, CelestialType> = {
  galaxia: 'galaxia',
  eclipse: 'eclipse',
  sol: 'sol',
  luas: 'lua',
  planeta: 'planeta',
};

// ============================================
// HOTSPOTS PARA MODO PANORÂMICO
// ============================================

interface Hotspot {
  id: string;
  label: string;
  href: string;
  target: ScreenId;
  top: string;
  left: string;
  size: string;
  glow: string;
}

const HOTSPOTS_DESKTOP: Hotspot[] = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/cosmos/galaxia',
    target: 'ringGalaxy',
    top: '35%',
    left: '32%',
    size: '13%',
    glow: 'rgba(167, 139, 250, 0.6)',
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/cosmos/eclipse',
    target: 'eclipseProductivity',
    top: '18%',
    left: '52%',
    size: '5%',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/cosmos/sol',
    target: 'solOrbit',
    top: '45%',
    left: '73%',
    size: '12%',
    glow: 'rgba(251, 146, 60, 0.6)',
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/cosmos/lua',
    target: 'luaList',
    top: '30%',
    left: '13%',
    size: '11%',
    glow: 'rgba(226, 232, 240, 0.5)',
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/cosmos/planeta',
    target: 'sidePlanetCard',
    top: '70%',
    left: '48%',
    size: '15%',
    glow: 'rgba(56, 189, 248, 0.5)',
  },
];

const HOTSPOTS_MOBILE: Hotspot[] = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/cosmos/galaxia',
    target: 'ringGalaxy',
    top: '30%',
    left: '35%',
    size: '65px',
    glow: 'rgba(167, 139, 250, 0.6)',
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/cosmos/eclipse',
    target: 'eclipseProductivity',
    top: '8%',
    left: '55%',
    size: '45px',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/cosmos/sol',
    target: 'solOrbit',
    top: '44%',
    left: '60%',
    size: '62px',
    glow: 'rgba(251, 146, 60, 0.6)',
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/cosmos/lua',
    target: 'luaList',
    top: '8%',
    left: '12%',
    size: '58px',
    glow: 'rgba(226, 232, 240, 0.5)',
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/cosmos/planeta',
    target: 'sidePlanetCard',
    top: '86%',
    left: '55%',
    size: '72px',
    glow: 'rgba(56, 189, 248, 0.5)',
  },
];

// ============================================
// TIPOS DE FOCUS STATE UNIFICADOS
// ============================================

interface InteractiveFocusState extends FocusState {
  mode: 'interactive';
}

interface PanoramicFocusState {
  mode: 'panoramic';
  target: string;
  href: string;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  glow: string;
}

type UnifiedFocusState = InteractiveFocusState | PanoramicFocusState;

// ============================================
// COMPONENTES DE VISUALIZAÇÃO
// ============================================

interface ViewProps {
  navigateTo: ScreenProps['navigateTo'];
  navigateWithFocus: ScreenProps['navigateWithFocus'];
  onSwitchView: () => void;
  hotspots: Hotspot[];
  onHotspotClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    spot: Hotspot
  ) => void;
}

/** Visualização Interativa - Esferas 3D */
const InteractiveView: React.FC<ViewProps> = ({
  navigateTo,
  navigateWithFocus,
  onSwitchView,
}) => (
  <SpacePageLayout>
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10">
      {/* Botão para alternar visualização */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 z-50 flex justify-center">
        <button
          onClick={onSwitchView}
          className="flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
          title="Ver visualização panorâmica com hotspots"
        >
          🗺️ Visualização Panorâmica
        </button>
      </div>

      <div className="h-[70vh] w-full max-w-5xl">
        <HomeScreen navigateTo={navigateTo} navigateWithFocus={navigateWithFocus} />
      </div>
    </div>
  </SpacePageLayout>
);

/** Visualização Panorâmica - Hotspots na imagem */
const PanoramicView: React.FC<ViewProps> = ({
  onSwitchView,
  hotspots,
  onHotspotClick,
}) => (
  <CosmosParallax className="fixed inset-0 h-[100dvh] w-full">
    <div className="flex h-[100dvh] flex-col relative z-20">
      {/* Área dos hotspots */}
      <div className="flex flex-1 items-center justify-center px-4 py-4 sm:py-8 pointer-events-auto">
        <div className="relative w-full h-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl z-20">
          <div className="absolute inset-0">
            {hotspots.map((spot) => (
              <button
                key={spot.id}
                onClick={(e) => onHotspotClick(e, spot)}
                aria-label={`Abrir ${spot.label}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 bg-white/15 text-white backdrop-blur-sm transition-all duration-300 ease-out active:scale-95 sm:hover:scale-110 sm:hover:border-white/60 sm:hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none z-20 flex items-center justify-center"
                style={{
                  top: spot.top,
                  left: spot.left,
                  width: spot.size,
                  height: spot.size,
                  boxShadow: `0 0 30px ${spot.glow}, inset 0 0 20px ${spot.glow}`,
                }}
              >
                <span
                  className="absolute inset-[-4px] rounded-full opacity-60 animate-ping"
                  style={{
                    border: `1px solid ${spot.glow}`,
                    animationDuration: '3s',
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${spot.glow}, transparent 70%)`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer com botão de troca */}
      <footer className="relative z-30 px-4 pb-6 sm:pb-8 flex flex-col items-center gap-2">
        <button
          onClick={onSwitchView}
          className="flex items-center gap-2 rounded-full border border-indigo-300/50 bg-indigo-500/25 px-5 py-2.5 text-sm font-semibold text-indigo-100 backdrop-blur-md transition-all duration-200 hover:bg-indigo-500/40 hover:scale-105 hover:border-indigo-300/70 active:scale-95 shadow-lg shadow-indigo-500/20"
          title="Voltar para visualização interativa"
        >
          <span className="text-base">✨</span>
          <span>Modo Interativo</span>
        </button>
      </footer>
    </div>
  </CosmosParallax>
);

// ============================================
// COMPONENTE PRINCIPAL UNIFICADO
// ============================================

interface HomeViewSwitcherProps {
  initialView?: HomeViewType;
}

export const HomeViewSwitcher: React.FC<HomeViewSwitcherProps> = ({
  initialView,
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [focus, setFocus] = useState<UnifiedFocusState | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(new Set<string>());
  const { homeView, setHomeView } = useCosmosNavigationSafe();

  // Usar a view inicial se fornecida, senão usar a do contexto
  const currentView = initialView ?? homeView;
  const hotspots = isMobile ? HOTSPOTS_MOBILE : HOTSPOTS_DESKTOP;

  // Sincronizar view com o contexto
  useEffect(() => {
    if (initialView) {
      setHomeView(initialView);
    }
  }, [initialView, setHomeView]);

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Prefetch de todas as rotas possíveis
  useEffect(() => {
    const routes = [
      ...Object.values(SCREEN_ROUTE_MAP).filter(Boolean),
      ...hotspots.map((h) => h.href),
    ];
    const uniqueRoutes = [...new Set(routes)];
    
    uniqueRoutes.forEach((route) => {
      if (route && !prefetchedRef.current.has(route)) {
        router.prefetch(route);
        prefetchedRef.current.add(route);
      }
    });
  }, [router, hotspots]);

  // Navegação para screen (modo interativo)
  const navigateToRoute = useCallback<ScreenProps['navigateTo']>(
    (next) => {
      const route = getRouteForScreen(next);
      startTransition(() => {
        router.push(route);
      });
    },
    [router]
  );

  // Navegação com zoom/focus (modo interativo)
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

      const route = getRouteForScreen(next);
      router.prefetch(route);

      setFocus({
        mode: 'interactive',
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
    [navigateToRoute, router]
  );

  // Click no hotspot (modo panorâmico)
  const handleHotspotClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, spot: Hotspot) => {
      event.preventDefault();

      if (typeof window === 'undefined') {
        router.push(spot.href);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      router.prefetch(spot.href);

      setFocus({
        mode: 'panoramic',
        target: spot.id,
        href: spot.href,
        x,
        y,
        centerX,
        centerY,
        glow: spot.glow,
      });

      focusTimeoutRef.current = setTimeout(() => {
        router.push(spot.href);
        setFocus(null);
      }, 800);
    },
    [router]
  );

  // Alternar entre modos de visualização
  const handleSwitchView = useCallback(() => {
    const newView: HomeViewType = currentView === 'interactive' ? 'panoramic' : 'interactive';
    setHomeView(newView);
    
    // Atualizar URL sem fazer reload completo
    const newRoute = newView === 'interactive' ? '/cosmos/home' : '/cosmos/home/alternativa';
    router.push(newRoute);
  }, [currentView, setHomeView, router]);

  // Props compartilhadas para as views
  const viewProps: ViewProps = {
    navigateTo: navigateToRoute,
    navigateWithFocus,
    onSwitchView: handleSwitchView,
    hotspots,
    onHotspotClick: handleHotspotClick,
  };

  return (
    <>
      {currentView === 'interactive' ? (
        <InteractiveView {...viewProps} />
      ) : (
        <PanoramicView {...viewProps} />
      )}

      {/* Overlay de zoom unificado */}
      <AnimatePresence>
        {focus && focus.mode === 'interactive' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

        {focus && focus.mode === 'panoramic' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute rounded-full"
              initial={{
                x: focus.x - focus.centerX,
                y: focus.y - focus.centerY,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: 0,
                y: 0,
                scale: 8,
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
              }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              style={{
                width: 80,
                height: 80,
                background: `radial-gradient(circle at 30% 30%, ${focus.glow}, transparent 80%)`,
                boxShadow: `0 0 60px ${focus.glow}, 0 0 120px ${focus.glow}`,
              }}
            />
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.6] }}
              transition={{ duration: 0.7, times: [0, 0.7, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CosmosRouteHelper routeKey="home" position="top-left" />
    </>
  );
};

export default HomeViewSwitcher;
