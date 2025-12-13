import React from "react";

const EmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-6 text-center text-slate-200 shadow-lg shadow-sky-900/40">
    <div className="text-sm font-semibold uppercase tracking-[0.25em]">Linha vazia</div>
    <p className="text-[12px] text-slate-300/80">
      Ainda não temos dados para este intervalo. Tente sincronizar novamente.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full border border-sky-200/30 bg-sky-500/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
    >
      Recarregar calendário
    </button>
  </div>
);

export default EmptyState;
