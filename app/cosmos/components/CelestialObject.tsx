"use client";

import React from "react";
import { motion, Transition } from "framer-motion";
import type { CelestialSize, CelestialType } from "../types";

export interface CelestialObjectProps {
  type: CelestialType;
  size?: CelestialSize;
  className?: string;
  interactive?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void;
  floatOffset?: number;
  pulseOnMount?: boolean;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
}

const floatTransition: Transition = {
  duration: 4.5,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
};

const sizeToClass: Record<CelestialSize, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
};

const CELESTIAL_STYLES: Record<CelestialType, string> = {
  sol: "bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 shadow-[0_0_40px_rgba(252,211,77,0.7)]",
  lua: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_24px_rgba(148,163,184,0.9)]",
  luaNova:
    "bg-[radial-gradient(circle_at_50%_55%,#111827_10%,#0f172a_55%,#020617_100%)] ring-2 ring-slate-800/70 shadow-[0_0_28px_rgba(148,163,184,0.35)]",
  luaCrescente:
    "bg-[radial-gradient(circle_at_70%_50%,#e2e8f0_0%,#e2e8f0_34%,#0f172a_46%,#020617_100%)] ring-2 ring-slate-500/70 shadow-[0_0_32px_rgba(148,163,184,0.55)]",
  luaCheia:
    "bg-[radial-gradient(circle_at_45%_40%,#f8fafc_0%,#e2e8f0_40%,#cbd5e1_70%,#94a3b8_100%)] shadow-[0_0_36px_rgba(226,232,240,0.85)] ring-2 ring-slate-100/70",
  luaMinguante:
    "bg-[radial-gradient(circle_at_30%_50%,#e2e8f0_0%,#e2e8f0_34%,#0f172a_46%,#020617_100%)] ring-2 ring-slate-500/70 shadow-[0_0_32px_rgba(148,163,184,0.55)]",
  planeta:
    "bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 shadow-[0_0_40px_rgba(56,189,248,0.8)]",
  galaxia:
    "border border-sky-300/60 bg-[conic-gradient(from_0deg,#7dd3fc,#0ea5e9,#6366f1,#7dd3fc)] shadow-[0_0_40px_rgba(56,189,248,0.7)]",
  anel:
    "border-4 border-violet-300/70 shadow-[0_0_40px_rgba(196,181,253,0.7)] bg-transparent",
  buracoNegro:
    "bg-slate-950 ring-4 ring-indigo-500/60 shadow-[0_0_40px_rgba(129,140,248,0.8)]",
};

export const CelestialObject: React.FC<CelestialObjectProps> = ({
  type,
  size = "md",
  className = "",
  interactive = false,
  onClick,
  floatOffset = 0,
  pulseOnMount = false,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const baseShape = CELESTIAL_STYLES[type];

  return (
    <motion.div
      onClick={handleClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={[
        "inline-flex items-center justify-center rounded-full transition-shadow",
        sizeToClass[size],
        baseShape,
        interactive && "cursor-pointer hover:shadow-[0_0_55px_rgba(255,255,255,0.9)]",
        !interactive && "cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{
        y: pulseOnMount ? 4 : 0,
        scale: pulseOnMount ? 0.9 : 1,
      }}
      animate={{
        y: [0 + floatOffset, -10 + floatOffset, 0 + floatOffset],
        scale: 1,
      }}
      transition={floatTransition}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
    />
  );
};
