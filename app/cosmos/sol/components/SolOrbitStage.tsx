'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

const MOON_RING_RADIUS_PERCENT = 28;
const RING_HIT_BAND_PERCENT = 10;
const INNER_SAFE_RADIUS_PERCENT = 22;

// Mapeamento de fases lunares para eventos astronômicos
const MOON_EVENTS: Record<
  MoonPhase,
  {
    name: string;
    event: string;
    season: string;
    dates: string;
    emoji: string;
    description: string;
  }
> = {
  luaNova: {
    name: 'Lua Nova',
    event: 'Equinócio de Outono (Hemisfério Norte)',
    season: '🍂 Outono',
    dates: '~22-23 de Setembro',
    emoji: '🌑',
    description: 'Início do outono - equilíbrio entre dia e noite',
  },
  luaCrescente: {
    name: 'Lua Crescente',
    event: 'Solstício de Verão (Hemisfério Norte)',
    season: '☀️ Verão',
    dates: '~20-21 de Junho',
    emoji: '🌒',
    description: 'Início do verão - dia mais longo do ano',
  },
  luaCheia: {
    name: 'Lua Cheia',
    event: 'Solstício de Inverno (Hemisfério Norte)',
    season: '❄️ Inverno',
    dates: '~21-22 de Dezembro',
    emoji: '🌕',
    description: 'Início do inverno - noite mais longa do ano',
  },
  luaMinguante: {
    name: 'Lua Minguante',
    event: 'Equinócio de Primavera (Hemisfério Norte)',
    season: '🌸 Primavera',
    dates: '~19-20 de Março',
    emoji: '🌗',
    description: 'Início da primavera - equilíbrio entre dia e noite',
  },
};

const DIAGONAL_MOONS: Array<{
  phase: MoonPhase;
  angleDeg: number;
  floatOffset: number;
}> = [
  { phase: 'luaNova', angleDeg: 0, floatOffset: 3 },
  { phase: 'luaCrescente', angleDeg: 270, floatOffset: -2 },
  { phase: 'luaCheia', angleDeg: 180, floatOffset: -1 },
  { phase: 'luaMinguante', angleDeg: 90, floatOffset: 1 },
];

type SolOrbitStageProps = {
  onSolClick: () => void;
  onMoonClick: (phase: MoonPhase) => void;
  onOrbitClick?: () => void;
  onOutsideClick?: () => void;
};

