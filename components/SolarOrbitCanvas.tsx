"use client";

import React, { useRef, useEffect } from "react";

interface Config {
  earthOrbitRadius: number;
  moonOrbitRadius: number;
  earthAngularSpeed: number;
  moonAngularSpeed: number;
  moonTrailMaxPoints: number;
  starCount: number;
  lineWidthOrbits: number;
  lineWidthTrail: number;
}

const defaultConfig: Config = {
  earthOrbitRadius: 220,
  moonOrbitRadius: 70,
  earthAngularSpeed: 0.002,
  moonAngularSpeed: 0.02,
  moonTrailMaxPoints: 3000,
  starCount: 200,
  lineWidthOrbits: 1.2,
  lineWidthTrail: 1.8,
};

interface Position {
  x: number;
  y: number;
}

interface EarthPosition extends Position {
  angleE: number;
}

interface MoonPosition extends Position {
  angleM: number;
}

export const SolarOrbitCanvas: React.FC<{ config?: Partial<Config> }> = ({
  config: customConfig = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = { ...defaultConfig, ...customConfig };
  const stateRef = useRef({
    time: 0,
    stars: [] as Array<{ x: number; y: number; r: number; alpha: number }>,
    moonTrail: [] as Array<{ x: number; y: number }>,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
  });

  // Gerar estrelas
  const generateStars = (
    width: number,
    height: number
  ): Array<{ x: number; y: number; r: number; alpha: number }> => {
    return Array.from({ length: config.starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1,
      alpha: 0.2 + Math.random() * 0.8,
    }));
  };

  // Desenhar fundo com estrelas
  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    stars: Array<{ x: number; y: number; r: number; alpha: number }>
  ) => {
    ctx.save();
    ctx.fillStyle = "white";
    for (const s of stars) {
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  };

  // Desenhar Sol
  const drawSun = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
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
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    gradient.addColorStop(0.2, "rgba(190, 235, 255, 0.9)");
    gradient.addColorStop(1, "rgba(15, 23, 42, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#e0f2fe";
    ctx.fillStyle = "#f9fafb";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Desenhar órbita da Terra
  const drawEarthOrbit = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.save();
    ctx.lineWidth = config.lineWidthOrbits;
    ctx.strokeStyle = "#38bdf8";
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, config.earthOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // Calcular posição da Terra
  const getEarthPosition = (time: number, centerX: number, centerY: number): EarthPosition => {
    const angleE = time * config.earthAngularSpeed;
    const x = centerX + config.earthOrbitRadius * Math.cos(angleE);
    const y = centerY + config.earthOrbitRadius * Math.sin(angleE);
    return { x, y, angleE };
  };

  // Calcular posição da Lua
  const getMoonPosition = (time: number, earthPos: Position): MoonPosition => {
    const angleM = time * config.moonAngularSpeed;
    const x = earthPos.x + config.moonOrbitRadius * Math.cos(angleM);
    const y = earthPos.y + config.moonOrbitRadius * Math.sin(angleM);
    return { x, y, angleM };
  };

  // Atualizar trilha da Lua
  const updateMoonTrail = (
    moonPos: Position,
    moonTrail: Array<{ x: number; y: number }>
  ) => {
    moonTrail.push({ x: moonPos.x, y: moonPos.y });
    if (moonTrail.length > config.moonTrailMaxPoints) {
      moonTrail.shift();
    }
  };

  // Desenhar trilha da Lua
  const drawMoonTrail = (
    ctx: CanvasRenderingContext2D,
    moonTrail: Array<{ x: number; y: number }>
  ) => {
    if (moonTrail.length < 2) return;

    ctx.save();
    ctx.lineWidth = config.lineWidthTrail;
    ctx.strokeStyle = "#7dd3fc";
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

  // Desenhar Terra e Lua
  const drawEarthAndMoon = (
    ctx: CanvasRenderingContext2D,
    earthPos: Position,
    moonPos: Position
  ) => {
    ctx.save();

    // Órbita pequena da Lua
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
    ctx.beginPath();
    ctx.arc(earthPos.x, earthPos.y, config.moonOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Terra
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#38bdf8";
    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath();
    ctx.arc(earthPos.x, earthPos.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Rótulo Earth
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Earth", earthPos.x, earthPos.y - 14);

    // Lua
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#bae6fd";
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.arc(moonPos.x, moonPos.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rótulo Moon
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Moon", moonPos.x, moonPos.y - 18);

    ctx.restore();
  };

  // Desenhar anel ondulado
  const drawStaticWaveRing = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const baseRadius = config.earthOrbitRadius + 40;
    const waveAmplitude = 20;
    const waveFrequency = 16;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      state.width = width;
      state.height = height;
      state.centerX = width / 2;
      state.centerY = height / 2;
      state.stars = generateStars(width, height);
    };

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;

    const animate = () => {
      state.time++;

      ctx.clearRect(0, 0, state.width, state.height);

      drawBackground(ctx, state.stars);
      drawSun(ctx, state.centerX, state.centerY);
      drawEarthOrbit(ctx, state.centerX, state.centerY);
      drawStaticWaveRing(ctx, state.centerX, state.centerY);

      const earthPos = getEarthPosition(state.time, state.centerX, state.centerY);
      const moonPos = getMoonPosition(state.time, earthPos);

      updateMoonTrail(moonPos, state.moonTrail);
      drawMoonTrail(ctx, state.moonTrail);
      drawEarthAndMoon(ctx, earthPos, moonPos);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config]);

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
