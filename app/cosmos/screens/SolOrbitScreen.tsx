"use client";

import React, { useState } from "react";
import { CelestialObject } from "../components/CelestialObject";
import CosmosChatModal from "../components/CosmosChatModal";
import { useQuarterlyInsights } from "@/hooks/useQuarterlyInsights";
import { useAnnualInsights } from "@/hooks/useAnnualInsights";
import {
  QUARTERLY_INFO,
  QUARTERLY_PROMPTS,
  QUARTERLY_RESPONSES,
  buildAnnualStorageKey,
  buildQuarterlyStorageKey,
} from "../utils/insightChatPresets";
import type { MoonPhase } from "../utils/moonPhases";
import type { ScreenProps } from "../types";

const MOON_RING_RADIUS_PERCENT = 42;
const DIAGONAL_MOONS: Array<{
  phase: MoonPhase;
  angleDeg: number;
  floatOffset: number;
}> = [
  { phase: "luaCheia", angleDeg: 0, floatOffset: -1 },
  { phase: "luaCrescente", angleDeg: 90, floatOffset: -2 },
  { phase: "luaNova", angleDeg: 180, floatOffset: 3 },
  { phase: "luaMinguante", angleDeg: 270, floatOffset: 1 },
];

const QUARTER_BY_PHASE: Record<MoonPhase, number> = {
  luaNova: 1,
  luaCrescente: 2,
  luaCheia: 3,
  luaMinguante: 4,
};

type SolOrbitStageProps = {
  onSolClick: () => void;
  onMoonClick: (phase: MoonPhase) => void;
};

const SolOrbitStage = ({ onSolClick, onMoonClick }: SolOrbitStageProps) => {
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
      // Relação 12:1 com a Terra para gerar 12 voltas/pétalas na mandala
      moonAngularSpeed: 0.03,
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
      const waveFrequency = 12;
      const baseRadius = earthOrbitRadius + 42;
      const waveAmplitude = 16;

      ctx.save();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(125,211,252,0.6)";
      ctx.beginPath();

      const steps = 720;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const offset = Math.sin(theta * waveFrequency + Math.PI / 2) * waveAmplitude;
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
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-4">
      <div className="relative aspect-square w-[min(76vh,76vw)] max-w-[720px]">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 bg-transparent"
          aria-hidden
        />

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <CelestialObject type="sol" size="lg" interactive onClick={onSolClick} />
        </div>

        {DIAGONAL_MOONS.map(({ phase, angleDeg, floatOffset }) => {
          const rad = (angleDeg * Math.PI) / 180;
          const x = 50 + MOON_RING_RADIUS_PERCENT * Math.cos(rad);
          const y = 50 + MOON_RING_RADIUS_PERCENT * Math.sin(rad);

          return (
            <div
              key={phase}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <CelestialObject
                type={phase}
                size="md"
                interactive
                onClick={() => onMoonClick(phase)}
                floatOffset={floatOffset}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SolOrbitScreen: React.FC<ScreenProps> = () => {
  const [isQuarterlyModalOpen, setIsQuarterlyModalOpen] = useState(false);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase>("luaNova");
  const { saveInsight: saveQuarterlyInsight } = useQuarterlyInsights();
  const { saveInsight: saveAnnualInsight } = useAnnualInsights();
  const phaseInfo = QUARTERLY_INFO[selectedMoonPhase];
  const currentYear = new Date().getFullYear();
  const quarterlyStorageKey = buildQuarterlyStorageKey(currentYear, selectedMoonPhase);
  const annualStorageKey = buildAnnualStorageKey(currentYear);

  const handleMoonClick = (phase: MoonPhase) => {
    setSelectedMoonPhase(phase);
    setIsQuarterlyModalOpen(true);
  };

  const handleSolClick = () => {
    setIsAnnualModalOpen(true);
  };

  const handleQuarterlyInsightSubmit = async (insight: string) => {
    await saveQuarterlyInsight(
      selectedMoonPhase,
      insight,
      QUARTER_BY_PHASE[selectedMoonPhase],
    );
  };

  const handleAnnualInsightSubmit = async (insight: string) => {
    await saveAnnualInsight(insight);
  };

  return (
    <>
      <SolOrbitStage onSolClick={handleSolClick} onMoonClick={handleMoonClick} />

      <CosmosChatModal
        isOpen={isQuarterlyModalOpen}
        storageKey={quarterlyStorageKey}
        title={phaseInfo.name}
        eyebrow="Insight Trimestral"
        subtitle={phaseInfo.quarter}
        badge={phaseInfo.months}
        placeholder={QUARTERLY_PROMPTS[selectedMoonPhase].placeholder}
        systemGreeting={QUARTERLY_PROMPTS[selectedMoonPhase].greeting}
        systemQuestion={QUARTERLY_PROMPTS[selectedMoonPhase].question}
        submitLabel="✨ Concluir insight trimestral"
        tone="sky"
        systemResponses={QUARTERLY_RESPONSES[selectedMoonPhase]}
        onClose={() => setIsQuarterlyModalOpen(false)}
        onSubmit={async (value) => {
          await handleQuarterlyInsightSubmit(value);
        }}
      />

      <CosmosChatModal
        isOpen={isAnnualModalOpen}
        storageKey={annualStorageKey}
        title={`${currentYear}`}
        eyebrow="Insight Anual"
        subtitle="☀️ Sol"
        placeholder="Escreva sua reflexão, aprendizados e conquistas do ano..."
        systemGreeting={`Bem-vindo ao seu insight anual de ${currentYear}`}
        systemQuestion="Qual foi a essência do seu ano? ☀️"
        submitLabel="✨ Concluir insight anual"
        tone="amber"
        systemResponses={[
          "Que ano cheio de significado! ✨",
          "Seu caminho ficou ainda mais claro. ☀️",
          "Lindo fechamento de ciclo. 🌟",
        ]}
        onClose={() => setIsAnnualModalOpen(false)}
        onSubmit={async (value) => {
          await handleAnnualInsightSubmit(value);
        }}
      />
    </>
  );
};

export default SolOrbitScreen;
