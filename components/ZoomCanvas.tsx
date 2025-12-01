"use client";

import React, { useRef, useEffect, useState } from "react";

interface Moon {
  orbitRadius: number;
  size: number;
  periodDays: number;
  angleOffset: number;
  worldX?: number;
  worldY?: number;
  screenX?: number;
  screenY?: number;
  planet?: Planet;
}

interface Planet {
  name: string;
  radius: number;
  size: number;
  periodDays: number;
  angleOffset: number;
  color: string;
  spinAngle: number;
  moons: Moon[];
  worldX?: number;
  worldY?: number;
  screenX?: number;
  screenY?: number;
}

interface FocusedTarget {
  type: "sun" | "planet" | "moon";
  target: Planet | Moon | null;
}

const createMoonsForPlanet = (baseSize: number): Moon[] => [
  {
    orbitRadius: baseSize * 3.0,
    size: baseSize * 0.6,
    periodDays: 30,
    angleOffset: 0,
  },
  {
    orbitRadius: baseSize * 4.2,
    size: baseSize * 0.5,
    periodDays: 55,
    angleOffset: 1.5,
  },
  {
    orbitRadius: baseSize * 5.4,
    size: baseSize * 0.4,
    periodDays: 85,
    angleOffset: 3.1,
  },
  {
    orbitRadius: baseSize * 6.2,
    size: baseSize * 0.5,
    periodDays: 120,
    angleOffset: 4.0,
  },
];

const PLANETS: Planet[] = [
  {
    name: "Mercury",
    radius: 80,
    size: 5,
    periodDays: 88,
    angleOffset: 0,
    color: "#b3b3b3",
    spinAngle: 0,
    moons: createMoonsForPlanet(5),
  },
  {
    name: "Earth",
    radius: 140,
    size: 7,
    periodDays: 365,
    angleOffset: 1,
    color: "#4fa5ff",
    spinAngle: 0,
    moons: createMoonsForPlanet(7),
  },
  {
    name: "Jupiter",
    radius: 220,
    size: 11,
    periodDays: 4333,
    angleOffset: 2,
    color: "#f2a65a",
    spinAngle: 0,
    moons: createMoonsForPlanet(11),
  },
  {
    name: "Saturn",
    radius: 280,
    size: 9,
    periodDays: 10759,
    angleOffset: 0.7,
    color: "#f5d28a",
    spinAngle: 0,
    moons: createMoonsForPlanet(9),
  },
];

const SUN_RADIUS = 20;

