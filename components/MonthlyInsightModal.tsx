'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutosave } from '@/hooks';

interface MonthlyInsightModalProps {
  isOpen: boolean;
  moonIndex: number;
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  moonSignLabel?: string;
  onClose: () => void;
  onSubmit: (insight: string) => Promise<void>;
}

const moonPhaseLabels: Record<string, string> = {
  luaNova: 'Lua Nova',
  luaCrescente: 'Lua Crescente',
  luaCheia: 'Lua Cheia',
  luaMinguante: 'Lua Minguante',
};

const getMonthNumber = (monthNumber: number): number => {
  // Recebemos o mês já calculado (1-12); garante ciclo de 12 meses
  return ((monthNumber - 1) % 12) + 1;
};

const phasePrompts: Record<string, { label: string; placeholder: string }> = {
  luaNova: {
    label: 'O que você gostaria de plantar nesta fase?',
    placeholder: 'Intenções, sementes, inícios que você quer colocar no mundo...',
  },
  luaCheia: {
    label: 'O que você gostaria de colher nesta fase?',
    placeholder: 'Resultados, colheitas, celebrações do que foi plantado...',
  },
};

const getMonthName = (monthNum: number): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[(monthNum - 1) % 12];
};

export default function MonthlyInsightModal({
  isOpen,
  moonIndex,
  moonPhase,
  moonSignLabel,
  onClose,
  onSubmit,
}: MonthlyInsightModalProps) {
  const [insight, setInsight] = useState('');
  const { status: autosaveStatus, error: autosaveError } = useAutosave({
    value: insight,
    onSave: onSubmit,
    enabled: isOpen,
    delayMs: 900,
    minLength: 3,
  });
  const statusLabel = useMemo(() => {
    if (autosaveStatus === 'saving') return 'Salvando...';
    if (autosaveStatus === 'saved') return 'Salvo automaticamente';
    if (autosaveStatus === 'error') return 'Erro ao salvar';
    if (autosaveStatus === 'typing') return 'Aguardando pausa para salvar';
    return 'Autosave pronto';
  }, [autosaveStatus]);

  const monthNum = getMonthNumber(moonIndex);
  const monthName = getMonthName(monthNum);
  const phaseLabel = moonPhaseLabels[moonPhase];
  const prompt = phasePrompts[moonPhase] ?? {
    label: 'Seu insight do mês',
    placeholder: 'Escreva seu insight, reflexão ou aprendizado para este mês...',
  };
  const signLabel = moonSignLabel?.trim() && moonSignLabel.trim().length > 0 ? moonSignLabel : '— signo em breve';

  useEffect(() => {
    if (!isOpen) {
      setInsight('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-lg sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-400/10" />

            {/* Fechar */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-indigo-200 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 hover:text-white"
              aria-label="Fechar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cabeçalho */}
            <div className="mb-6 text-center">
              <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-indigo-100/80">
                {phaseLabel}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">{monthName}</h2>
              <p className="text-xs text-slate-200/70">Mês #{monthNum}</p>
              <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-indigo-50">
                <span>Signo</span>
                <span className="text-slate-100/90">{signLabel}</span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Insight */}
              <div className="space-y-2">
                <label htmlFor="insight" className="block text-sm font-semibold uppercase tracking-[0.14em] text-slate-200/90">
                  {prompt.label}
                </label>
                <textarea
                  id="insight"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder={prompt.placeholder}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-indigo-300/60 focus:outline-none focus:ring-1 focus:ring-indigo-300/40 disabled:opacity-50"
                  rows={5}
                />
              </div>

              {/* Erro */}
              {autosaveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 shadow-inner shadow-black/20"
                >
                  {autosaveError}
                </motion.div>
              )}

              {/* Botões */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-black/10">
                  <span className="font-semibold uppercase tracking-[0.16em]">Autosave</span>
                  <span className="rounded-full border border-indigo-300/40 bg-indigo-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-indigo-50">
                    {statusLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-2xl border border-indigo-300/60 bg-indigo-500/30 px-4 py-2 font-semibold text-white shadow-md shadow-indigo-900/40 transition hover:bg-indigo-500/45 hover:shadow-lg hover:shadow-indigo-700/40"
                >
                  Concluído
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
