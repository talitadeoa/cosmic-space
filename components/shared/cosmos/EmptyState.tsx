'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 *
 * Renderizado quando não há tarefas a exibir.
 * Não é clicável nem interativo.
 * Usa opacidade reduzida e ícone sutil para diferenciação visual.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum to-do salvo',
  description = 'Crie uma tarefa ou selecione uma fase lunar.',
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8 text-center opacity-60 transition-opacity sm:gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Empty state: ${title}`}
    >
      {icon && <div className="text-2xl opacity-50 sm:text-3xl">{icon}</div>}

      <h3 className="text-sm font-semibold text-slate-300 sm:text-base">{title}</h3>

      <p className="max-w-xs text-xs text-slate-500 sm:text-sm">{description}</p>
    </div>
  );
};

export default EmptyState;
