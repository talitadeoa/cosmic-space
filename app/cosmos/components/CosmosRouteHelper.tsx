'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  /** Permite alternar entre modo compacto (emoji) e cartão */
  collapsible?: boolean;
  /** Forçar exibição mesmo se já visitou */
  forceShow?: boolean;
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
  'bottom-right': 'bottom-6 right-4 sm:bottom-8 sm:right-8',
  'bottom-left': 'bottom-6 left-4 sm:bottom-8 sm:left-8',
  'top-right': 'top-24 right-4 sm:top-28 sm:right-8',
  'top-left': 'top-24 left-4 sm:top-28 sm:left-8',
};

export const CosmosRouteHelper: React.FC<CosmosRouteHelperProps> = ({
  routeKey,
  delay = 800,
  position = 'bottom-right',
  collapsible = true,
  forceShow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const config = ROUTE_HELPER_CONFIG[routeKey];
  const accent = accentStyles[config.accentColor] || accentStyles.indigo;
  const firstTip = config.tips[0] ?? 'Explore o cosmos tocando nos astros.';

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

  const handleExpand = useCallback(() => {
    if (!collapsible) return;
    setIsCollapsed(false);
  }, [collapsible]);

  const handleCollapse = useCallback(() => {
    if (!collapsible) return;
    setIsCollapsed(true);
    markRouteVisited(routeKey);
  }, [collapsible, routeKey]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`pointer-events-none fixed z-[120] ${positionStyles[position]}`}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.button
                key="collapsed"
                type="button"
                onClick={handleExpand}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-lg shadow-[0_8px_22px_rgba(2,6,23,0.4)] backdrop-blur-xl text-white/90"
                aria-label={`Abrir dica do cosmos: ${firstTip}`}
                aria-expanded={!isCollapsed}
              >
                <span>{config.icon}</span>
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl ${accent.glow}`}
                />
              </motion.button>
            ) : (
              <motion.div
                key="expanded"
                layout
                className="relative max-w-xs overflow-hidden rounded-2xl border border-white/8 bg-slate-950/60 backdrop-blur-xl shadow-[0_8px_22px_rgba(2,6,23,0.4)]"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <motion.div
                  layout
                  className="relative"
                >
                  <motion.div
                    aria-hidden
                    className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-3xl ${accent.glow}`}
                  />

                  {collapsible && (
                    <button
                      type="button"
                      onClick={handleCollapse}
                      className="absolute right-2 top-2 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
                      aria-label="Recolher dica"
                      aria-expanded={!isCollapsed}
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}

                  <div className="p-3.5 pr-8">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className="text-sm font-medium text-white/90">{config.title}</h3>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-white/60">
                      {config.description}
                    </p>

                    <div className="mt-3 min-h-[32px]">
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex items-start gap-2 text-xs text-white/70"
                        >
                          <span className={`${accent.text} mt-0.5`}>💡</span>
                          <span className="text-white/80">{firstTip}</span>
                        </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
