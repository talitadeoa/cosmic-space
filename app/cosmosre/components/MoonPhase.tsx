"use client";

import React from "react";
import { motion, Transition } from "framer-motion";

export type MoonPhaseType =
  | "nova"
  | "crescenteCrescente"
  | "quarto_crescente"
  | "gibosaCheia"
  | "cheia"
  | "gibosaMinguante"
  | "quarto_minguante"
  | "crescenteMinguante";

export interface MoonPhaseProps {
  phase: MoonPhaseType;
  size?: "sm" | "md" | "lg";
  className?: string;
  interactive?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void;
  floatOffset?: number;
}

const floatTransition: Transition = {
  duration: 4.5,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
};

const sizeToClass: Record<"sm" | "md" | "lg", string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
};

const phaseLabels: Record<MoonPhaseType, string> = {
  nova: "Nova",
  crescenteCrescente: "Crescente Crescente",
  quarto_crescente: "Quarto Crescente",
  gibosaCheia: "Gibosa Cheia",
  cheia: "Cheia",
  gibosaMinguante: "Gibosa Minguante",
  quarto_minguante: "Quarto Minguante",
  crescenteMinguante: "Crescente Minguante",
};

export const MoonPhase: React.FC<MoonPhaseProps> = ({
  phase,
  size = "md",
  className = "",
  interactive = false,
  onClick,
  floatOffset = 0,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const renderMoonPhase = () => {
    const baseClasses =
      "w-full h-full rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400";

    switch (phase) {
      case "nova":
        return (
          <div
            className={`${baseClasses} shadow-[0_0_24px_rgba(148,163,184,0.3)] relative`}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(30,41,59,0.9), rgba(100,116,139,0.9))",
              boxShadow:
                "0 0 24px rgba(148,163,184,0.3), inset -2px -2px 8px rgba(0,0,0,0.5)",
            }}
          />
        );

      case "crescenteCrescente":
        return (
          <div className={baseClasses}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, 
                  rgba(30,41,59,0.95) 0deg,
                  rgba(30,41,59,0.95) 90deg,
                  rgba(148,163,184,0.9) 90deg,
                  rgba(148,163,184,0.9) 180deg,
                  rgba(30,41,59,0.95) 180deg,
                  rgba(30,41,59,0.95) 360deg)`,
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.6), inset -1px -1px 6px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        );

      case "quarto_crescente":
        return (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(30,41,59,0.9) 50%, rgba(148,163,184,0.9) 50%)",
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.7), inset -2px -2px 8px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        );

      case "gibosaCheia":
        return (
          <div className={baseClasses}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, 
                  rgba(30,41,59,0.5) 0deg,
                  rgba(30,41,59,0.5) 45deg,
                  rgba(148,163,184,0.95) 45deg,
                  rgba(148,163,184,0.95) 315deg,
                  rgba(30,41,59,0.5) 315deg,
                  rgba(30,41,59,0.5) 360deg)`,
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.8), inset -1px -1px 6px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );

      case "cheia":
        return (
          <div
            className={`${baseClasses} shadow-[0_0_24px_rgba(148,163,184,0.9)]`}
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(226,232,240,0.95), rgba(148,163,184,0.9))",
              boxShadow:
                "0 0 24px rgba(148,163,184,0.9), inset -1px -1px 4px rgba(0,0,0,0.2)",
            }}
          />
        );

      case "gibosaMinguante":
        return (
          <div className={baseClasses}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, 
                  rgba(148,163,184,0.95) 0deg,
                  rgba(148,163,184,0.95) 45deg,
                  rgba(30,41,59,0.5) 45deg,
                  rgba(30,41,59,0.5) 315deg,
                  rgba(148,163,184,0.95) 315deg,
                  rgba(148,163,184,0.95) 360deg)`,
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.8), inset -1px -1px 6px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );

      case "quarto_minguante":
        return (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(148,163,184,0.9) 50%, rgba(30,41,59,0.9) 50%)",
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.7), inset -2px -2px 8px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        );

      case "crescenteMinguante":
        return (
          <div className={baseClasses}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, 
                  rgba(148,163,184,0.9) 0deg,
                  rgba(148,163,184,0.9) 90deg,
                  rgba(30,41,59,0.95) 90deg,
                  rgba(30,41,59,0.95) 180deg,
                  rgba(148,163,184,0.9) 180deg,
                  rgba(148,163,184,0.9) 360deg)`,
                boxShadow:
                  "0 0 24px rgba(148,163,184,0.6), inset -1px -1px 6px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} shadow-[0_0_24px_rgba(148,163,184,0.9)]`}
          />
        );
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center transition-shadow relative group",
        sizeToClass[size],
        interactive && "cursor-pointer hover:shadow-[0_0_55px_rgba(255,255,255,0.9)]",
        !interactive && "cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{
        y: 0,
        scale: 1,
      }}
      animate={{
        y: [0 + floatOffset, -10 + floatOffset, 0 + floatOffset],
        scale: 1,
      }}
      transition={floatTransition}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      title={phaseLabels[phase]}
    >
      {renderMoonPhase()}
      {interactive && (
        <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap">
          {phaseLabels[phase]}
        </div>
      )}
    </motion.div>
  );
};
