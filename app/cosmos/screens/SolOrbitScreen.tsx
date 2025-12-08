"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
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
      lineWidthOrbits: 1.2,
      lineWidthTrail: 1.6,
    };

    let moonTrail: Array<{ x: number; y: number }> = [];

    const resize = () => {
      const parentRect =
        canvas.parentElement?.getBoundingClientRect() ??
        ({
          width: window.innerWidth,
          height: window.innerHeight,
        } as DOMRect);

      // agora o canvas usa o tamanho EXATO do container quadrado
      width = parentRect.width;
      height = parentRect.height;
      canvas.width = width;
      canvas.height = height;

      centerX = width / 2;
      centerY = height / 2;

      const minSide = Math.min(width, height);

      // deixa a órbita um pouco menor para caber as fases da lua em volta
      earthOrbitRadius = Math.max(minSide * 0.28, 120);
      moonOrbitRadius = Math.max(earthOrbitRadius * 0.32, 32);
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

      // Órbita da Lua
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(125,211,252,0.35)";
      ctx.beginPath();
      ctx.arc(earthPos.x, earthPos.y, moonOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Terra
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

      // Lua
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
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      {/* Container quadrado central: tudo orbita em torno dele */}
      <div className="relative aspect-square w-[min(70vh,70vw)]">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 bg-transparent"
          aria-hidden
        />

        {/* Sol bem no centro */}
        <button
          type="button"
          onClick={() => navigateTo("planetCardBelowSun")}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          aria-label="Abrir detalhes do objeto celeste"
        >
          <CelestialObject type="sol" size="lg" interactive={false} />
        </button>

        {/* As fases da Lua ao redor do Sol */}

        {/* Lua Cheia - Topo */}
        <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
          <CelestialObject
            type="luaCheia"
            size="md"
            interactive
            onClick={(e) =>
              navigateWithFocus("luaList", { event: e, type: "luaCheia", size: "md" })
            }
          />
        </div>

        {/* Lua Crescente - Direita */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2">
          <CelestialObject
            type="luaCrescente"
            size="md"
            interactive
            onClick={(e) =>
              navigateWithFocus("luaList", { event: e, type: "luaCrescente", size: "md" })
            }
            floatOffset={-2}
          />
        </div>

        {/* Lua Nova - Base */}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
          <CelestialObject
            type="luaNova"
            size="md"
            interactive
            onClick={(e) =>
              navigateWithFocus("luaList", { event: e, type: "luaNova", size: "md" })
            }
            floatOffset={3}
          />
        </div>

        {/* Lua Minguante - Esquerda */}
        <div className="absolute left-[6%] top-1/2 -translate-y-1/2">
          <CelestialObject
            type="luaMinguante"
            size="md"
            interactive
            onClick={(e) =>
              navigateWithFocus("luaList", { event: e, type: "luaMinguante", size: "md" })
            }
            floatOffset={1}
          />
        </div>
      </div>
    </div>
  );
};

export default SolOrbitScreen;
