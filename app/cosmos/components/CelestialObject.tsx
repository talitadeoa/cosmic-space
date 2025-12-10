"use client";

import React from "react";
import { motion, Transition } from "framer-motion";
import type { CelestialSize, CelestialType } from "../types";

const motionFloat: Transition = {
  duration: 4.6,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
};

const containerBase =
  "relative isolate overflow-visible flex items-center justify-center rounded-full";

const ringOutline =
  "pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10";

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
  sunGlowInner: "rgba(255, 248, 237, 0.98)",
  sunGlowMid: "rgba(253, 224, 125, 0.65)",
  sunGlowOuter: "rgba(249, 168, 38, 0)",
  sunCore: "#fff9ed",
};

/**
 * Desenha o Sol em um contexto 2D de canvas. - opções extras (radius, colors)
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
    radius * 0.35,
    centerX,
    centerY,
    radius * 3.3,
  );
  gradient.addColorStop(0, colors.sunGlowInner);
  gradient.addColorStop(0.35, colors.sunGlowMid);
  gradient.addColorStop(0.72, "rgba(251, 191, 36, 0.22)");
  gradient.addColorStop(1, colors.sunGlowOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // Halo brilhante
  ctx.globalCompositeOperation = "lighter";
  ctx.filter = "blur(16px)";
  ctx.strokeStyle = "rgba(252, 211, 77, 0.18)";
  ctx.lineWidth = radius * 0.22;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";

  // Núcleo do Sol
  const coreGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius,
  );
  coreGradient.addColorStop(0, colors.sunCore);
  coreGradient.addColorStop(0.58, "#fde68a");
  coreGradient.addColorStop(1, "#f6c452");

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Anel quente no contorno
  ctx.strokeStyle = "rgba(252, 211, 77, 0.42)";
  ctx.lineWidth = radius * 0.18;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.08, 0, Math.PI * 2);
  ctx.stroke();

  // Textura leve de plasma
  const spots = [
    { x: -0.22, y: -0.18, r: 0.14, a: 0.24 },
    { x: 0.18, y: -0.12, r: 0.12, a: 0.2 },
    { x: -0.12, y: 0.16, r: 0.1, a: 0.16 },
    { x: 0.22, y: 0.18, r: 0.13, a: 0.18 },
  ];

  spots.forEach(({ x, y, r, a }) => {
    const sx = centerX + x * radius * 1.6;
    const sy = centerY + y * radius * 1.6;
    const sr = radius * r;
    const spotGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 1.8);
    spotGradient.addColorStop(0, `rgba(255, 241, 220, ${a + 0.08})`);
    spotGradient.addColorStop(0.45, `rgba(251, 191, 36, ${a})`);
    spotGradient.addColorStop(1, "rgba(232, 121, 0, 0)");
    ctx.fillStyle = spotGradient;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Destaque central
  ctx.shadowColor = "rgba(255, 255, 255, 0.72)";
  ctx.shadowBlur = radius * 0.48;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const SunCanvas: React.FC<{ size: CelestialSize }> = ({ size }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssSize = sizeToPixels[size];
    // Canvas maior que o container para não cortar o glow (mas sem exagerar no tamanho)
    const logicalSize = cssSize * 2.1;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalSize, logicalSize);

    const radius = logicalSize * 0.26;
    drawSun(ctx, logicalSize / 2, logicalSize / 2, { radius });
  }, [size]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      <canvas ref={canvasRef} className="overflow-visible" aria-hidden />
    </div>
  );
};

// Constantes para reutilização de estilos
const SHARED_ROUNDED = "rounded-full";
const SHARED_OVERFLOW = "overflow-visible";
const SHARED_ABSOLUTE = "absolute inset-0";

const CELESTIAL_STYLES: Record<CelestialType, string> = {
  sol: "bg-[radial-gradient(circle_at_38%_34%,#fffaf0_16%,#ffe3a3_48%,#f9b756_72%,#f59a2c_100%)] shadow-[0_0_34px_rgba(249,168,38,0.55)] ring-1 ring-amber-100/60 before:absolute before:-inset-[26%] before:-z-10 before:rounded-full before:blur-[22px] before:content-[''] before:opacity-85 before:bg-[radial-gradient(circle_at_center,rgba(255,245,224,0.85)_0%,rgba(251,191,36,0.55)_42%,rgba(234,88,12,0.12)_100%)] after:absolute after:-inset-[18%] after:-z-20 after:rounded-full after:content-[''] after:opacity-85 after:blur-[10px] after:bg-[conic-gradient(from_32deg,rgba(255,255,255,0.18)_0deg,rgba(253,224,138,0.26)_120deg,rgba(248,153,62,0.2)_210deg,rgba(255,255,255,0.18)_360deg)] after:animate-[spin_38s_linear_infinite]",
  solTrocoidal:
    "bg-[#f9fafb] shadow-[0_0_30px_rgba(224,242,254,0.9)] ring-2 ring-sky-50/70 before:absolute before:-inset-[70%] before:-z-10 before:rounded-full before:opacity-90 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(190,235,255,0.9)_24%,rgba(15,23,42,0)_100%)] after:absolute after:-inset-[45%] after:-z-20 after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.55)_0%,rgba(14,165,233,0.28)_42%,rgba(8,47,73,0)_100%)]",
  lua: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_24px_rgba(148,163,184,0.9)]",
  luaNova:
    "bg-[radial-gradient(circle_at_30%_30%,rgba(30,41,59,0.9),rgba(100,116,139,0.9))] shadow-[0_0_18px_rgba(148,163,184,0.5)]",
  luaCrescente:
    "bg-[radial-gradient(circle_at_48%_52%,#0f172a_35%,#111827_65%,#0b1220_82%,#030712_100%)] shadow-[0_0_24px_rgba(148,163,184,0.65)] before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_78%_50%,rgba(226,232,240,0.96)_0%,rgba(203,213,225,0.85)_18%,rgba(148,163,184,0.5)_36%,rgba(51,65,85,0.05)_54%,rgba(15,23,42,0)_70%)] before:opacity-95 after:absolute after:-inset-[14%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_32%_50%,rgba(15,23,42,0.55)_0%,rgba(15,23,42,0)_60%)] after:mix-blend-soft-light after:opacity-75",
  luaCheia:
    "bg-[radial-gradient(circle_at_35%_35%,rgba(226,232,240,0.95),rgba(148,163,184,0.9))] shadow-[0_0_24px_rgba(148,163,184,0.9)]",
  luaMinguante:
    "bg-[radial-gradient(circle_at_52%_52%,#0f172a_35%,#111827_65%,#0b1220_82%,#030712_100%)] shadow-[0_0_24px_rgba(148,163,184,0.65)] before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_22%_50%,rgba(226,232,240,0.96)_0%,rgba(203,213,225,0.85)_18%,rgba(148,163,184,0.5)_36%,rgba(51,65,85,0.05)_54%,rgba(15,23,42,0)_70%)] before:opacity-95 after:absolute after:-inset-[14%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_68%_50%,rgba(15,23,42,0.55)_0%,rgba(15,23,42,0)_60%)] after:mix-blend-soft-light after:opacity-75",
  planeta:
    "bg-gradient-to-br from-sky-300 via-indigo-400 to-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.45)] ring-2 ring-white/20",
  galaxia:
    "bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.55),rgba(147,51,234,0.26),rgba(59,7,100,0.12))] shadow-[0_0_36px_rgba(168,85,247,0.32)] backdrop-blur-[2px]",
  anel:
    "bg-gradient-to-br from-slate-200/90 via-slate-300/90 to-slate-50/70 ring-2 ring-sky-200/60 shadow-[0_0_22px_rgba(186,230,253,0.75)]",
  eclipse:
    "bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.95),rgba(30,41,59,0.8),rgba(15,23,42,0.5))] ring-2 ring-amber-200/30 shadow-[0_0_24px_rgba(251,191,36,0.35)]",
};

type CelestialObjectProps = {
  type: CelestialType;
  size?: CelestialSize;
  className?: string;
  interactive?: boolean;
  floatOffset?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  pulseOnMount?: boolean;
};

const mergeClasses = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const buildMotionConfig = (pulseOnMount: boolean, floatOffset: number) => {
  const floatKeyframes = [floatOffset - 4, floatOffset + 4];

  if (!pulseOnMount) {
    return {
      initial: { y: floatKeyframes[0] },
      animate: { y: floatKeyframes },
      transition: { y: motionFloat },
    };
  }

  return {
    initial: { opacity: 0, scale: 0.92, y: floatKeyframes[0] },
    animate: { opacity: 1, scale: 1, y: floatKeyframes },
    transition: {
      opacity: { duration: 0.35, ease: "easeOut" },
      scale: { duration: 0.35, ease: "easeOut" },
      y: motionFloat,
    },
  };
};

export const CelestialObject: React.FC<CelestialObjectProps> = ({
  type,
  size = "md",
  className = "",
  interactive = false,
  floatOffset = 0,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  pulseOnMount = true,
}) => {
  const isSun = type === "sol";

  const { initial, animate, transition } = React.useMemo(
    () => buildMotionConfig(pulseOnMount, floatOffset),
    [floatOffset, pulseOnMount],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onClick?.(event);
    },
    [onClick],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!onDrop) return;
      event.preventDefault();
      event.stopPropagation();
      onDrop(event);
    },
    [onDrop],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!onDragOver) return;
      event.preventDefault();
      onDragOver(event);
    },
    [onDragOver],
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      onDragLeave?.(event);
    },
    [onDragLeave],
  );

  return (
    <motion.div
      className={mergeClasses(
        containerBase,
        sizeToClass[size],
        interactive && "cursor-pointer",
        className,
      )}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
    >
      <div
        className={[
          "absolute inset-0 overflow-visible rounded-full",
          CELESTIAL_STYLES[type],
        ].join(" ")}
      />

      {isSun ? <SunCanvas size={size} /> : null}

      <div className={ringOutline} />
    </motion.div>
  );
};
