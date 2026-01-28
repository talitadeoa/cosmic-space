'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

const MOON_RING_RADIUS_PERCENT = 36;
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
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
}> = [
  { phase: 'luaNova', angleDeg: 0, floatOffset: 3, tooltipPosition: 'right' }, // Direita
  { phase: 'luaCrescente', angleDeg: 270, floatOffset: -2, tooltipPosition: 'top' }, // Topo
  { phase: 'luaCheia', angleDeg: 180, floatOffset: -1, tooltipPosition: 'left' }, // Esquerda
  { phase: 'luaMinguante', angleDeg: 90, floatOffset: 1, tooltipPosition: 'bottom' }, // Baixo
];

// Classes de posicionamento para tooltips baseado na posição da lua
const TOOLTIP_POSITION_CLASSES: Record<'top' | 'bottom' | 'left' | 'right', string> = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

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
    let minSide = 0;
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

      minSide = Math.min(width, height);

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
      // Usar valores proporcionais ao tamanho do container para evitar corte em mobile
      const waveOffset = minSide * 0.08; // ~8% do tamanho (era fixo 42)
      const waveAmplitude = minSide * 0.025; // ~2.5% do tamanho (era fixo 16)
      const baseRadius = earthOrbitRadius + waveOffset;
      
      // Garantir que o raio máximo não exceda 48% do container
      const maxAllowedRadius = minSide * 0.48;
      const actualBaseRadius = Math.min(baseRadius, maxAllowedRadius - waveAmplitude);

      ctx.save();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(125,211,252,0.6)';
      ctx.beginPath();

      const steps = 720;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const offset = Math.sin(theta * waveFrequency + Math.PI / 2) * waveAmplitude;
        const r = actualBaseRadius + offset;
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
    <div className="flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-1 py-2 sm:px-4 sm:py-8 safe-area-inset">
      <div
        className="relative aspect-square h-[min(68dvh,82vw)] w-[min(68dvh,82vw)] max-h-[520px] max-w-[520px] sm:h-[min(78vh,85vw)] sm:w-[min(78vh,85vw)] sm:max-h-[680px] sm:max-w-[680px] md:max-h-[720px] md:max-w-[720px]"
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
        {DIAGONAL_MOONS.map(({ phase, angleDeg, floatOffset, tooltipPosition }) => {
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
                  className="absolute inset-0 -m-2 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0) 60%)',
                  }}
                />
              )}
              
              <CelestialObject
                type={phase}
                size="sm"
                interactive
                onClick={() => onMoonClick(phase)}
                floatOffset={floatOffset}
              />

              {showHover && (
                <div 
                  className={`absolute ${TOOLTIP_POSITION_CLASSES[tooltipPosition]} z-50 rounded-lg bg-slate-900/90 px-2 py-1.5 text-[0.65rem] font-medium text-indigo-100 ring-1 ring-white/15 shadow-lg backdrop-blur-sm transition-all duration-200 sm:px-2.5 sm:py-2 sm:text-xs ${
                    isAutoHighlight && !isManualHover ? 'opacity-85 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm">{moonInfo.emoji}</span>
                    <span className="text-white font-semibold">{moonInfo.name}</span>
                  </div>
                  <div className="mt-0.5 text-yellow-300/90 text-[0.6rem] sm:text-[0.65rem]">{moonInfo.season}</div>
                  {isAutoHighlight && !isManualHover && (
                    <div className="mt-0.5 text-sky-400 text-[0.55rem] animate-pulse">🌍 Terra próxima</div>
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
