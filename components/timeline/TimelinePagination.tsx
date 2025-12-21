"use client";

type TimelinePaginationProps = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
};

export default function TimelinePagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: TimelinePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-slate-200">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-indigo-400 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-xs text-slate-400">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-indigo-400 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
}
