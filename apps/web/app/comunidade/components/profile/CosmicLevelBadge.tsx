'use client';

import { memo } from 'react';

type CosmicLevel = 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';

type CosmicLevelBadgeProps = {
  level: CosmicLevel;
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
};

const levelConfig: Record<
  CosmicLevel,
  {
    icon: string;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    minPoints: number;
    maxPoints: number;
  }
> = {
  'lua-nova': {
    icon: '🌑',
    label: 'Lua Nova',
    color: 'text-slate-300',
    bgColor: 'bg-slate-800/80',
    borderColor: 'border-slate-600',
    minPoints: 0,
    maxPoints: 99,
  },
  'quarto-crescente': {
    icon: '🌓',
    label: 'Quarto Crescente',
    color: 'text-amber-300',
    bgColor: 'bg-amber-900/40',
    borderColor: 'border-amber-500/50',
    minPoints: 100,
    maxPoints: 499,
  },
  'lua-cheia': {
    icon: '🌕',
    label: 'Lua Cheia',
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-900/40',
    borderColor: 'border-indigo-400/50',
    minPoints: 500,
    maxPoints: 1999,
  },
  'estrela-guia': {
    icon: '⭐',
    label: 'Estrela Guia',
    color: 'text-amber-200',
    bgColor: 'bg-gradient-to-r from-amber-900/40 to-rose-900/40',
    borderColor: 'border-amber-400/50',
    minPoints: 2000,
    maxPoints: Infinity,
  },
};

export const CosmicLevelBadge = memo(function CosmicLevelBadge({
  level,
  points,
  size = 'md',
  showProgress = false,
  className = '',
}: CosmicLevelBadgeProps) {
  const config = levelConfig[level] ?? levelConfig['lua-nova'];

  const sizeClasses = {
    sm: 'text-base px-2 py-0.5',
    md: 'text-lg px-3 py-1',
    lg: 'text-xl px-4 py-1.5',
  };

  const progress =
    config.maxPoints === Infinity
      ? 100
      : ((points - config.minPoints) / (config.maxPoints - config.minPoints)) * 100;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`
          inline-flex items-center gap-1.5 rounded-full border
          ${config.bgColor} ${config.borderColor} ${sizeClasses[size]}
        `}
        title={`${config.label} - ${points} pontos cósmicos`}
      >
        <span>{config.icon}</span>
        {size !== 'sm' && (
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        )}
      </div>

      {showProgress && config.maxPoints !== Infinity && (
        <div className="mt-2 w-full max-w-[120px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-slate-500">
            {points} / {config.maxPoints + 1} pts
          </p>
        </div>
      )}
    </div>
  );
});
