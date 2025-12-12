import React from "react";

type CalendarStatusProps = {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

const CalendarStatus: React.FC<CalendarStatusProps> = ({
  isLoading,
  error,
  onRetry,
}) => (
  <div
    className="absolute right-4 top-4 flex items-center gap-3 rounded-full border border-white/5 bg-slate-900/60 px-4 py-2 text-[11px] text-slate-100 shadow-lg shadow-sky-900/30 backdrop-blur-md"
    role="status"
    aria-live="polite"
  >
    <span>
      {isLoading && "Sincronizando calendário lunar..."}
      {!isLoading && error && `Erro ao sincronizar: ${error}`}
      {!isLoading && !error && "Calendário lunar sincronizado"}
    </span>
    {error && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-sky-200/30 bg-sky-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

export default CalendarStatus;
