'use client';

import { memo } from 'react';
import { InboxIcon } from './icons';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Estado vazio para quando não há conteúdo
 * Com ícone, texto e ação opcional
 */
export const EmptyState = memo(function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 px-6 py-12 text-center"
      role="status"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60">
        <InboxIcon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-indigo-400/70 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {action.label}
        </button>
      )}
    </div>
  );
});
