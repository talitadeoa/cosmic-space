"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type SphereId =
  | "galaxy"
  | "lunations"
  | "solar"
  | "planets"
  | "soon1"
  | "soon2";

export interface SphereConfig {
  id: SphereId;
  label: string;
  accent: string;
  floatAnimation: "float-slow" | "float-medium" | "float-fast";
}

interface SphereProps {
  config: SphereConfig;
  onClick: (id: SphereId) => void;
}

/**
 * Componente visual da esfera flutuante na grade inicial.
 * Usa framer-motion para micro animações de hover/tap.
 */
export function Sphere({ config, onClick }: SphereProps) {
  return (
    <motion.button
      type="button"
      aria-label={config.label}
      onClick={() => onClick(config.id)}
      className="group flex flex-col items-center gap-2 sm:gap-3 focus-visible:outline-none"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      layoutId={config.id}
    >
      <div
        className={`relative h-20 sm:h-28 w-20 sm:w-28 rounded-full bg-gradient-to-br from-indigo-400/70 via-sky-400/80 to-rose-400/80 shadow-lg sm:shadow-2xl shadow-indigo-500/40 ${config.floatAnimation}`}
      >
        {/* Halo externo suave */}
        <div className="absolute inset-0 rounded-full bg-indigo-300/10 blur-2xl" />

        {/* Núcleo */}
        <div className="absolute inset-[18%] rounded-full bg-black/70 backdrop-blur" />

        {/* Brilho interno */}
        <div
          className="absolute inset-[28%] rounded-full opacity-80"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${config.accent}, transparent 55%)`
          }}
        />

        {/* Anel girando lentamente */}
        <div className="pointer-events-none absolute inset-0 animate-spin-slow rounded-full border border-white/10" />
      </div>
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300/90 leading-tight">
        {config.label}
      </span>
    </motion.button>
  );
}

interface FocusSphereProps {
  config: SphereConfig;
  children: ReactNode;
  onBack: () => void;
}

/**
 * Esfera em foco central com conteúdo associado.
 * Usa layoutId compartilhado para transição suave da esfera da grade para o centro.
 */
export function FocusSphere({ config, children, onBack }: FocusSphereProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-xl overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-label={config.label}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.2),transparent_55%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.16),transparent_55%)]" />

      <motion.div
        className="relative flex w-full max-w-5xl flex-col gap-4 sm:gap-6 px-4 py-6 sm:py-8 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-indigo-200/80">
              Esfera em foco
            </p>
            <h2 className="mt-2 text-lg sm:text-xl font-semibold md:text-2xl">
              {config.label}
            </h2>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center rounded-full border border-slate-600/70 bg-black/40 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm shadow-black/40 transition hover:border-indigo-400 hover:bg-indigo-500/20 whitespace-nowrap"
          >
            ← Voltar
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-stretch">
          <motion.div
            className="relative flex items-center justify-center md:w-1/3"
            layoutId={config.id}
          >
            <div className="relative h-32 sm:h-40 w-32 sm:w-40 rounded-full bg-gradient-to-br from-indigo-400 via-sky-400 to-rose-500 shadow-lg sm:shadow-2xl shadow-indigo-500/60">
              <div className="absolute inset-[18%] rounded-full bg-black/70 backdrop-blur" />
              <div
                className="absolute inset-[28%] rounded-full opacity-90"
                style={{
                  background: `radial-gradient(circle at 25% 18%, ${config.accent}, transparent 60%)`
                }}
              />
              <div className="pointer-events-none absolute inset-0 animate-spin-slow rounded-full border border-white/15" />
              <div className="pointer-events-none absolute inset-[6%] animate-pulse-soft rounded-full border border-indigo-200/20" />
            </div>
          </motion.div>

          <div className="md:w-2/3">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/70 bg-black/60 p-3 sm:p-4 shadow-xl shadow-black/60">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
