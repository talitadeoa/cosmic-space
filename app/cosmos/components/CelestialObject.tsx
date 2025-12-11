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

const mergeClasses = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

// Constantes do Sol - Uniforme e consistente
const SUN_RADIUS_MULTIPLIERS = {
  glowStart: 0.35,
  glowEnd: 2.5,
  coreRadius: 1.0,
  highlightRadius: 0.45,
} as const;

// Config de cores do Sol - Paleta uniforme
export const sunColors = {
  sunGlowInner: "rgba(255, 245, 220, 0.9)",
  sunGlowMid: "rgba(254, 210, 100, 0.5)",
  sunGlowOuter: "rgba(249, 160, 30, 0.06)",
  sunCore: "#ffeaa7",
} as const;

export function drawSun(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  options: { radius?: number; colors?: typeof sunColors } = {},
) {
  const radius = options.radius ?? 40;
  const colors = options.colors ?? sunColors;

  ctx.save();

  // Glow suave e uniforme ao redor do Sol
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * SUN_RADIUS_MULTIPLIERS.glowStart,
    centerX,
    centerY,
    radius * SUN_RADIUS_MULTIPLIERS.glowEnd,
  );
  gradient.addColorStop(0, colors.sunGlowInner);
  gradient.addColorStop(0.6, colors.sunGlowMid);
  gradient.addColorStop(1, colors.sunGlowOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Destaque central - discreto e uniforme
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.beginPath();
  ctx.arc(centerX - radius * 0.12, centerY - radius * 0.12, radius * SUN_RADIUS_MULTIPLIERS.highlightRadius, 0, Math.PI * 2);
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

const SUN_RAY_INSETS: Record<CelestialSize, string> = {
  sm: "-inset-[26%]",
  md: "-inset-[22%]",
  lg: "-inset-[16%]",
};

const SUN_RAY_LAYER_CONFIGS = [
  {
    blur: "blur-[5px]",
    opacity: "opacity-70",
    animation: "animate-[spin_28s_linear_infinite]",
    gradient: "bg-[conic-gradient(from_8deg,rgba(255,237,213,0)_0deg,rgba(254,210,100,0.3)_14deg,rgba(253,180,90,0)_24deg,rgba(255,250,220,0.38)_36deg,rgba(253,170,31,0)_50deg,rgba(255,240,200,0.28)_64deg,rgba(253,180,90,0)_78deg,rgba(255,250,220,0.3)_94deg,rgba(255,237,213,0)_100deg)]",
  },
  {
    blur: "blur-[9px]",
    opacity: "opacity-50",
    animation: "animate-[spin_46s_linear_infinite]",
    gradient: "bg-[conic-gradient(from_120deg,rgba(255,255,255,0)_0deg,rgba(254,210,100,0.2)_18deg,rgba(255,255,255,0)_36deg,rgba(253,170,31,0.25)_52deg,rgba(255,255,255,0)_70deg,rgba(254,210,100,0.2)_86deg,rgba(255,255,255,0)_100deg)]",
  },
] as const;

const SunRays: React.FC<{ size: CelestialSize }> = ({ size }) => (
  <>
    {SUN_RAY_LAYER_CONFIGS.map((config, idx) => (
      <div
        key={idx}
        className={mergeClasses(
          "pointer-events-none absolute rounded-full mix-blend-screen",
          SUN_RAY_INSETS[size],
          config.blur,
          config.opacity,
          config.animation,
          config.gradient,
        )}
      />
    ))}
  </>
);

// Constantes para reutilização de estilos
const SHARED_ROUNDED = "rounded-full";

const CELESTIAL_STYLES: Record<CelestialType, string> = {
  sol: "bg-[radial-gradient(circle_at_35%_35%,#ffc840_0%,#fdaa1f_35%,#f59c00_85%)] shadow-[0_0_28px_rgba(253,170,31,0.5)] before:absolute before:-inset-[24%] before:-z-10 before:rounded-full before:blur-[20px] before:content-[''] before:opacity-85 before:bg-[radial-gradient(circle_at_center,rgba(255,245,220,0.85)_0%,rgba(254,210,100,0.45)_45%,rgba(249,160,30,0.08)_90%)] after:absolute after:-inset-[10%] after:-z-20 after:rounded-full after:content-[''] after:opacity-60 after:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_65%)]",
  solTrocoidal:
    "bg-[#f9fafb] shadow-[0_0_30px_rgba(224,242,254,0.9)] ring-2 ring-sky-50/70 before:absolute before:-inset-[70%] before:-z-10 before:rounded-full before:opacity-90 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(190,235,255,0.9)_24%,rgba(15,23,42,0)_100%)] after:absolute after:-inset-[45%] after:-z-20 after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.55)_0%,rgba(14,165,233,0.28)_42%,rgba(8,47,73,0)_100%)]",
  lua: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_24px_rgba(148,163,184,0.9)]",
  luaNova:
    "bg-[radial-gradient(circle_at_center,#0f172a_0%,#111827_50%,#0b1220_75%,#030712_100%)] shadow-[0_0_24px_rgba(148,163,184,0.65)] before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_50%_50%,rgba(226,232,240,0.3)_0%,rgba(203,213,225,0.15)_25%,rgba(148,163,184,0.05)_50%,rgba(15,23,42,0)_75%)] before:opacity-60 after:absolute after:-inset-[14%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.4)_0%,rgba(15,23,42,0)_60%)] after:mix-blend-soft-light after:opacity-50",
  luaCrescente:
    "bg-[radial-gradient(circle_at_48%_52%,#0f172a_35%,#111827_65%,#0b1220_82%,#030712_100%)] shadow-[0_0_24px_rgba(148,163,184,0.65)] before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_78%_50%,rgba(226,232,240,0.96)_0%,rgba(203,213,225,0.85)_18%,rgba(148,163,184,0.5)_36%,rgba(51,65,85,0.05)_54%,rgba(15,23,42,0)_70%)] before:opacity-95 after:absolute after:-inset-[14%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_32%_50%,rgba(15,23,42,0.55)_0%,rgba(15,23,42,0)_60%)] after:mix-blend-soft-light after:opacity-75",
  luaCheia:
    "bg-[radial-gradient(circle_at_35%_35%,#f5f5f7_0%,#e8e8f0_15%,rgba(226,232,240,0.95)_30%,rgba(203,213,225,0.88)_50%,rgba(148,163,184,0.82)_70%,rgba(100,116,139,0.75)_90%,rgba(71,85,105,0.65)_100%)] shadow-[0_0_32px_rgba(148,163,184,0.95)] ring-1 ring-slate-400/40 before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.45)_0%,rgba(241,245,250,0.3)_15%,rgba(226,232,240,0.15)_30%,rgba(148,163,184,0.05)_50%,rgba(15,23,42,0)_70%)] before:opacity-85 after:absolute after:-inset-[10%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_38%_32%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_25%,rgba(15,23,42,0.1)_50%,rgba(15,23,42,0)_75%)] after:mix-blend-overlay after:opacity-70",
  luaMinguante:
    "bg-[radial-gradient(circle_at_52%_52%,#0f172a_35%,#111827_65%,#0b1220_82%,#030712_100%)] shadow-[0_0_24px_rgba(148,163,184,0.65)] before:absolute before:-inset-[18%] before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_22%_50%,rgba(226,232,240,0.96)_0%,rgba(203,213,225,0.85)_18%,rgba(148,163,184,0.5)_36%,rgba(51,65,85,0.05)_54%,rgba(15,23,42,0)_70%)] before:opacity-95 after:absolute after:-inset-[14%] after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_68%_50%,rgba(15,23,42,0.55)_0%,rgba(15,23,42,0)_60%)] after:mix-blend-soft-light after:opacity-75",
  planeta:
    "bg-[radial-gradient(circle_at_35%_30%,#7dd3fc_0%,#60a5fa_18%,#3b82f6_35%,#2563eb_55%,#1d4ed8_75%,#1e3a8a_100%)] shadow-[0_0_32px_rgba(59,130,246,0.6)] ring-2 ring-white/30 before:absolute before:-inset-[16%] before:-z-10 before:rounded-full before:content-[''] before:bg-[radial-gradient(circle_at_55%_45%,rgba(255,255,255,0.35)_0%,rgba(148,163,184,0.15)_30%,rgba(30,41,59,0.08)_60%,rgba(15,23,42,0)_85%)] before:opacity-75 after:absolute after:-inset-[12%] after:-z-20 after:rounded-full after:content-[''] after:bg-[radial-gradient(circle_at_40%_35%,rgba(226,232,240,0.2)_0%,rgba(100,116,139,0.1)_35%,rgba(15,23,42,0)_65%)] after:mix-blend-soft-light after:opacity-60",
  galaxia:
    "bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.55),rgba(147,51,234,0.26),rgba(59,7,100,0.12))] shadow-[0_0_36px_rgba(168,85,247,0.32)] backdrop-blur-[2px]",
  anel:
    "bg-gradient-to-br from-slate-200/90 via-slate-300/90 to-slate-50/70 ring-2 ring-sky-200/60 shadow-[0_0_22px_rgba(186,230,253,0.75)]",
  eclipse:
    "bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.98),rgba(10,15,30,0.95),rgba(5,8,15,0.8))] ring-2 ring-amber-200/30 shadow-[0_0_24px_rgba(251,191,36,0.35)]",
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

const buildMotionConfig = (pulseOnMount: boolean, floatOffset: number) => {
  const floatKeyframes = [floatOffset - 4, floatOffset + 4];
  const baseConfig = {
    initial: { y: floatKeyframes[0] },
    animate: { y: floatKeyframes },
    transition: { y: motionFloat },
  };

  if (!pulseOnMount) return baseConfig;

  return {
    initial: { opacity: 0, scale: 0.92, ...baseConfig.initial },
    animate: { opacity: 1, scale: 1, ...baseConfig.animate },
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
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick?.(e);
    },
    [onClick],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onDrop?.(e);
    },
    [onDrop],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onDragOver?.(e);
    },
    [onDragOver],
  );

  const hoverScale = interactive ? { scale: 1.08 } : undefined;
  const tapScale = interactive ? { scale: 0.92 } : undefined;

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
      onDragLeave={onDragLeave}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={hoverScale}
      whileTap={tapScale}
    >
      <div className={`absolute inset-0 overflow-visible rounded-full ${CELESTIAL_STYLES[type]}`} />
      {isSun && (
        <>
          <SunCanvas size={size} />
          <SunRays size={size} />
        </>
      )}
    </motion.div>
  );
};
