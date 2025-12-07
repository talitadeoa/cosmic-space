"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import { MoonPhase } from "../components/MoonPhase";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const SolOrbitScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let earthOrbitRadius = 0;
    let moonOrbitRadius = 0;
    let time = 0;
    let animationId: number;

    const config = {
      earthAngularSpeed: 0.0025,
      moonAngularSpeed: 0.02,
      moonTrailMaxPoints: 2200,
      starCount: 160,
      lineWidthOrbits: 1.2,
      lineWidthTrail: 1.6,
    };

    let stars: Array<{ x: number; y: number; r: number; alpha: number }> = [];
    let moonTrail: Array<{ x: number; y: number }> = [];

    const generateStars = () => {
      stars = [];
      for (let i = 0; i < config.starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.1,
          alpha: 0.2 + Math.random() * 0.8,
        });
      }
    };

    const resize = () => {
      const parentRect =
        canvas.parentElement?.getBoundingClientRect() ?? ({
          width: window.innerWidth,
          height: window.innerHeight,
        } as DOMRect);

      width = parentRect.width;
      height = parentRect.height;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;

      const minSide = Math.min(width, height);
      earthOrbitRadius = Math.max(minSide * 0.28, 120);
      moonOrbitRadius = Math.max(earthOrbitRadius * 0.32, 32);

      generateStars();
    };

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.65,
      );

      gradient.addColorStop(0, "#0b1224");
      gradient.addColorStop(0.4, "#040814");
      gradient.addColorStop(1, "#00030a");

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "white";
      for (const star of stars) {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawSun = () => {
      const radius = 42;

      ctx.save();
      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius * 4,
      );
      glow.addColorStop(0, "rgba(255,255,255,0.95)");
      glow.addColorStop(0.25, "rgba(190,235,255,0.9)");
      glow.addColorStop(1, "rgba(15,23,42,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 22;
      ctx.shadowColor = "#e0f2fe";
      ctx.fillStyle = "#f9fafb";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawEarthOrbit = () => {
      ctx.save();
      ctx.lineWidth = config.lineWidthOrbits;
      ctx.strokeStyle = "#38bdf8";
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const getEarthPosition = (t: number) => {
      const angleE = t * config.earthAngularSpeed;
      const x = centerX + earthOrbitRadius * Math.cos(angleE);
      const y = centerY + earthOrbitRadius * Math.sin(angleE);
      return { x, y, angleE };
    };

    const getMoonPosition = (t: number, earthPos: { x: number; y: number }) => {
      const angleM = t * config.moonAngularSpeed;
      const x = earthPos.x + moonOrbitRadius * Math.cos(angleM);
      const y = earthPos.y + moonOrbitRadius * Math.sin(angleM);
      return { x, y, angleM };
    };

    const updateMoonTrail = (moonPos: { x: number; y: number }) => {
      moonTrail.push({ x: moonPos.x, y: moonPos.y });
      if (moonTrail.length > config.moonTrailMaxPoints) {
        moonTrail.shift();
      }
    };

    const drawMoonTrail = () => {
      if (moonTrail.length < 2) return;
      ctx.save();
      ctx.lineWidth = config.lineWidthTrail;
      ctx.strokeStyle = "#7dd3fc";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();

      for (let i = 0; i < moonTrail.length; i++) {
        const point = moonTrail[i];
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const drawEarthAndMoon = (
      earthPos: { x: number; y: number },
      moonPos: { x: number; y: number },
    ) => {
      ctx.save();

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(125,211,252,0.35)";
      ctx.beginPath();
      ctx.arc(earthPos.x, earthPos.y, moonOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#38bdf8";
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(earthPos.x, earthPos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("Earth", earthPos.x, earthPos.y - 14);

      ctx.shadowBlur = 12;
      ctx.shadowColor = "#bae6fd";
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(moonPos.x, moonPos.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("Moon", moonPos.x, moonPos.y - 16);

      ctx.restore();
    };

    const drawStaticWaveRing = () => {
      const baseRadius = earthOrbitRadius + 36;
      const waveAmplitude = 14;
      const waveFrequency = 16;

      ctx.save();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(125,211,252,0.6)";
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

    const animate = () => {
      time += 1;

      ctx.clearRect(0, 0, width, height);
      drawBackground();
      drawSun();
      drawEarthOrbit();
      drawStaticWaveRing();

      const earthPos = getEarthPosition(time);
      const moonPos = getMoonPosition(time, earthPos);
      updateMoonTrail(moonPos);
      drawMoonTrail();
      drawEarthAndMoon(earthPos, moonPos);

      animationId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      />

      <Card
        interactive
        onClick={() => navigateTo("planetCardBelowSun")}
        className="relative z-10 flex aspect-[4/3] w-72 items-center justify-center"
      >
        <CelestialObject type="sol" size="lg" interactive={false} />
      </Card>

      {/* Lua Cheia - Top */}
      <MoonPhase
        phase="cheia"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute -top-4 left-1/2 -translate-x-1/2"
      />
      
      {/* Lua Nova - Bottom */}
      <MoonPhase
        phase="nova"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        floatOffset={3}
      />
      
      {/* Quarto Crescente - Left */}
      <MoonPhase
        phase="quarto_crescente"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute left-8 top-1/2 -translate-y-1/2"
        floatOffset={-2}
      />
      
      {/* Quarto Minguante - Right */}
      <MoonPhase
        phase="quarto_minguante"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute right-8 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
    </div>
  );
};

export default SolOrbitScreen;
