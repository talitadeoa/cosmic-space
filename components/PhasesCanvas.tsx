"use client";

import React, { useRef, useEffect, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

type CellType = "A1" | "A2" | "B1" | "B2" | null;
type PhaseType = "new" | "firstQuarter" | "full" | "lastQuarter";

interface Config {
  earthOrbitRadius: number;
  moonOrbitRadius: number;
  starCount: number;
  orbit: {
    lineWidthBase: number;
    lineWidthHighlight: number;
  };
  speed: {
    earthSegment: number;
    moonAngular: number;
  };
  staticMoons: {
    angles: number[];
    phases: PhaseType[];
    radius: number;
  };
}

const config: Config = {
  earthOrbitRadius: 220,
  moonOrbitRadius: 70,
  starCount: 200,
  orbit: {
    lineWidthBase: 0.8,
    lineWidthHighlight: 2,
  },
  speed: {
    earthSegment: 0.01,
    moonAngular: 0.02,
  },
  staticMoons: {
    angles: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2],
    phases: ["new", "firstQuarter", "full", "lastQuarter"],
    radius: 9,
  },
};

const colors = {
  orbitBase: "rgba(56, 189, 248, 0.25)",
  orbitHighlight: "#38bdf8",
  stars: "white",
  sunGlowInner: "rgba(255, 255, 255, 0.95)",
  sunGlowMid: "rgba(190, 235, 255, 0.9)",
  sunGlowOuter: "rgba(15, 23, 42, 0)",
  sunCore: "#f9fafb",
  earth: "rgba(14, 165, 233, 1)",
  moon: "rgba(224, 242, 254, 1)",
  label: "rgba(229, 231, 235, 1)",
  grid: "rgba(148, 163, 184, 0.25)",
  moonDark: "rgba(15,23,42,0.95)",
  moonLight: "rgba(248,250,252,0.95)",
};