export const ZoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const stateRef = useRef({
    time: 0,
    zoom: 1,
    targetZoom: 1,
    camX: 0,
    camY: 0,
    targetCamX: 0,
    targetCamY: 0,
    sunSpinAngle: 0,
    focusedTarget: null as FocusedTarget | null,
    sunScreenX: 0,
    sunScreenY: 0,
    startTime: performance.now(),
  });

  const DAYS_PER_SECOND = 0.01;

  const shadeColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    r = Math.min(255, Math.max(0, r + (255 * percent) / 100));
    g = Math.min(255, Math.max(0, g + (255 * percent) / 100));
    b = Math.min(255, Math.max(0, b + (255 * percent) / 100));

    return `rgb(${r},${g},${b})`;
  };

  const drawShadedSphere = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    baseColor: string,
    spinAngle: number
  ) => {
    const lightRadius = radius * 0.3;
    const lx = Math.cos(spinAngle) * radius * 0.5;
    const ly = Math.sin(spinAngle) * radius * 0.5;

    const gradient = ctx.createRadialGradient(
      lx,
      ly,
      lightRadius * 0.2,
      0,
      0,
      radius
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.3, baseColor);
    gradient.addColorStop(0.8, shadeColor(baseColor, -30));
    gradient.addColorStop(1, "rgba(0,0,0,0.9)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = radius * 0.15;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(0, radius * 0.3, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const cameraAtTarget = (): boolean => {
    const state = stateRef.current;
    const dz = Math.abs(state.targetZoom - state.zoom);
    const dcx = Math.abs(state.targetCamX - state.camX);
    const dcy = Math.abs(state.targetCamY - state.camY);
    return dz < 0.001 && dcx < 0.1 && dcy < 0.1;
  };

  const cameraAlmostAtTarget = (): boolean => {
    const state = stateRef.current;
    const dz = Math.abs(state.targetZoom - state.zoom);
    const dcx = Math.abs(state.targetCamX - state.camX);
    const dcy = Math.abs(state.targetCamY - state.camY);
    return dz < 0.02 && dcx < 2 && dcy < 2;
  };

  const handleCanvasClick = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const state = stateRef.current;

    let clickedPlanet: Planet | null = null;
    let clickedMoon: Moon | null = null;
    let clickedSun = false;

    const distSun = Math.hypot(clickX - state.sunScreenX, clickY - state.sunScreenY);
    if (distSun < SUN_RADIUS * state.zoom + 15) {
      clickedSun = true;
    } else {
      for (const p of PLANETS) {
        if (p.screenX === undefined || p.screenY === undefined) continue;
        const dist = Math.hypot(clickX - p.screenX, clickY - p.screenY);
        if (dist < p.size * state.zoom + 10) {
          clickedPlanet = p;
          break;
        }
      }

      if (!clickedPlanet && !clickedSun) {
        for (const p of PLANETS) {
          const isGeneralView = !state.focusedTarget;
          const isFocusedThisPlanet =
            state.focusedTarget &&
            state.focusedTarget.type !== "sun" &&
            (state.focusedTarget.target === p ||
              (state.focusedTarget.target &&
                "planet" in state.focusedTarget.target &&
                state.focusedTarget.target.planet === p));

          const moonsToCheck = isGeneralView
            ? p.moons.length > 0
              ? [p.moons[0]]
              : []
            : isFocusedThisPlanet
              ? p.moons
              : [];

          for (const moon of moonsToCheck) {
            if (moon.screenX === undefined || moon.screenY === undefined) continue;
            const distM = Math.hypot(clickX - moon.screenX, clickY - moon.screenY);
            if (distM < moon.size * state.zoom + 8) {
              clickedMoon = moon;
              break;
            }
          }
          if (clickedMoon) break;
        }
      }
    }

    if (!clickedSun && !clickedPlanet && !clickedMoon) {
      state.focusedTarget = null;
      state.targetZoom = 1;
      state.targetCamX = 0;
      state.targetCamY = 0;
      return;
    }

    if (clickedSun) {
      if (state.focusedTarget?.type === "sun") {
        state.focusedTarget = null;
        state.targetZoom = 1;
        state.targetCamX = 0;
        state.targetCamY = 0;
      } else {
        state.focusedTarget = { type: "sun", target: null };
        state.targetZoom = 4.5;
        state.targetCamX = 0;
        state.targetCamY = 0;
      }
      return;
    }

    if (clickedMoon) {
      if (
        state.focusedTarget?.type === "moon" &&
        state.focusedTarget.target === clickedMoon
      ) {
        state.focusedTarget = null;
        state.targetZoom = 1;
        state.targetCamX = 0;
        state.targetCamY = 0;
      } else {
        state.focusedTarget = { type: "moon", target: clickedMoon };
        state.targetZoom = 6;
        if (
          typeof clickedMoon.worldX === "number" &&
          typeof clickedMoon.worldY === "number"
        ) {
          state.targetCamX = -clickedMoon.worldX;
          state.targetCamY = -clickedMoon.worldY;
        }
      }
      return;
    }

    if (clickedPlanet) {
      if (
        state.focusedTarget?.type === "planet" &&
        state.focusedTarget.target === clickedPlanet
      ) {
        state.focusedTarget = null;
        state.targetZoom = 1;
        state.targetCamX = 0;
        state.targetCamY = 0;
      } else {
        state.focusedTarget = { type: "planet", target: clickedPlanet };
        state.targetZoom = 4.5;
        if (
          typeof clickedPlanet.worldX === "number" &&
          typeof clickedPlanet.worldY === "number"
        ) {
          state.targetCamX = -clickedPlanet.worldX;
          state.targetCamY = -clickedPlanet.worldY;
        }
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = stateRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(state.camX, state.camY);

    const now = performance.now();
    const elapsedSeconds = (now - state.startTime) / 1000;
    const simulatedDays = elapsedSeconds * DAYS_PER_SECOND;

    state.sunScreenX = canvas.width / 2 + (0 + state.camX) * state.zoom;
    state.sunScreenY = canvas.height / 2 + (0 + state.camY) * state.zoom;

    if (!state.focusedTarget) {
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.2 / state.zoom;
      for (const p of PLANETS) {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (!state.focusedTarget || state.focusedTarget.type === "sun") {
      ctx.save();
      drawShadedSphere(ctx, SUN_RADIUS, "#ffcc66", state.sunSpinAngle);
      ctx.restore();
    }

    for (const p of PLANETS) {
      const orbitFraction = simulatedDays / p.periodDays;
      const angle = orbitFraction * Math.PI * 2 + p.angleOffset;

      const x = Math.cos(angle) * p.radius;
      const y = Math.sin(angle) * p.radius;

      p.worldX = x;
      p.worldY = y;

      const isGeneralView = !state.focusedTarget;
      const isFocusedThisPlanet =
        state.focusedTarget &&
        state.focusedTarget.type !== "sun" &&
        (state.focusedTarget.target === p ||
          (state.focusedTarget.target &&
            "planet" in state.focusedTarget.target &&
            state.focusedTarget.target.planet === p));

      const shouldDrawPlanet = isGeneralView || isFocusedThisPlanet;

      const moonsToDraw = isGeneralView
        ? p.moons.length > 0
          ? [p.moons[0]]
          : []
        : isFocusedThisPlanet
          ? p.moons
          : [];

      if (shouldDrawPlanet && moonsToDraw.length > 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1 / state.zoom;
        for (const moon of moonsToDraw) {
          ctx.beginPath();
          ctx.arc(x, y, moon.orbitRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (shouldDrawPlanet) {
        ctx.save();
        ctx.translate(x, y);
        drawShadedSphere(ctx, p.size, p.color, p.spinAngle);
        ctx.restore();
      }

      for (const moon of moonsToDraw) {
        const mOrbitFraction = simulatedDays / moon.periodDays;
        const mAngle = mOrbitFraction * Math.PI * 2 + moon.angleOffset;

        const mx = x + Math.cos(mAngle) * moon.orbitRadius;
        const my = y + Math.sin(mAngle) * moon.orbitRadius;

        moon.worldX = mx;
        moon.worldY = my;
        moon.planet = p;

        ctx.save();
        ctx.translate(mx, my);
        drawShadedSphere(ctx, moon.size, "#d0d0d0", p.spinAngle + mAngle);
        ctx.restore();

        const moonScreenX = canvas.width / 2 + (mx + state.camX) * state.zoom;
        const moonScreenY = canvas.height / 2 + (my + state.camY) * state.zoom;
        moon.screenX = moonScreenX;
        moon.screenY = moonScreenY;
      }

      const screenX = canvas.width / 2 + (x + state.camX) * state.zoom;
      const screenY = canvas.height / 2 + (y + state.camY) * state.zoom;
      p.screenX = screenX;
      p.screenY = screenY;
    }

    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    state.zoom += (state.targetZoom - state.zoom) * 0.08;
    state.camX += (state.targetCamX - state.camX) * 0.08;
    state.camY += (state.targetCamY - state.camY) * 0.08;

    const atTarget = cameraAtTarget();
    const almostAtTarget = cameraAlmostAtTarget();

    if (!state.focusedTarget) {
      state.sunSpinAngle += 0.02;
      for (const p of PLANETS) {
        p.spinAngle += 0.02;
      }
    } else {
      if (state.focusedTarget.type === "sun") {
        if (!almostAtTarget) {
          state.sunSpinAngle += 0.2;
        }
      } else {
        for (const p of PLANETS) {
          const isFocused =
            p === state.focusedTarget.target ||
            (state.focusedTarget.target &&
              "planet" in state.focusedTarget.target &&
              state.focusedTarget.target.planet === p);
          if (isFocused) {
            if (!almostAtTarget) {
              p.spinAngle += 0.2;
            }
          }
        }
      }
    }

    draw(ctx, canvas);
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("click", handleCanvasClick as EventListener);
    resize();

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleCanvasClick as EventListener);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-pointer"
      style={{ backgroundColor: "black" }}
    />
  );
};