const SolOrbitStage: React.FC<SolOrbitStageProps> = ({
  onSolClick,
  onMoonClick,
  onOrbitClick,
  onOutsideClick,
}) => {
  const [hoveredMoon, setHoveredMoon] = useState<MoonPhase | null>(null);
  const [autoHighlightedMoon, setAutoHighlightedMoon] = useState<MoonPhase | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const earthPosRef = useRef<{ x: number; y: number; angleE: number }>({ x: 0, y: 0, angleE: 0 });
  const proximityDistanceRef = useRef(60); // Distância de ativação do destaque
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressDelay = 500; // 500ms para toque longo
  const handleSpaceClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const ringRadius = (MOON_RING_RADIUS_PERCENT / 100) * size;
      const band = (RING_HIT_BAND_PERCENT / 100) * size;
      const innerRadius = ringRadius - band;
      const outerRadius = ringRadius + band;
      const innerSafeRadius = (INNER_SAFE_RADIUS_PERCENT / 100) * size;

      // Clique na órbita (anel entre as luas)
      if (distance >= innerRadius && distance <= outerRadius) {
        event.stopPropagation();
        onOrbitClick?.();
        return;
      }

      // Clique fora da órbita
      if (distance > outerRadius) {
        event.stopPropagation();
        onOutsideClick?.();
        return;
      }

      // Clique dentro da zona segura interna
      if (distance <= innerSafeRadius) {
        event.stopPropagation();
      }
    },
    [onOrbitClick, onOutsideClick]
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
      earthAngularSpeed: -0.0025,
      moonAngularSpeed: -0.03,
      moonTrailMaxPoints: 2200,
      lineWidthOrbits: 1.2,
      lineWidthTrail: 1.6,
    };

    const moonTrail: Array<{ x: number; y: number }> = [];

    const resize = () => {
      const parentRect =
        canvas.parentElement?.getBoundingClientRect() ??
        ({
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
    };

    const drawEarthOrbit = () => {
      ctx.save();
      ctx.lineWidth = config.lineWidthOrbits;
      ctx.strokeStyle = '#38bdf8';
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
      ctx.strokeStyle = '#7dd3fc';
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
      moonPos: { x: number; y: number }
    ) => {
      ctx.save();

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(125,211,252,0.35)';
      ctx.beginPath();
      ctx.arc(earthPos.x, earthPos.y, moonOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(earthPos.x, earthPos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 12;
      ctx.shadowColor = '#bae6fd';
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(moonPos.x, moonPos.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawStaticWaveRing = () => {
      const waveFrequency = 12;
      const baseRadius = earthOrbitRadius + 42;
      const waveAmplitude = 16;

      ctx.save();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(125,211,252,0.6)';
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
      earthPosRef.current = earthPos; // Armazenar posição para verificação de proximidade
      
      const moonPos = getMoonPosition(time, earthPos);
      updateMoonTrail(moonPos);
      drawMoonTrail();
      drawEarthAndMoon(earthPos, moonPos);

      animationId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Efeito para detectar proximidade entre Terra e Luas
  useEffect(() => {
    const checkProximity = () => {
      const earthPos = earthPosRef.current;
      if (!earthPos) return;

      const proximityDistance = proximityDistanceRef.current;
      let closestPhase: MoonPhase | null = null;
      let closestDistance = proximityDistance;

      DIAGONAL_MOONS.forEach(({ phase, angleDeg }) => {
        const rad = (angleDeg * Math.PI) / 180;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parentRect = canvas.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        const size = Math.min(parentRect.width, parentRect.height);
        const moonX = parentRect.width / 2 + (MOON_RING_RADIUS_PERCENT / 100) * size * Math.cos(rad);
        const moonY = parentRect.height / 2 + (MOON_RING_RADIUS_PERCENT / 100) * size * Math.sin(rad);

        const distance = Math.sqrt((earthPos.x - moonX) ** 2 + (earthPos.y - moonY) ** 2);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPhase = phase;
        }
      });

      setAutoHighlightedMoon(closestPhase);
    };

    const interval = setInterval(checkProximity, 50); // Verificar a cada 50ms
    return () => clearInterval(interval);
  }, []);

  // Handler para duplo clique - abre chat modal
  const handleDoubleClick = (phase: MoonPhase) => {
    setSelectedMoonPhase(phase);
    setIsChatOpen(true);
  };

  // Handler para toque longo (mobile) - abre chat modal
  const handleLongPressStart = (phase: MoonPhase) => {
    longPressTimerRef.current = setTimeout(() => {
      setSelectedMoonPhase(phase);
      setIsChatOpen(true);
    }, longPressDelay);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleChatSubmit = async () => {
    setIsChatOpen(false);
    setSelectedMoonPhase(null);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedMoonPhase(null);
  };

  return (
    <div className="flex min-h-[100svh] w-full items-center justify-center overflow-hidden py-6 sm:py-10">
      <div
        className="relative aspect-square h-[min(84svh,92vw)] w-[min(84svh,92vw)] max-h-[720px] max-w-[720px] sm:h-[min(90vh,90vw)] sm:w-[min(90vh,90vw)]"
        onClick={handleSpaceClick}
      >
        {/* Canvas da órbita */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 bg-transparent"
          aria-hidden
        />

        {/* Sol centralizado */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <CelestialObject type="sol" size="lg" interactive onClick={onSolClick} />
        </div>

        {/* Luas posicionadas na órbita */}
        {DIAGONAL_MOONS.map(({ phase, angleDeg, floatOffset }) => {
          const rad = (angleDeg * Math.PI) / 180;
          const x = 50 + MOON_RING_RADIUS_PERCENT * Math.cos(rad);
          const y = 50 + MOON_RING_RADIUS_PERCENT * Math.sin(rad);
          const moonInfo = MOON_EVENTS[phase];
          const isManualHover = hoveredMoon === phase;
          const isAutoHighlight = autoHighlightedMoon === phase;
          const showHover = isManualHover || isAutoHighlight;

          const handleTouchStart = (e: React.TouchEvent) => {
            e.preventDefault();
            setHoveredMoon(phase);
            handleLongPressStart(phase);
          };

          const handleTouchEnd = (e: React.TouchEvent) => {
            e.preventDefault();
            setHoveredMoon(null);
            handleLongPressEnd();
          };

          return (
            <div
              key={phase}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHoveredMoon(phase)}
              onMouseLeave={() => setHoveredMoon(null)}
              onDoubleClick={() => handleDoubleClick(phase)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleLongPressEnd}
            >
              {/* Destaque visual quando Terra está próxima */}
              {isAutoHighlight && (
                <div 
                  className="absolute inset-0 -m-3 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(56,189,248,0) 70%)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )}
              
              <CelestialObject
                type={phase}
                size="md"
                interactive
                onClick={() => onMoonClick(phase)}
                floatOffset={floatOffset}
              />

              {showHover && (
                <div 
                  className={`absolute top-full mt-2 sm:mt-3 z-50 whitespace-nowrap rounded-lg bg-slate-900/95 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-100 ring-1 ring-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                    isAutoHighlight && !isManualHover ? 'opacity-90 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="mb-1 text-sm sm:text-base">{moonInfo.emoji}</div>
                  <div className="text-white text-xs sm:text-sm">{moonInfo.name}</div>
                  <div className="mt-1 text-indigo-300 text-xs">{moonInfo.event}</div>
                  <div className="mt-1 text-yellow-300 text-xs">{moonInfo.season}</div>
                  <div className="mt-1 text-sky-300 text-xs">{moonInfo.dates}</div>
                  <div className="mt-2 max-w-xs sm:max-w-sm whitespace-normal text-indigo-200/80 text-xs">
                    {moonInfo.description}
                  </div>
                  {isAutoHighlight && !isManualHover && (
                    <div className="mt-2 text-sky-400 text-[0.6rem] animate-pulse">🌍 Terra passando...</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Modal */}
      {selectedMoonPhase && (
        <CosmosChatModal
          isOpen={isChatOpen}
          storageKey={`sol-orbit-${selectedMoonPhase}`}
          title={MOON_EVENTS[selectedMoonPhase].name}
          eyebrow={MOON_EVENTS[selectedMoonPhase].season}
          subtitle={MOON_EVENTS[selectedMoonPhase].event}
          badge={MOON_EVENTS[selectedMoonPhase].dates}
          placeholder="Escreva suas reflexões sobre esta fase..."
          systemGreeting={`${MOON_EVENTS[selectedMoonPhase].emoji} ${MOON_EVENTS[selectedMoonPhase].description}`}
          systemQuestion="O que você gostaria de explorar sobre este momento do ciclo?"
          tone="indigo"
          onClose={handleChatClose}
          onSubmit={handleChatSubmit}
        />
      )}
    </div>
  );
};

export default SolOrbitStage;
