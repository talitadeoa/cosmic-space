"use client";

import React, { useRef, useEffect, useState } from "react";
import { PHASES_COLORS } from "@/lib/constants/colors";
import { PHASES_CONFIG } from "@/lib/constants/config";
import { useMouseTracking } from "@/hooks";
import type { PhaseType, CellType } from "@/types/canvas";

/**
 * Desenha estrelas no fundo do canvas
 */
const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Array<{ x: number; y: number; r: number; alpha: number }>,
  color: string
) => {
  ctx.save();
  ctx.fillStyle = color;
  for (const s of stars) {
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
};

/**
 * Gera array de estrelas aleatórias
 */
const generateStars = (
  width: number,
  height: number,
  count: number
): Array<{ x: number; y: number; r: number; alpha: number }> => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.1,
    alpha: 0.2 + Math.random() * 0.8,
  }));
};

/**
 * Desenha o Sol com gradiente radial
 */
const drawSun = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
) => {
  const radius = 40;

  ctx.save();
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius * 4
  );
  gradient.addColorStop(0, PHASES_COLORS.sunGlowInner);
  gradient.addColorStop(0.2, PHASES_COLORS.sunGlowMid);
  gradient.addColorStop(1, PHASES_COLORS.sunGlowOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 25;
  ctx.shadowColor = "#e0f2fe";
  ctx.fillStyle = PHASES_COLORS.sunCore;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/**
 * Retorna intervalo de ângulo [start, end] para cada quadrante
 */
const getArcRangeForCell = (cell: CellType): [number, number] | null => {
  switch (cell) {
    case "A1":
      return [Math.PI, (3 * Math.PI) / 2];
    case "A2":
      return [(3 * Math.PI) / 2, 2 * Math.PI];
    case "B1":
      return [Math.PI / 2, Math.PI];
    case "B2":
      return [0, Math.PI / 2];
    default:
      return null;
  }
};

/**
 * Determina qual quadrante foi alcançado baseado em posição do mouse
 */
const getCellFromCoords = (x: number, y: number, centerX: number, centerY: number): CellType => {
  const top = y < centerY;
  const left = x < centerX;

  if (top && left) return "A1";
  if (top && !left) return "A2";
  if (!top && left) return "B1";
  return "B2";
};

/**
 * Desenha fase da Lua (nova, quarto crescente, cheia, quarto minguante)
 */
const drawMoonPhase = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phase: PhaseType
) => {
  ctx.save();
  ctx.translate(x, y);

  // Base escura
  ctx.fillStyle = PHASES_COLORS.moonDark;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (phase === "new") {
    ctx.restore();
    return;
  }

  // Disco iluminado
  ctx.fillStyle = PHASES_COLORS.moonLight;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (phase === "full") {
    ctx.restore();
    return;
  }

  // Meia-lua (crescente/minguante)
  ctx.fillStyle = PHASES_COLORS.moonDark;
  const offset = phase === "firstQuarter" ? -radius * 0.6 : radius * 0.6;
  ctx.beginPath();
  ctx.arc(offset, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * Desenha rótulo de texto
 */
const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  alpha: number = 1
) => {
  ctx.save();
  ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, x, y);
  ctx.restore();
};

/**
 * Desenha linhas de grid (eixos horizontal e vertical)
 */
const drawGridLines = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number
) => {
  ctx.save();
  ctx.strokeStyle = PHASES_COLORS.grid;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  ctx.restore();
};

/**
 * Desenha órbita da Terra com destaque opcional
 */
const drawEarthOrbit = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  highlightCell: CellType
) => {
  ctx.save();
  ctx.lineWidth = PHASES_CONFIG.orbit.lineWidthBase;
  ctx.strokeStyle = PHASES_COLORS.orbitBase;
  ctx.beginPath();
  ctx.arc(centerX, centerY, PHASES_CONFIG.earthOrbitRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (!highlightCell) return;

  const range = getArcRangeForCell(highlightCell);
  if (!range) return;

  ctx.save();
  ctx.lineWidth = PHASES_CONFIG.orbit.lineWidthHighlight;
  ctx.strokeStyle = PHASES_COLORS.orbitHighlight;
  ctx.shadowBlur = 12;
  ctx.shadowColor = PHASES_COLORS.orbitHighlight;
  ctx.beginPath();
  ctx.arc(centerX, centerY, PHASES_CONFIG.earthOrbitRadius, range[0], range[1]);
  ctx.stroke();
  ctx.restore();
};

/**
 * Desenha 4 fases da Lua estáticas nos quadrantes
 */
const drawStaticMoonsOnEarthOrbit = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
) => {
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(148, 163, 184, 0.9)";

  const { angles, phases, radius } = PHASES_CONFIG.staticMoons;

  for (let i = 0; i < angles.length; i++) {
    const angle = angles[i];
    const phase = phases[i];

    const x = centerX + PHASES_CONFIG.earthOrbitRadius * Math.cos(angle);
    const y = centerY + PHASES_CONFIG.earthOrbitRadius * Math.sin(angle);

    drawMoonPhase(ctx, x, y, radius, phase);
  }

  ctx.restore();
};

