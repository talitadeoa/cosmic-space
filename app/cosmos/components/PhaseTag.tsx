'use client';

import React from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import { MOON_PHASE_EMOJI_LABELS } from '@/app/cosmos/utils/moonPhases';

interface PhaseTagProps {
  phase: MoonPhase;
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function PhaseTag({ phase, removable = false, onRemove, size = 'md' }: PhaseTagProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white font-medium ${sizeClasses[size]} shadow-md hover:shadow-lg transition-shadow`}
    >
      <span>{MOON_PHASE_EMOJI_LABELS[phase]}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${phase}`}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
