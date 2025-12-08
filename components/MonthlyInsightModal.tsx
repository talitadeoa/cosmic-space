'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthlyInsightModalProps {
  isOpen: boolean;
  moonIndex: number;
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  onClose: () => void;
  onSubmit: (insight: string) => Promise<void>;
}

const moonPhaseLabels: Record<string, string> = {
  luaNova: 'Lua Nova',
  luaCrescente: 'Lua Crescente',
  luaCheia: 'Lua Cheia',
  luaMinguante: 'Lua Minguante',
};

const getMonthNumber = (index: number): number => {
  // 8 luas = 8 meses do ano (índice 0-7 = mês 1-8, depois cicla)
  return (index % 8) + 1;
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
  onClose,
  onSubmit,
}: MonthlyInsightModalProps) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthNum = getMonthNumber(moonIndex);
  const monthName = getMonthName(monthNum);
  const phaseLabel = moonPhaseLabels[moonPhase];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!insight.trim()) {
      setError('Por favor, escreva seu insight mensal');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(insight);
      setInsight('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar insight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-lg border border-sky-400/30 bg-slate-900/95 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-sky-400 transition-colors hover:text-sky-300"
              aria-label="Fechar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cabeçalho */}
            <div className="mb-6 text-center">
              <div className="mb-2 text-sm font-medium text-sky-400">{phaseLabel}</div>
              <h2 className="mb-2 text-2xl font-bold text-sky-300">{monthName}</h2>
              <p className="text-xs text-sky-400">Mês #{monthNum}</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Insight */}
              <div className="space-y-2">
                <label htmlFor="insight" className="block text-sm font-medium text-sky-300">
                  Seu Insight do Mês
                </label>
                <textarea
                  id="insight"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="Escreva seu insight, reflexão ou aprendizado para este mês..."
                  disabled={isLoading}
                  className="w-full rounded-lg border border-sky-400/20 bg-slate-800/50 px-4 py-3 text-sky-100 placeholder-sky-500/60 transition-colors focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/30 disabled:opacity-50"
                  rows={5}
                />
              </div>

              {/* Erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-sky-400/30 bg-transparent px-4 py-2 font-medium text-sky-300 transition-colors hover:bg-sky-400/10 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-sky-400 bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-2 font-medium text-slate-900 transition-all hover:shadow-lg hover:shadow-sky-500/50 disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Insight'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
