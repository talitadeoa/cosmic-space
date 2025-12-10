'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutosave } from '@/hooks';

interface QuarterlyInsightModalProps {
  isOpen: boolean;
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  onClose: () => void;
  onSubmit: (insight: string) => Promise<void>;
}

const moonPhaseInfo: Record<string, { name: string; quarter: string; months: string }> = {
  luaNova: { name: 'Lua Nova', quarter: '1º Trimestre', months: 'Jan - Mar' },
  luaCrescente: { name: 'Lua Crescente', quarter: '2º Trimestre', months: 'Abr - Jun' },
  luaCheia: { name: 'Lua Cheia', quarter: '3º Trimestre', months: 'Jul - Set' },
  luaMinguante: { name: 'Lua Minguante', quarter: '4º Trimestre', months: 'Out - Dez' },
};

export default function QuarterlyInsightModal({
  isOpen,
  moonPhase,
  onClose,
  onSubmit,
}: QuarterlyInsightModalProps) {
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

  const phaseInfo = moonPhaseInfo[moonPhase];

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/10 via-indigo-400/5 to-slate-950/60" />
            <div className="pointer-events-none absolute inset-x-6 top-6 h-28 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-xl" />

            {/* Fechar */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full border border-white/10 bg-slate-900/60 p-1 text-sky-200 shadow-lg transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:text-sky-100"
              aria-label="Fechar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cabeçalho */}
            <div className="relative mb-6 flex flex-col items-center gap-1 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                Insight Trimestral
              </p>
              <h2 className="text-2xl font-semibold text-white">{phaseInfo.name}</h2>
              <p className="text-sm text-slate-200/90">{phaseInfo.quarter}</p>
              <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-[0.72rem] font-medium text-sky-100">
                {phaseInfo.months}
              </span>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Insight */}
              <div className="space-y-2">
                <label htmlFor="insight" className="block text-sm font-semibold text-sky-100">
                  Seu Insight Trimestral
                </label>
                <textarea
                  id="insight"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="Escreva sua reflexão, aprendizado ou insight para este trimestre..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-black/30 transition focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50"
                  rows={5}
                />
              </div>

              {/* Erro */}
              {autosaveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 shadow-inner shadow-red-500/20"
                >
                  {autosaveError}
                </motion.div>
              )}

              {/* Botões */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 shadow-inner shadow-black/30">
                  <span className="font-semibold text-slate-100">Autosave</span>
                  <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-100 shadow shadow-sky-500/30">
                    {statusLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-xl border border-sky-400/60 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-sky-400/50"
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
