import React from 'react';

type CalendarStatusProps = {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

const CalendarStatus: React.FC<CalendarStatusProps> = ({ isLoading, error, onRetry }) => (
  <div
    className="absolute right-2 top-8 flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/60 px-2 py-1 text-[9px] text-slate-100 shadow-lg shadow-sky-900/30 backdrop-blur-md sm:right-4 sm:top-4 sm:gap-3 sm:px-4 sm:py-2 sm:text-[11px]"
    role="status"
    aria-live="polite"
  >
    <span className="max-w-[120px] truncate sm:max-w-none">
      {isLoading && 'Sincronizando...'}
      {!isLoading && error && `Erro: ${error}`}
      {!isLoading && !error && 'Sincronizado'}
    </span>
    {error && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-sky-200/30 bg-sky-500/20 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]"
      >
        Retry
      </button>
    )}
  </div>
);

export default CalendarStatus;