export const PhasesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const stateRef = useRef({
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    stars: [] as Star[],
    earthAngle: 0,
    moonPhase: 0,
    activeCell: null as CellType,
    segmentT: 0,
    lastTime: 0,
  });

  const generateStars = (width: number, height: number): Star[] => {
    return Array.from({ length: config.starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1,
      alpha: 0.2 + Math.random() * 0.8,
    }));
  };

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    stars: Star[]
  ) => {
    ctx.save();
    ctx.fillStyle = colors.stars;

    for (const s of stars) {
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  };

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
    gradient.addColorStop(0, colors.sunGlowInner);
    gradient.addColorStop(0.2, colors.sunGlowMid);
    gradient.addColorStop(1, colors.sunGlowOuter);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#e0f2fe";
    ctx.fillStyle = colors.sunCore;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawEarthOrbit = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    highlightCell: CellType
  ) => {
    ctx.save();
    ctx.lineWidth = config.orbit.lineWidthBase;
    ctx.strokeStyle = colors.orbitBase;
    ctx.beginPath();
    ctx.arc(centerX, centerY, config.earthOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (!highlightCell) return;

    const range = getArcRangeForCell(highlightCell);
    if (!range) return;

    ctx.save();
    ctx.lineWidth = config.orbit.lineWidthHighlight;
    ctx.strokeStyle = colors.orbitHighlight;
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors.orbitHighlight;
    ctx.beginPath();
    ctx.arc(centerX, centerY, config.earthOrbitRadius, range[0], range[1]);
    ctx.stroke();
    ctx.restore();
  };

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

  const getCellFromCoords = (x: number, y: number): CellType => {
    const state = stateRef.current;
    const top = y < state.centerY;
    const left = x < state.centerX;

    if (top && left) return "A1";
    if (top && !left) return "A2";
    if (!top && left) return "B1";
    return "B2";
  };

  const getEarthPosition = (
    angle: number,
    centerX: number,
    centerY: number
  ) => {
    const x = centerX + config.earthOrbitRadius * Math.cos(angle);
    const y = centerY + config.earthOrbitRadius * Math.sin(angle);
    return { x, y, angle };
  };

  const getMoonPosition = (
    phase: number,
    earthPos: { x: number; y: number }
  ) => {
    const x = earthPos.x + config.moonOrbitRadius * Math.cos(phase);
    const y = earthPos.y + config.moonOrbitRadius * Math.sin(phase);
    return { x, y };
  };

  const drawMoonPhase = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    phase: PhaseType
  ) => {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = colors.moonDark;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (phase === "new") {
      ctx.restore();
      return;
    }

    ctx.fillStyle = colors.moonLight;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (phase === "full") {
      ctx.restore();
      return;
    }

    ctx.fillStyle = colors.moonDark;
    const offset =
      phase === "firstQuarter" ? -radius * 0.6 : radius * 0.6;
    ctx.beginPath();
    ctx.arc(offset, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawStaticMoonsOnEarthOrbit = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ) => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(148, 163, 184, 0.9)";

    const { angles, phases, radius } = config.staticMoons;

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const phase = phases[i];

      const x = centerX + config.earthOrbitRadius * Math.cos(angle);
      const y = centerY + config.earthOrbitRadius * Math.sin(angle);

      drawMoonPhase(ctx, x, y, radius, phase);
    }

    ctx.restore();
  };

  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    align: CanvasTextAlign = "center",
    baseline: CanvasTextBaseline = "bottom",
    alpha: number = 1
  ) => {
    ctx.save();
    ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const drawGridLines = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number
  ) => {
    ctx.save();
    ctx.strokeStyle = colors.grid;
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

  const drawEarthAndMoon = (
    ctx: CanvasRenderingContext2D,
    earthPos: { x: number; y: number },
    moonPos: { x: number; y: number },
    highlighted: boolean
  ) => {
    const alphaBase = highlighted ? 1 : 0.4;
    const alphaLabels = highlighted ? 1 : 0.5;

    ctx.save();

    ctx.lineWidth = 0.7;
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.3 * alphaBase})`;
    ctx.beginPath();
    ctx.arc(
      earthPos.x,
      earthPos.y,
      config.moonOrbitRadius,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.shadowBlur = highlighted ? 14 : 4;
    ctx.shadowColor = colors.orbitHighlight;
    ctx.fillStyle = colors.earth;
    ctx.beginPath();
    ctx.arc(earthPos.x, earthPos.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    drawLabel(
      ctx,
      "Earth",
      earthPos.x,
      earthPos.y - 14,
      "center",
      "bottom",
      alphaLabels
    );

    ctx.shadowBlur = highlighted ? 16 : 5;
    ctx.shadowColor = "#bae6fd";
    ctx.fillStyle = colors.moon;
    ctx.beginPath();
    ctx.arc(moonPos.x, moonPos.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    drawLabel(
      ctx,
      "Moon",
      moonPos.x,
      moonPos.y - 18,
      "center",
      "bottom",
      alphaLabels
    );

    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const state = stateRef.current;

    ctx.clearRect(0, 0, state.width, state.height);

    drawBackground(ctx, state.stars);
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
      drawEarthAndMoon(ctx, earthPos, moonPos, true);
    }
  };

  const update = () => {
    const state = stateRef.current;

    if (!state.activeCell) return;

    const range = getArcRangeForCell(state.activeCell);
    if (!range) return;

    const [start, end] = range;

    if (state.segmentT < 1) {
      state.segmentT += config.speed.earthSegment;
      if (state.segmentT > 1) state.segmentT = 1;
    }

    state.earthAngle = start + state.segmentT * (end - start);
    state.moonPhase += config.speed.moonAngular;
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const state = stateRef.current;
    const cell = getCellFromCoords(x, y);

    if (cell !== state.activeCell) {
      state.activeCell = cell;
      state.segmentT = 0;
    }
  };

  const handleMouseLeave = () => {
    const state = stateRef.current;
    state.activeCell = null;
  };

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

      state.stars = generateStars(state.width, state.height);
      setDimensions({ width: state.width, height: state.height });
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove as EventListener);
    canvas.addEventListener("mouseleave", handleMouseLeave as EventListener);

    handleResize();

    const animate = () => {
      update();
      draw(ctx);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove as EventListener);
      canvas.removeEventListener(
        "mouseleave",
        handleMouseLeave as EventListener
      );
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
