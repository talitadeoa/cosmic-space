"use client";

import React, { useRef, useEffect } from "react";
import { SOLAR_ORBIT_COLORS } from "@/lib/constants/colors";
import { SOLAR_ORBIT_CONFIG } from "@/lib/constants/config";
import { drawStars, drawOrbit } from "@/lib/utils/canvasUtils";
import type { Star, Position } from "@/types/canvas";

interface SolarOrbitConfig {
  earthOrbitRadius?: number;
  moonOrbitRadius?: number;
  starCount?: number;
  moonTrailMaxPoints?: number;
}

interface CanvasState {
  time: number;
  stars: Star[];
  moonTrail: Position[];
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Componente que renderiza a órbita trocoidal da Lua ao redor da Terra,
 * que por sua vez orbita o Sol. Inclui trilha animada e efeitos de luz.
 */
export const SolarOrbitCanvas: React.FC<{ config?: SolarOrbitConfig }> = ({
  config: customConfig = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const configRef = useRef({
    earthOrbitRadius: customConfig.earthOrbitRadius ?? SOLAR_ORBIT_CONFIG.earthOrbitRadius,
    moonOrbitRadius: customConfig.moonOrbitRadius ?? SOLAR_ORBIT_CONFIG.moonOrbitRadius,
    starCount: customConfig.starCount ?? SOLAR_ORBIT_CONFIG.starCount,
    moonTrailMaxPoints: customConfig.moonTrailMaxPoints ?? 3000,
    earthAngularSpeed: SOLAR_ORBIT_CONFIG.speed.earthAngularSpeed,
    moonAngularSpeed: SOLAR_ORBIT_CONFIG.speed.moonAngularSpeed,
  });

  const stateRef = useRef<CanvasState>({
    time: 0,
    stars: [],
    moonTrail: [],
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
  });

  const generateStars = (width: number, height: number): Star[] => {
    return Array.from({ length: configRef.current.starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1,
      alpha: 0.2 + Math.random() * 0.8,
    }));
  };

  const drawSunCustom = (
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
    gradient.addColorStop(0, SOLAR_ORBIT_COLORS.sunGlowInner);
    gradient.addColorStop(0.2, SOLAR_ORBIT_COLORS.sunGlowMid);
    gradient.addColorStop(1, SOLAR_ORBIT_COLORS.sunGlowOuter);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#e0f2fe";
    ctx.fillStyle = SOLAR_ORBIT_COLORS.sunCore;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawStaticWaveRing = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ) => {
    const config = configRef.current;
    const baseRadius = config.earthOrbitRadius + 40;
    const waveAmplitude = 20;
    const waveFrequency = 16;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = SOLAR_ORBIT_COLORS.waveRing;
    ctx.beginPath();

    const steps = 720;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const offset = Math.sin(theta * waveFrequency) * waveAmplitude;
      const r = baseRadius + offset;
      const x = centerX + r * Math.cos(theta);
      const y = centerY + r * Math.sin(theta);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  };

  const drawMoonTrailLine = (
    ctx: CanvasRenderingContext2D,
    moonTrail: Position[]
  ) => {
    if (moonTrail.length < 2) return;

    ctx.save();
    ctx.lineWidth = SOLAR_ORBIT_CONFIG.orbit.lineWidthTrail;
    ctx.strokeStyle = SOLAR_ORBIT_COLORS.moonTrail;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();

    for (let i = 0; i < moonTrail.length; i++) {
      const p = moonTrail[i];
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();
    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const state = stateRef.current;
    const config = configRef.current;

    ctx.clearRect(0, 0, state.width, state.height);

    // Desenha fundo
    drawStars(ctx, state.stars, SOLAR_ORBIT_COLORS.stars);

    // Desenha Sol
    drawSunCustom(ctx, state.centerX, state.centerY);

    // Desenha órbita da Terra
    drawOrbit(
      ctx,
      state.centerX,
      state.centerY,
      config.earthOrbitRadius,
      SOLAR_ORBIT_COLORS.orbitBase,
      SOLAR_ORBIT_CONFIG.orbit.lineWidthBase,
      0.4
    );

    // Desenha anel ondulado
    drawStaticWaveRing(ctx, state.centerX, state.centerY);

    // Calcula posições
    const angleE = state.time * config.earthAngularSpeed;
    const earthX = state.centerX + config.earthOrbitRadius * Math.cos(angleE);
    const earthY = state.centerY + config.earthOrbitRadius * Math.sin(angleE);

    const angleM = state.time * config.moonAngularSpeed;
    const moonX = earthX + config.moonOrbitRadius * Math.cos(angleM);
    const moonY = earthY + config.moonOrbitRadius * Math.sin(angleM);

    // Desenha trilha
    drawMoonTrailLine(ctx, state.moonTrail);

    // Desenha Terra e Lua
    ctx.save();

    // Órbita da Lua
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
    ctx.beginPath();
    ctx.arc(earthX, earthY, config.moonOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Terra
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#38bdf8";
    ctx.fillStyle = SOLAR_ORBIT_COLORS.earth;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = SOLAR_ORBIT_COLORS.label;
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Earth", earthX, earthY - 14);

    // Lua
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#bae6fd";
    ctx.fillStyle = SOLAR_ORBIT_COLORS.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = SOLAR_ORBIT_COLORS.label;
    ctx.fillText("Moon", moonX, moonY - 18);

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const config = configRef.current;

    const handleResize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      state.centerX = state.width / 2;
      state.centerY = state.height / 2;

      canvas.width = state.width;
      canvas.height = state.height;

      state.stars = generateStars(state.width, state.height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let animationFrameId: number;

    const mainLoop = () => {
      state.time++;

      // Atualiza trilha da Lua
      const angleM = state.time * config.moonAngularSpeed;
      const angleE = state.time * config.earthAngularSpeed;
      const earthX = state.centerX + config.earthOrbitRadius * Math.cos(angleE);
      const earthY = state.centerY + config.earthOrbitRadius * Math.sin(angleE);
      const moonX = earthX + config.moonOrbitRadius * Math.cos(angleM);
      const moonY = earthY + config.moonOrbitRadius * Math.sin(angleM);

      state.moonTrail.push({ x: moonX, y: moonY });
      if (state.moonTrail.length > config.moonTrailMaxPoints) {
        state.moonTrail.shift();
      }

      draw(ctx);
      animationFrameId = requestAnimationFrame(mainLoop);
    };

    mainLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{
        backgroundColor: "transparent",
      }}
    />
  );
};
