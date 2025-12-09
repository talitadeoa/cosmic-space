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

const sizeToPixels: Record<CelestialSize, number> = {
  sm: 40,
  md: 56,
  lg: 96,
};

// Config de cores do Sol
export const sunColors = {
  sunGlowInner: "rgba(255, 255, 255, 0.95)",
  sunGlowMid: "rgba(190, 235, 255, 0.9)",
  sunGlowOuter: "rgba(15, 23, 42, 0)",
  sunCore: "#f9fafb",
};

/**
 * Desenha o Sol em um contexto 2D de canvas.
 * @param ctx contexto 2D
 * @param centerX posição X do centro
 * @param centerY posição Y do centro
 * @param options opções extras (radius, colors)
 */
export function drawSun(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  options: { radius?: number; colors?: typeof sunColors } = {},
) {
  const radius = options.radius ?? 40;
  const colors = options.colors ?? sunColors;

  ctx.save();

  // Glow ao redor do Sol
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius * 4,
  );
  gradient.addColorStop(0, colors.sunGlowInner);
  gradient.addColorStop(0.2, colors.sunGlowMid);
  gradient.addColorStop(1, colors.sunGlowOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
  ctx.fill();

  // Disco central
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#e0f2fe";
  ctx.fillStyle = colors.sunCore;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const SunCanvas: React.FC<{ size: CelestialSize }> = ({ size }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssSize = sizeToPixels[size];
    // Canvas maior que o container para não cortar o glow
    const logicalSize = cssSize * 2.2;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalSize, logicalSize);

    const radius = logicalSize * 0.24;
    drawSun(ctx, logicalSize / 2, logicalSize / 2, { radius });
  }, [size]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      <canvas ref={canvasRef} className="overflow-visible" aria-hidden />
    </div>
  );
};

const CELESTIAL_STYLES: Record<CelestialType, string> = {
  sol: "relative isolate overflow-visible bg-transparent",
  solTrocoidal:
    "relative isolate overflow-visible bg-[#f9fafb] shadow-[0_0_30px_rgba(224,242,254,0.9)] ring-2 ring-sky-50/70 before:absolute before:-inset-[70%] before:-z-10 before:rounded-full before:opacity-90 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(190,235,255,0.9)_24%,rgba(15,23,42,0)_100%)] after:absolute after:-inset-[45%] after:-z-20 after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.55)_0%,rgba(14,165,233,0.28)_42%,rgba(8,47,73,0)_100%)]",  lua: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_24px_rgba(148,163,184,0.9)]",
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
  eclipse:
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
  const isSun = type === "sol";
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
      whileTap={interactive ? { scale: 0.92 } : undefined}>
      
      {isSun ? <SunCanvas size={size} /> : null}
    </motion.div>
  );
};
