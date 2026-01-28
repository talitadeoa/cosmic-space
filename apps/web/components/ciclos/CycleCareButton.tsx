'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCycle } from '@/hooks/useCycle';
import CycleJourney from './CycleJourney';

// ═══════════════════════════════════════════════════════════════════
// 🌸 CYCLE CARE BUTTON - Entrada gentil para a jornada do ciclo
// ═══════════════════════════════════════════════════════════════════

interface CycleCareButtonProps {
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
}

const RHYTHM_LABELS = {
  light: { emoji: '🌊', label: 'Suave' },
  moderate: { emoji: '🌊🌊', label: 'Fluindo' },
  heavy: { emoji: '🌊🌊🌊', label: 'Intenso' },
};

export default function CycleCareButton({ 
  className = '', 
  variant = 'full' 
}: CycleCareButtonProps) {
  const [showJourney, setShowJourney] = useState(false);
  const { lastCycle, isSyncing } = useCycle();

  // Calcular dias desde último registro
  const daysSince = lastCycle
    ? Math.floor(
        (new Date().getTime() - new Date(lastCycle.date).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleComplete = () => {
    setShowJourney(false);
  };

  // ─────── Variant: Minimal (só ícone) ───────
  if (variant === 'minimal') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowJourney(true)}
          className={`
            w-12 h-12 rounded-full
            bg-gradient-to-br from-rose-500/20 to-pink-500/20
            border border-rose-400/30 hover:border-rose-400/60
            flex items-center justify-center
            shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25
            transition-all duration-300
            ${className}
          `}
        >
          <span className="text-xl">🌸</span>
        </motion.button>

        <AnimatePresence>
          {showJourney && (
            <CycleJourney 
              onComplete={handleComplete} 
              onClose={() => setShowJourney(false)} 
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ─────── Variant: Compact (botão + status mínimo) ───────
  if (variant === 'compact') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowJourney(true)}
          className={`
            px-4 py-3 rounded-2xl
            bg-gradient-to-r from-rose-500/15 to-pink-500/15
            border border-rose-400/30 hover:border-rose-400/50
            flex items-center justify-between gap-3
            shadow-lg shadow-rose-500/5 hover:shadow-rose-500/15
            transition-all duration-300
            ${className}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌸</span>
            <div className="text-left">
              <p className="text-sm font-medium text-rose-100">Cuidar do ciclo</p>
              {daysSince !== null && (
                <p className="text-xs text-rose-300/60">
                  Último: há {daysSince} {daysSince === 1 ? 'dia' : 'dias'}
                </p>
              )}
            </div>
          </div>
          
          {lastCycle && (
            <span className="text-lg opacity-70">
              {RHYTHM_LABELS[lastCycle.flowIntensity as keyof typeof RHYTHM_LABELS]?.emoji}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showJourney && (
            <CycleJourney 
              onComplete={handleComplete} 
              onClose={() => setShowJourney(false)} 
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ─────── Variant: Full (card completo com status) ───────
  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className={`
          rounded-3xl overflow-hidden
          bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-pink-950/40
          border border-rose-400/20 hover:border-rose-400/40
          shadow-xl shadow-rose-500/5 hover:shadow-rose-500/15
          transition-all duration-300
          ${className}
        `}
      >
        {/* Header decorativo */}
        <div className="relative h-16 bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-purple-500/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl opacity-80"
            >
              🌸
            </motion.span>
          </div>
          {/* Onda decorativa */}
          <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 20" preserveAspectRatio="none">
            <path
              d="M0,20 Q100,0 200,10 T400,20 L400,20 L0,20 Z"
              fill="currentColor"
              className="text-rose-950/40"
            />
          </svg>
        </div>

        <div className="p-5">
          {/* Status do último ciclo */}
          {lastCycle && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-300/60 mb-0.5">Último registro</p>
                  <p className="text-sm font-medium text-rose-100">
                    {new Date(lastCycle.date).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    <span className="text-rose-300/50 ml-2 font-normal">
                      {daysSince === 0 ? 'hoje' : daysSince === 1 ? 'ontem' : `há ${daysSince} dias`}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSyncing && <span className="text-xs text-rose-300/40">↻</span>}
                  <span className="text-xl">
                    {RHYTHM_LABELS[lastCycle.flowIntensity as keyof typeof RHYTHM_LABELS]?.emoji}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Call to action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJourney(true)}
            className="
              w-full py-3.5 rounded-2xl
              bg-gradient-to-r from-rose-500 to-pink-500
              text-white font-medium
              shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40
              transition-all duration-300
              flex items-center justify-center gap-2
            "
          >
            <span>Cuidar do meu ciclo</span>
            <span className="text-lg">💜</span>
          </motion.button>

          {/* Mensagem acolhedora */}
          <p className="mt-4 text-center text-xs text-rose-200/40">
            Seu ritmo, sua sabedoria 🌙
          </p>
        </div>
      </motion.div>

      {/* Modal da Jornada */}
      <AnimatePresence>
        {showJourney && (
          <CycleJourney 
            onComplete={handleComplete} 
            onClose={() => setShowJourney(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
