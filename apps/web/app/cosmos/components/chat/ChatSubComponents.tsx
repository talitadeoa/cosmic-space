/**
 * Subcomponentes auxiliares para o CosmosChatModal
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { CosmosChatModalProps } from './types';

// ============================================================================
// ContextEntries
// ============================================================================

interface ContextEntriesProps {
  contextTitle?: string;
  contextEntries: NonNullable<CosmosChatModalProps['contextEntries']>;
}

export function ContextEntries({ contextTitle, contextEntries }: ContextEntriesProps) {
  if (contextEntries.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-200/80 shadow-inner shadow-black/10">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold uppercase tracking-[0.18em] text-[0.65rem] text-slate-200/80">
          {contextTitle ?? 'Inputs conectados'}
        </span>
      </div>
      <div className="mt-2 space-y-2">
        {contextEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] text-slate-100"
          >
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-300/80">
              {entry.label}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-xs text-slate-100/90">
              {entry.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MessageCounter
// ============================================================================

interface MessageCounterProps {
  count: number;
  inline: boolean;
  showAuthPrompt: boolean;
}

export function MessageCounter({ count, inline, showAuthPrompt }: MessageCounterProps) {
  if (count === 0 || inline || showAuthPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-white/10 px-2 py-2 text-center text-xs text-slate-400"
    >
      {count} mensagem{count !== 1 ? 's' : ''} registrada{count !== 1 ? 's' : ''}
    </motion.div>
  );
}

// ============================================================================
// CloseButton
// ============================================================================

interface CloseButtonProps {
  onClose: () => void;
}

export function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white z-20"
      aria-label="Fechar"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
