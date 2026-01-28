'use client';

import { memo } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from './icons';

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

/**
 * Estado de erro com opção de retry
 * Ícone de alerta e botão de tentar novamente
 */
export const ErrorState = memo(function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-950/20 px-6 py-12 text-center"
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-900/40">
        <ExclamationTriangleIcon className="h-7 w-7 text-rose-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 justify-center rounded-full border border-slate-600/70 bg-slate-800/40 px-5 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
});
