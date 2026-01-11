'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple inline SVG icons to avoid lucide-react dependency
const XIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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

const accentStyles: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  indigo: {
    bg: 'from-indigo-900/90 to-indigo-950/95',
    border: 'border-indigo-400/30',
    glow: 'shadow-indigo-500/20',
    text: 'text-indigo-200',
  },
  violet: {
    bg: 'from-violet-900/90 to-violet-950/95',
    border: 'border-violet-400/30',
    glow: 'shadow-violet-500/20',
    text: 'text-violet-200',
  },
  amber: {
    bg: 'from-amber-900/90 to-amber-950/95',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-200',
  },
  sky: {
    bg: 'from-sky-900/90 to-sky-950/95',
    border: 'border-sky-400/30',
    glow: 'shadow-sky-500/20',
    text: 'text-sky-200',
  },
  teal: {
    bg: 'from-teal-900/90 to-teal-950/95',
    border: 'border-teal-400/30',
    glow: 'shadow-teal-500/20',
    text: 'text-teal-200',
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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed z-50 ${positionStyles[position]}`}
        >
          <div
            className={`
              relative max-w-xs overflow-hidden rounded-2xl border backdrop-blur-xl
              bg-gradient-to-br ${accent.bg} ${accent.border}
              shadow-xl ${accent.glow}
            `}
          >
            {/* Decorative sparkle */}
            <div className="absolute -right-2 -top-2 opacity-40">
              <SparklesIcon className={`h-8 w-8 ${accent.text}`} />
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-2 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
              aria-label="Fechar dica"
            >
              <XIcon />
            </button>

            {/* Content */}
            <div className="p-4 pr-10">
              {/* Header */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <h3 className="text-sm font-semibold text-white">{config.title}</h3>
              </div>

              {/* Description */}
              <p className="mb-3 text-xs leading-relaxed text-white/70">{config.description}</p>

              {/* Tips carousel */}
              <div className="relative min-h-[40px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTip}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 ${accent.border} border`}
                  >
                    <span className={`text-xs ${accent.text}`}>💡</span>
                    <span className="text-xs text-white/80">{config.tips[currentTip]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress & Navigation */}
              <div className="mt-3 flex items-center justify-between">
                {/* Dots */}
                <div className="flex gap-1.5">
                  {config.tips.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setHasInteracted(true);
                        setCurrentTip(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentTip
                          ? `w-4 ${accent.text.replace('text-', 'bg-')}`
                          : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Dica ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNextTip}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${accent.text} hover:bg-white/10`}
                >
                  {currentTip < config.tips.length - 1 ? (
                    <>
                      Próximo
                      <ChevronRightIcon />
                    </>
                  ) : (
                    'Entendi!'
                  )}
                </button>
              </div>
            </div>

            {/* Subtle animated border glow */}
            <motion.div
              className={`absolute inset-0 -z-10 rounded-2xl opacity-50 ${accent.glow}`}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.15)',
                  '0 0 30px rgba(99, 102, 241, 0.25)',
                  '0 0 20px rgba(99, 102, 241, 0.15)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
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
