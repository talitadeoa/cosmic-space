/**
 * Renderizador procedural da Lua usando Canvas
 * Implementa máscara dinâmica, terminator suave e sombreamento esférico
 * Otimizado para 60fps durante scrubbing
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { MoonData, MoonRenderConfig } from './types';

/**
 * Configuração padrão de renderização
 */
const DEFAULT_CONFIG: MoonRenderConfig = {
  moonColor: '#e8e8e0',
  shadowColor: '#0a0a0a',
  earthshineColor: '#1a1a2e',
  earthshineIntensity: 0.15,
  terminatorSoftness: 0.3,
  showCraters: true,
  showGlow: true,
};

/**
 * Dados de crateras para realismo (posições relativas)
 */
const CRATERS = [
  { x: 0.3, y: 0.2, size: 0.08 },
  { x: -0.2, y: 0.4, size: 0.12 },
  { x: 0.5, y: -0.3, size: 0.06 },
  { x: -0.4, y: -0.2, size: 0.1 },
  { x: 0.1, y: 0.5, size: 0.07 },
  { x: -0.5, y: 0.1, size: 0.09 },
  { x: 0.4, y: 0.4, size: 0.05 },
  { x: -0.1, y: -0.4, size: 0.11 },
];

interface MoonRendererProps {
  moonData: MoonData;
  size?: number;
  config?: Partial<MoonRenderConfig>;
  onRenderComplete?: () => void;
}

export function MoonRenderer({
  moonData,
  size = 300,
  config: userConfig,
  onRenderComplete,
}: MoonRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const config = { ...DEFAULT_CONFIG, ...userConfig };

  /**
   * Renderiza a Lua com base nos dados lunares
   */
  const renderMoon = useCallback(
    (ctx: CanvasRenderingContext2D, data: MoonData, canvasSize: number) => {
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      const radius = canvasSize * 0.42; // 84% do tamanho para margem

      // Limpar canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Salvar estado
      ctx.save();

      // === 1. CÍRCULO BASE DA LUA ===
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = config.moonColor;
      ctx.fill();

      // === 2. GRADIENTE ESFÉRICO (Sombreamento 3D) ===
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      sphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      sphereGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      sphereGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // === 3. CRATERAS (se habilitado) ===
      if (config.showCraters) {
        ctx.globalAlpha = 0.2;
        CRATERS.forEach((crater) => {
          const craterX = centerX + crater.x * radius;
          const craterY = centerY + crater.y * radius;
          const craterRadius = crater.size * radius;

          // Sombra da cratera
          const craterGradient = ctx.createRadialGradient(
            craterX,
            craterY,
            0,
            craterX,
            craterY,
            craterRadius
          );
          craterGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
          craterGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
          craterGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
          ctx.fillStyle = craterGradient;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // === 4. SOMBRA/MÁSCARA DA FASE LUNAR ===
      // Clipar para o círculo da lua
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Calcular posição do terminator baseado na iluminação
      const illumination = data.illumination;
      const isWaxing = data.isWaxing;

      // Posição horizontal do terminator (-1 a 1)
      // -1 = extrema esquerda (nova), 0 = centro (quartos), +1 = extrema direita (cheia)
      let terminatorX;
      if (isWaxing) {
        // Crescente: de -1 (nova) para +1 (cheia)
        terminatorX = -1 + illumination * 2;
      } else {
        // Minguante: de +1 (cheia) para -1 (nova)
        terminatorX = 1 - (illumination - 0.5) * 4;
      }

      const terminatorPixelX = centerX + terminatorX * radius;

      // Criar gradiente suave no terminator
      const terminatorWidth = radius * config.terminatorSoftness;

      let shadowGradient;
      if (isWaxing) {
        // Crescente: sombra à esquerda
        shadowGradient = ctx.createLinearGradient(
          terminatorPixelX - terminatorWidth,
          0,
          terminatorPixelX + terminatorWidth,
          0
        );
        shadowGradient.addColorStop(0, config.shadowColor);
        shadowGradient.addColorStop(1, 'rgba(10, 10, 10, 0)');

        ctx.fillStyle = shadowGradient;
        ctx.fillRect(0, 0, terminatorPixelX + terminatorWidth, canvasSize);
      } else {
        // Minguante: sombra à direita
        shadowGradient = ctx.createLinearGradient(
          terminatorPixelX - terminatorWidth,
          0,
          terminatorPixelX + terminatorWidth,
          0
        );
        shadowGradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
        shadowGradient.addColorStop(1, config.shadowColor);

        ctx.fillStyle = shadowGradient;
        ctx.fillRect(terminatorPixelX - terminatorWidth, 0, canvasSize, canvasSize);
      }

      // === 5. EARTHSHINE (Luz refletida da Terra na parte escura) ===
      if (config.earthshineIntensity > 0) {
        ctx.globalAlpha = config.earthshineIntensity;
        ctx.fillStyle = config.earthshineColor;

        if (isWaxing) {
          ctx.fillRect(0, 0, terminatorPixelX - terminatorWidth, canvasSize);
        } else {
          ctx.fillRect(terminatorPixelX + terminatorWidth, 0, canvasSize, canvasSize);
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore(); // Restaurar clip

      // === 6. BRILHO EXTERNO (se habilitado) ===
      if (config.showGlow && illumination > 0.3) {
        const glowIntensity = Math.min(illumination, 0.8);
        ctx.save();
        ctx.globalAlpha = glowIntensity * 0.3;

        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius,
          centerX,
          centerY,
          radius * 1.3
        );
        glowGradient.addColorStop(0, 'rgba(232, 232, 224, 0.5)');
        glowGradient.addColorStop(1, 'rgba(232, 232, 224, 0)');

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        ctx.restore();
      }

      // Restaurar estado
      ctx.restore();

      // Callback de conclusão
      if (onRenderComplete) {
        onRenderComplete();
      }
    },
    [config, onRenderComplete]
  );

  /**
   * Efeito para renderizar quando moonData mudar
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Otimização para animações
    });
    if (!ctx) return;

    // Configurar tamanho do canvas
    const dpr = window.devicePixelRatio || 1;
    const displaySize = size;
    const canvasSize = displaySize * dpr;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    // Escalar contexto para DPR
    ctx.scale(dpr, dpr);

    // Renderizar em animation frame para suavidade
    const render = () => {
      renderMoon(ctx, moonData, displaySize);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [moonData, size, renderMoon]);

  return (
    <canvas
      ref={canvasRef}
      className="moon-canvas"
      style={{
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}

/**
 * Hook para pré-carregar e otimizar renderização
 */
export function useMoonRenderer(size: number = 300) {
  const offscreenCanvas = useRef<HTMLCanvasElement>();

  useEffect(() => {
    // Criar canvas offscreen para pré-renderização
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    offscreenCanvas.current = canvas;
  }, [size]);

  return offscreenCanvas;
}
