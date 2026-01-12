'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple inline SVG icons to avoid lucide-react dependency
const XIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type RouteKey = 'home' | 'lua' | 'sol' | 'galaxia' | 'eclipse' | 'planeta';

interface RouteHelperConfig {
  icon: string;
  title: string;
  description: string;
  tips: string[];
  accentColor: string;
}

const ROUTE_HELPER_CONFIG: Record<RouteKey, RouteHelperConfig> = {
  home: {
    icon: '🌌',
    title: 'Bem-vinda ao Cosmos',
    description: 'Este é o seu ponto de partida. Explore os astros e descubra cada dimensão.',
    tips: [
      'Toque nos astros para navegar',
      'O Sol leva às suas órbitas anuais',
      'A Lua revela seu ciclo mensal',
    ],
    accentColor: 'indigo',
  },
  lua: {
    icon: '🌙',
    title: 'Ciclo Lunar',
    description: 'Acompanhe as fases da lua e sincronize suas tarefas com o ritmo lunar.',
    tips: [
      'Cada fase tem sua energia única',
      'Arraste para explorar o ciclo',
      'Toque para ver detalhes da fase',
    ],
    accentColor: 'violet',
  },
  sol: {
    icon: '☀️',
    title: 'Órbita Solar',
    description: 'Visualize sua jornada anual ao redor do Sol.',
    tips: [
      'Cada órbita representa um ano',
      'Toque no centro para ver galáxias',
      'Explore diferentes perspectivas',
    ],
    accentColor: 'amber',
  },
  galaxia: {
    icon: '🌀',
    title: 'Galáxia',
    description: 'Uma visão expandida do seu universo pessoal.',
    tips: [
      'Gire para explorar a galáxia',
      'Cada anel é um ciclo diferente',
      'Zoom para ver mais detalhes',
    ],
    accentColor: 'sky',
  },
  eclipse: {
    icon: '🌑',
    title: 'Estação Eclipse',
    description: 'Onde Sol e Lua se encontram. Visualize produtividade e ciclos juntos.',
    tips: [
      'Compare ritmo lunar e tarefas',
      'Identifique padrões de energia',
      'Sincronize com a fase atual',
    ],
    accentColor: 'violet',
  },
  planeta: {
    icon: '🪐',
    title: 'SidePlanet',
    description: 'Organize suas tarefas alinhadas com as fases lunares.',
    tips: [
      'Adicione to-dos por fase',
      'Deslize entre as lunações',
      'Filtre por prioridade ou status',
    ],
    accentColor: 'teal',
  },
};

const STORAGE_KEY = 'cosmos-route-helper-visited';

function getVisitedRoutes(): Set<RouteKey> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function markRouteVisited(route: RouteKey): void {
  if (typeof window === 'undefined') return;
  try {
    const visited = getVisitedRoutes();
    visited.add(route);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  } catch {
    // ignore storage errors
  }
}

interface CosmosRouteHelperProps {
  routeKey: RouteKey;
  /** Delay em ms antes de aparecer (default: 800) */
  delay?: number;
  /** Posição do helper */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Forçar exibição mesmo se já visitou */
  forceShow?: boolean;
  /** Callback quando o helper é fechado */
  onDismiss?: () => void;
}

const accentStyles: Record<string, { text: string; bar: string; glow: string }> = {
  indigo: {
    text: 'text-indigo-200',
    bar: 'bg-indigo-300/70',
    glow: 'bg-indigo-500/25',
  },
  violet: {
    text: 'text-violet-200',
    bar: 'bg-violet-300/70',
    glow: 'bg-violet-500/25',
  },
  amber: {
    text: 'text-amber-200',
    bar: 'bg-amber-300/70',
    glow: 'bg-amber-500/25',
  },
  sky: {
    text: 'text-sky-200',
    bar: 'bg-sky-300/70',
    glow: 'bg-sky-500/25',
  },
  teal: {
    text: 'text-teal-200',
    bar: 'bg-teal-300/70',
    glow: 'bg-teal-500/25',
  },
};

const positionStyles: Record<string, string> = {
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  'top-right': 'top-20 right-4 sm:top-24 sm:right-6',
  'top-left': 'top-20 left-4 sm:top-24 sm:left-6',
};

export const CosmosRouteHelper: React.FC<CosmosRouteHelperProps> = ({
  routeKey,
  delay = 800,
  position = 'bottom-right',
  forceShow = false,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const config = ROUTE_HELPER_CONFIG[routeKey];
  const accent = accentStyles[config.accentColor] || accentStyles.indigo;
  const progress = config.tips.length > 0 ? (currentTip + 1) / config.tips.length : 0;

  useEffect(() => {
    // Check if already visited
    const visited = getVisitedRoutes();
    if (visited.has(routeKey) && !forceShow) {
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [routeKey, delay, forceShow]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    markRouteVisited(routeKey);
    onDismiss?.();
  }, [routeKey, onDismiss]);

  const handleNextTip = useCallback(() => {
    setHasInteracted(true);
    if (currentTip < config.tips.length - 1) {
      setCurrentTip((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  }, [currentTip, config.tips.length, handleDismiss]);

  // Auto-dismiss after 8 seconds if no interaction
  useEffect(() => {
    if (!isVisible || hasInteracted) return;

    const autoDismiss = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(autoDismiss);
  }, [isVisible, hasInteracted, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`fixed z-50 ${positionStyles[position]}`}
        >
          <motion.div
            className="relative max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(2,6,23,0.45)]"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-3xl ${accent.glow}`}
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-2 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
              aria-label="Fechar dica"
            >
              <XIcon />
            </button>

            {/* Content */}
            <div className="p-4 pr-10">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <h3 className="text-sm font-medium text-white/90">{config.title}</h3>
              </div>

              {/* Description */}
              <p className="mt-1 text-xs leading-relaxed text-white/60">{config.description}</p>

              {/* Tips carousel */}
              <div className="mt-3 min-h-[32px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTip}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex items-start gap-2 text-xs text-white/70"
                  >
                    <span className={`${accent.text} mt-0.5`}>💡</span>
                    <span className="text-white/80">{config.tips[currentTip]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress & Navigation */}
              <div className="mt-3 flex items-center gap-3">
                <div className="h-0.5 flex-1 rounded-full bg-white/10">
                  <motion.div
                    className={`h-0.5 rounded-full ${accent.bar}`}
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>

                {/* Next button */}
                <button
                  onClick={handleNextTip}
                  className={`text-[11px] font-semibold ${accent.text} transition-colors hover:text-white`}
                >
                  {currentTip < config.tips.length - 1 ? 'Próximo' : 'Entendi!'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para resetar o histórico (útil para testes)
export function useResetRouteHelper() {
  return useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);
}

// Exportar tipos para uso externo
export type { RouteKey, RouteHelperConfig };

export default CosmosRouteHelper;
