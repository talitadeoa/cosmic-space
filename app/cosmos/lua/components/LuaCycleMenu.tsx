'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';

interface CycleOption {
  key: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  group?: 'lunar' | 'menstrual';
}

const CYCLE_OPTIONS: CycleOption[] = [
  // Grupo Lunar
  {
    key: 'calendario-lua',
    label: 'Calendário Lunar',
    description: 'Visualize fases e lunações',
    icon: '🌙',
    href: '/cosmos/lua',
    group: 'lunar',
  },
  {
    key: 'timeline',
    label: 'Timeline Lunar',
    description: 'Explore o tempo lunar',
    icon: '🌓',
    href: '/cosmos/lua/timeline',
    group: 'lunar',
  },
  {
    key: 'tempo',
    label: 'Scrubber Temporal',
    description: 'Navegue no tempo lunar',
    icon: '⏱️',
    href: '/cosmos/lua/tempo',
    group: 'lunar',
  },
  {
    key: 'calendario-widget',
    label: 'Calendário Widget',
    description: 'Widget de calendário interativo',
    icon: '📅',
    href: '/ciclos/calendario',
    group: 'lunar',
  },
  // Grupo Menstrual
  {
    key: 'ciclo-menstrual',
    label: 'Jornada do Ciclo',
    description: '',
    icon: '🌸',
    href: '/ciclos/ciclo',
    group: 'menstrual',
  },
  {
    key: 'analise-ciclos',
    label: 'Análise de Ciclos',
    description: '',
    icon: '📊',
    href: '/perfil/ciclos',
    group: 'menstrual',
  },
];

// Mapeamento de rotas alternativas para as principais
const ROUTE_ALIASES: Record<string, string> = {
  '/ciclos/lunar': '/cosmos/lua',
  '/cosmos/calendariog': '/ciclos/calendario',
  '/cosmos/calendarioc': '/ciclos/calendario',
};

interface LuaCycleMenuProps {
  currentPath?: string;
}

const LuaCycleMenu: React.FC<LuaCycleMenuProps> = ({ currentPath = '/cosmos/lua' }) => {
  const router = useRouter();
  const { navigateToHome } = useBackToHome();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Resolve aliases para encontrar a opção correta
  const normalizedPath = ROUTE_ALIASES[currentPath] || currentPath;
  const currentOption = CYCLE_OPTIONS.find((opt) => opt.href === normalizedPath) ?? CYCLE_OPTIONS[0];

  // Verifica se o path atual corresponde a uma opção (incluindo aliases)
  const isCurrentPath = (optionHref: string) => {
    if (optionHref === currentPath) return true;
    if (optionHref === normalizedPath) return true;
    // Verifica se o currentPath é um alias para esta opção
    return Object.entries(ROUTE_ALIASES).some(
      ([alias, target]) => alias === currentPath && target === optionHref
    );
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape, isOpen]);

  const handleOptionClick = (option: CycleOption) => {
    setIsOpen(false);
    if (option.href !== currentPath) {
      router.push(option.href);
    }
  };

  return (
    <div ref={menuRef} className="relative z-50">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 px-3 py-2 transition text-white/80 hover:text-white touch-manipulation"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base">{currentOption.icon}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentOption.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            {/* Grupo Lunar */}
            <div className="p-1">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-violet-400/80 font-medium">
                🌙 Ciclo Lunar
              </div>
              {CYCLE_OPTIONS.filter((opt) => opt.group === 'lunar').map((option) => {
                const isActive = isCurrentPath(option.href);
                return (
                  <button
                    key={option.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(option);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-200'
                        : 'hover:bg-white/5 text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{option.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{option.label}</span>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wide text-violet-300 bg-violet-500/30 px-1.5 py-0.5 rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grupo Menstrual */}
            <div className="border-t border-white/10 p-1">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-pink-400/80 font-medium">
                🩸 Seu ciclo 
              </div>
              {CYCLE_OPTIONS.filter((opt) => opt.group === 'menstrual').map((option) => {
                const isActive = isCurrentPath(option.href);
                return (
                  <button
                    key={option.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(option);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-pink-500/20 text-pink-200'
                        : 'hover:bg-white/5 text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{option.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{option.label}</span>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wide text-pink-300 bg-pink-500/30 px-1.5 py-0.5 rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider & Back to Home */}
            <div className="border-t border-white/10 p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  navigateToHome();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="text-sm">Voltar ao Cosmos</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuaCycleMenu;
