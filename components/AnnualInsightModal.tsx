'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnualInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (insight: string) => Promise<void>;
}

export default function AnnualInsightModal({
  isOpen,
  onClose,
  onSubmit,
}: AnnualInsightModalProps) {
  const [insight, setInsight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setInsight('');
      setSubmitError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = insight.trim();
    if (trimmed.length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para salvar.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/10 via-orange-400/5 to-slate-950/60" />
            <div className="pointer-events-none absolute inset-x-6 top-6 h-28 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-xl" />

            {/* Fechar */}
            <button
              onClick={onClose}
              className="pointer-events-auto absolute right-5 top-5 rounded-full border border-white/10 bg-slate-900/60 p-1 text-amber-100 shadow-lg transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:text-amber-50"
              aria-label="Fechar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cabeçalho */}
            <div className="relative mb-6 flex flex-col items-center gap-1 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                Insight Anual
              </p>
              <div className="text-lg font-semibold text-amber-100">☀️ Sol</div>
              <h2 className="text-3xl font-bold text-white">{currentYear}</h2>
              <p className="text-sm text-amber-100/90">Seu insight do ano</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Insight */}
              <div className="space-y-2">
                <label htmlFor="insight" className="block text-sm font-semibold text-amber-50">
                  Reflita Sobre o Ano
                </label>
                <textarea
                  id="insight"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="Escreva sua reflexão, aprendizados e conquistas do ano..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-amber-50 placeholder-amber-600/60 shadow-inner shadow-black/30 transition focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
                  rows={6}
                />
              </div>

              {/* Erro */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 shadow-inner shadow-red-500/20"
                >
                  {submitError}
                </motion.div>
              )}

              {/* Botões */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-amber-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Salvando...' : 'Concluído'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
