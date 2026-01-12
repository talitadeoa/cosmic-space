'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmosParallax } from '@/components/home/CosmosParallax';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';

// Mapeamento de tipo celestial por hotspot
const CELESTIAL_TYPES: Record<string, string> = {
  galaxia: 'galaxy',
  eclipse: 'eclipse',
  sol: 'sol',
  luas: 'lua',
  planeta: 'planeta',
};

interface FocusState {
  target: string;
  href: string;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  glow: string;
}

// Hotspots com posições otimizadas para mobile e desktop
const HOTSPOTS_DESKTOP = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/cosmos/galaxia',
    top: '35%',
    left: '32%',
    size: '13%',
    glow: 'rgba(167, 139, 250, 0.6)', // violeta
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/cosmos/eclipse',
    top: '2%',
    left: '52%',
    size: '5%',
    glow: 'rgba(251, 191, 36, 0.5)', // dourado
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/cosmos/sol',
    top: '52%',
    left: '55%',
    size: '12%',
    glow: 'rgba(251, 146, 60, 0.6)', // laranja
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/cosmos/lua',
    top: '6%',
    left: '18%',
    size: '11%',
    glow: 'rgba(226, 232, 240, 0.5)', // prata
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/cosmos/planeta',
    top: '88%',
    left: '48%',
    size: '15%',
    glow: 'rgba(56, 189, 248, 0.5)', // cyan
  },
];

// Posições otimizadas para mobile - disposição mais acessível
const HOTSPOTS_MOBILE = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/cosmos/galaxia',
    top: '30%',
    left: '35%',
    size: '65px',
    glow: 'rgba(167, 139, 250, 0.6)', // violeta
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/cosmos/eclipse',
    top: '8%',
    left: '55%',
    size: '45px',
    glow: 'rgba(251, 191, 36, 0.5)', // dourado
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/cosmos/sol',
    top: '44%',
    left: '60%',
    size: '62px',
    glow: 'rgba(251, 146, 60, 0.6)', // laranja
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/cosmos/lua',
    top: '8%',
    left: '12%',
    size: '58px',
    glow: 'rgba(226, 232, 240, 0.5)', // prata
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/cosmos/planeta',
    top: '86%',
    left: '55%',
    size: '72px',
    glow: 'rgba(56, 189, 248, 0.5)', // cyan
  },
];

export default function HomeAlternativaPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const hotspots = isMobile ? HOTSPOTS_MOBILE : HOTSPOTS_DESKTOP;
  const { setHomeView } = useCosmosNavigationSafe();
  const [focus, setFocus] = useState<FocusState | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(new Set<string>());

  // Marcar que estamos na home panorâmica
  useEffect(() => {
    setHomeView('panoramic');
  }, [setHomeView]);

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Prefetch todas as rotas possíveis
  useEffect(() => {
    const routes = hotspots.map((h) => h.href);
    routes.forEach((route) => {
      if (route && !prefetchedRef.current.has(route)) {
        router.prefetch(route);
        prefetchedRef.current.add(route);
      }
    });
  }, [router, hotspots]);

  const handleHotspotClick = useCallback(
    (
      event: React.MouseEvent<HTMLButtonElement>,
      spot: { id: string; href: string; glow: string }
    ) => {
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

      // Prefetch da página de destino
      router.prefetch(spot.href);

      setFocus({
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

  return (
    <CosmosParallax className="fixed inset-0 h-[100dvh] w-full">
      <div className="flex h-[100dvh] flex-col relative z-20">
        {/* Área dos hotspots - ocupa todo o espaço */}
        <div className="flex flex-1 items-center justify-center px-4 py-4 sm:py-8 pointer-events-auto">
          <div className="relative w-full h-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl z-20">
            {/* Container para posicionar os hotspots */}
            <div className="absolute inset-0">
              {hotspots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={(e) => handleHotspotClick(e, spot)}
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
                  {/* Anel pulsante */}
                  <span
                    className="absolute inset-[-4px] rounded-full opacity-60 animate-ping"
                    style={{
                      border: `1px solid ${spot.glow}`,
                      animationDuration: '3s',
                    }}
                  />
                  {/* Brilho interno */}
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

        {/* Footer com botão de voltar */}
        <footer className="relative z-30 px-4 pb-6 sm:pb-8 flex flex-col items-center gap-2">
          {/* Botão voltar - posicionado no rodapé para melhor acessibilidade mobile */}
          <button
            onClick={() => router.push('/cosmos/home')}
            className="flex items-center gap-2 rounded-full border border-indigo-300/50 bg-indigo-500/25 px-5 py-2.5 text-sm font-semibold text-indigo-100 backdrop-blur-md transition-all duration-200 hover:bg-indigo-500/40 hover:scale-105 hover:border-indigo-300/70 active:scale-95 shadow-lg shadow-indigo-500/20"
            title="Voltar para visualização interativa"
          >
            <span className="text-base">✨</span>
            <span>Modo Interativo</span>
          </button>
        </footer>
      </div>

      {/* Overlay de zoom */}
      <AnimatePresence>
        {focus && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Esfera que faz zoom */}
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

            {/* Flash de transição */}
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.6] }}
              transition={{ duration: 0.7, times: [0, 0.7, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CosmosParallax>
  );
}