/**
 * Desenha Terra e Lua em movimento interativo
 */
const drawEarthAndMoon = (
  ctx: CanvasRenderingContext2D,
  earthX: number,
  earthY: number,
  moonX: number,
  moonY: number,
  highlighted: boolean
) => {
  const alphaBase = highlighted ? 1 : 0.4;
  const alphaLabels = highlighted ? 1 : 0.5;

  ctx.save();

  // Órbita da Lua ao redor da Terra
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = `rgba(125, 211, 252, ${0.3 * alphaBase})`;
  ctx.beginPath();
  ctx.arc(earthX, earthY, PHASES_CONFIG.moonOrbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Terra
  ctx.shadowBlur = highlighted ? 14 : 4;
  ctx.shadowColor = PHASES_COLORS.orbitHighlight;
  ctx.fillStyle = PHASES_COLORS.earth;
  ctx.beginPath();
  ctx.arc(earthX, earthY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  drawLabel(ctx, "Earth", earthX, earthY - 14, alphaLabels);

  // Lua
  ctx.shadowBlur = highlighted ? 16 : 5;
  ctx.shadowColor = "#bae6fd";
  ctx.fillStyle = PHASES_COLORS.moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  drawLabel(ctx, "Moon", moonX, moonY - 18, alphaLabels);

  ctx.restore();
};

export const PhasesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setDimensions] = useState({ width: 0, height: 0 });

  const stateRef = useRef({
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    stars: [] as Array<{ x: number; y: number; r: number; alpha: number }>,
    earthAngle: 0,
    moonPhase: 0,
    activeCell: null as CellType,
    segmentT: 0,
  });

  /**
   * Obtém posição da Terra na órbita
   */
  const getEarthPosition = (angle: number, centerX: number, centerY: number) => {
    const x = centerX + PHASES_CONFIG.earthOrbitRadius * Math.cos(angle);
    const y = centerY + PHASES_CONFIG.earthOrbitRadius * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Obtém posição da Lua ao redor da Terra
   */
  const getMoonPosition = (
    phase: number,
    earthPos: { x: number; y: number }
  ) => {
    const x = earthPos.x + PHASES_CONFIG.moonOrbitRadius * Math.cos(phase);
    const y = earthPos.y + PHASES_CONFIG.moonOrbitRadius * Math.sin(phase);
    return { x, y };
  };

  /**
   * Renderiza canvas completo
   */
  const draw = (ctx: CanvasRenderingContext2D) => {
    const state = stateRef.current;

    ctx.clearRect(0, 0, state.width, state.height);

    drawStars(ctx, state.stars, PHASES_COLORS.stars);
    drawSun(ctx, state.centerX, state.centerY);
    drawGridLines(ctx, state.width, state.height, state.centerX, state.centerY);
    drawEarthOrbit(ctx, state.centerX, state.centerY, state.activeCell);
    drawStaticMoonsOnEarthOrbit(ctx, state.centerX, state.centerY);

    if (state.activeCell) {
      const earthPos = getEarthPosition(
        state.earthAngle,
        state.centerX,
        state.centerY
      );
      const moonPos = getMoonPosition(state.moonPhase, earthPos);
      drawEarthAndMoon(
        ctx,
        earthPos.x,
        earthPos.y,
        moonPos.x,
        moonPos.y,
        true
      );
    }
  };

  /**
   * Atualiza estado baseado em mouse e tempo
   */
  const update = () => {
    const state = stateRef.current;

    if (!state.activeCell) return;

    const range = getArcRangeForCell(state.activeCell);
    if (!range) return;

    const [start, end] = range;

    // Interpolação suave da Terra até o quadrante
    if (state.segmentT < 1) {
      state.segmentT += PHASES_CONFIG.speed.earthSegment;
      if (state.segmentT > 1) state.segmentT = 1;
    }

    state.earthAngle = start + state.segmentT * (end - start);
    state.moonPhase += PHASES_CONFIG.speed.moonAngular;
  };

  /**
   * Handler: mouse entra em quadrante
   */
  const handleMouseMove = (x: number, y: number) => {
    const state = stateRef.current;
    const cell = getCellFromCoords(x, y, state.centerX, state.centerY);

    if (cell !== state.activeCell) {
      state.activeCell = cell;
      state.segmentT = 0;
    }
  };

  /**
   * Handler: mouse sai do canvas
   */
  const handleMouseLeave = () => {
    const state = stateRef.current;
    state.activeCell = null;
  };

  useMouseTracking(canvasRef, {
    onMove: handleMouseMove,
    onLeave: handleMouseLeave,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    const handleResize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      state.centerX = state.width / 2;
      state.centerY = state.height / 2;

      canvas.width = state.width;
      canvas.height = state.height;

      state.stars = generateStars(state.width, state.height, PHASES_CONFIG.starCount);
      setDimensions({ width: state.width, height: state.height });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let animationId: number;
    const animate = () => {
      update();
      draw(ctx);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{
        backgroundColor: "transparent",
        cursor: "crosshair",
      }}
    />
  );
};
