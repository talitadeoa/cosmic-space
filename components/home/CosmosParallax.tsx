'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// CONFIGURAÇÃO DAS CAMADAS
// ============================================
// Para usar camadas separadas, adicione os PNGs na pasta public/
// e configure aqui. Cada camada tem uma "profundidade" (depth):
// - depth menor = move menos (elementos distantes)
// - depth maior = move mais (elementos próximos)

interface Layer {
  src: string;
  depth: number; // 0.0 a 1.0 - quanto maior, mais movimento
  scale?: number; // escala opcional da camada
  opacity?: number;
  blur?: number; // blur em pixels para profundidade
}

// Camadas padrão - substitua pelos seus PNGs quando tiver
const PARALLAX_LAYERS: Layer[] = [
  // Exemplo de configuração com camadas separadas:
  // { src: '/cosmos/layer-1-fundo.png', depth: 0.05, blur: 2 },
  // { src: '/cosmos/layer-2-nebulosa.png', depth: 0.1 },
  // { src: '/cosmos/layer-3-galaxia.png', depth: 0.2 },
  // { src: '/cosmos/layer-4-planetas.png', depth: 0.35 },
  // { src: '/cosmos/layer-5-proximo.png', depth: 0.5 },
];

// Imagem panorâmica fallback (quando não há camadas)
const PANORAMA_IMAGE = '/home-panoramica.jpg'; // Arquivo PNG servido como JPG
const PANORAMA_DEPTH = 0.15; // intensidade do movimento panorâmico
const PANORAMA_WIDTH = 1366; // dimensões da imagem para otimização
const PANORAMA_HEIGHT = 768;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface CosmosParallaxProps {
  children?: React.ReactNode;
  className?: string;
}

export function CosmosParallax({ children, className = '' }: CosmosParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const targetPosition = useRef({ x: 0.5, y: 0.5 });

  // Modo: camadas ou panorama
  const hasLayers = PARALLAX_LAYERS.length > 0;

  // Smooth mouse tracking com lerp
  const updateMousePosition = useCallback(() => {
    setMousePosition((prev) => {
      const lerpFactor = 0.08; // suavidade do movimento
      return {
        x: prev.x + (targetPosition.current.x - prev.x) * lerpFactor,
        y: prev.y + (targetPosition.current.y - prev.y) * lerpFactor,
      };
    });
    animationRef.current = requestAnimationFrame(updateMousePosition);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateMousePosition);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateMousePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normaliza para -0.5 a 0.5 (centro = 0)
    targetPosition.current = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    };
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Retorna suavemente ao centro
    targetPosition.current = { x: 0, y: 0 };
  }, []);

  // Calcula o transform para uma camada baseado na profundidade
  const getLayerTransform = (depth: number) => {
    const maxOffset = 60; // pixels máximos de movimento
    const x = (mousePosition.x - 0.5) * maxOffset * depth * -1;
    const y = (mousePosition.y - 0.5) * maxOffset * depth * -1;
    return `translate3d(${x}px, ${y}px, 0)`;
  };

  // Transform para imagem panorâmica (movimento maior horizontal)
  const getPanoramaTransform = () => {
    const maxOffsetX = 100; // movimento horizontal maior
    const maxOffsetY = 40; // movimento vertical menor
    const x = (mousePosition.x - 0.5) * maxOffsetX * PANORAMA_DEPTH * -1;
    const y = (mousePosition.y - 0.5) * maxOffsetY * PANORAMA_DEPTH * -1;
    const scale = isHovering ? 1.05 : 1.02; // zoom sutil no hover
    return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fundo base escuro - apenas se não houver imagem */}
      {!hasLayers && <div className="absolute inset-0 bg-slate-950" />}

      {hasLayers ? (
        // ========== MODO CAMADAS ==========
        <div className="absolute inset-0">
          {PARALLAX_LAYERS.map((layer, index) => (
            <div
              key={layer.src}
              className="absolute inset-0 will-change-transform"
              style={{
                transform: getLayerTransform(layer.depth),
                transition: 'transform 0.1s ease-out',
                zIndex: index,
              }}
            >
              <div
                className="absolute inset-[-20%]"
                style={{
                  filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
                  opacity: layer.opacity ?? 1,
                  transform: `scale(${layer.scale ?? 1.2})`,
                }}
              >
                <Image
                  src={layer.src}
                  alt=""
                  fill
                  priority={index < 2}
                  className="object-cover"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ========== MODO PANORAMA ==========
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: getPanoramaTransform(),
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="absolute inset-[-10%]">
            <Image
              src={PANORAMA_IMAGE}
              alt="Cenário espacial panorâmico"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Gradientes de profundidade */}
      <div className="pointer-events-none absolute inset-0">
        {/* Vinheta radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,rgba(15,23,42,0.4)_70%,rgba(15,23,42,0.8)_100%)]" />
        {/* Gradiente superior (para legibilidade do header) */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/70 to-transparent" />
        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />
        {/* Brilho atmosférico central */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
      </div>

      {/* Partículas flutuantes (estrelas) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="stars-small" />
        <div className="stars-medium" />
      </div>

      {/* Conteúdo sobreposto */}
      <div className="relative z-10">{children}</div>

      {/* Estilos para estrelas animadas */}
      <style jsx>{`
        .stars-small,
        .stars-medium {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          animation: twinkle 4s ease-in-out infinite;
        }

        .stars-small {
          background-image: radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent);
          background-size: 200px 200px;
          opacity: 0.5;
        }

        .stars-medium {
          background-image: radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 200px 150px, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(2px 2px at 300px 100px, rgba(167, 139, 250, 0.8), transparent),
            radial-gradient(1.5px 1.5px at 400px 200px, white, transparent);
          background-size: 500px 300px;
          opacity: 0.4;
          animation-delay: -2s;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default CosmosParallax;
