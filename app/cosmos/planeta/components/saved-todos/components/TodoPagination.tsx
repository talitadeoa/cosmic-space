'use client';

import React from 'react';

interface TodoPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * Controles de paginação para lista de tarefas
 */
export function TodoPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: TodoPaginationProps) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={isFirstPage}
        className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
          isFirstPage
            ? 'border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
            : 'border border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
        }`}
        title="Página anterior"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-2">
        <span className="text-[0.65rem] font-semibold text-slate-300">
          {currentPage + 1} / {totalPages}
        </span>
        <span className="text-[0.6rem] text-slate-400">
          ({startIndex + 1}-{endIndex} de {totalItems})
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={isLastPage}
        className={`rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition ${
          isLastPage
            ? 'border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
            : 'border border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
        }`}
        title="Próxima página"
      >
        Próxima →
      </button>
    </div>
  );
}
