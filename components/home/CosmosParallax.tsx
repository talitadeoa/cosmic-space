'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';

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

// Imagens panorâmicas - desktop e mobile
const PANORAMA_IMAGE_DESKTOP = '/home-panoramica.jpg';
const PANORAMA_IMAGE_MOBILE = '/home-alternativa.png';
const PANORAMA_DEPTH = 0.15; // intensidade do movimento panorâmico

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
  const isMobile = useIsMobile();

  // Modo: camadas ou panorama
  const hasLayers = PARALLAX_LAYERS.length > 0;
  
  // Imagem baseada no dispositivo
  const panoramaImage = isMobile ? PANORAMA_IMAGE_MOBILE : PANORAMA_IMAGE_DESKTOP;

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
    const maxOffsetX = 80; // movimento horizontal
    const maxOffsetY = 30; // movimento vertical menor
    const x = (mousePosition.x - 0.5) * maxOffsetX * PANORAMA_DEPTH * -1;
    const y = (mousePosition.y - 0.5) * maxOffsetY * PANORAMA_DEPTH * -1;
    const scale = isHovering ? 1.02 : 1.0; // zoom reduzido para não cortar
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
            transform: isMobile ? undefined : getPanoramaTransform(),
            transition: 'transform 0.3s ease-out',
          }}
        >
          {/* Container com overflow para parallax - menor no mobile para não cortar */}
          <div className={isMobile ? 'absolute inset-0' : 'absolute inset-[-5%]'}>
            <Image
              src={panoramaImage}
              alt="Cenário espacial panorâmico"
              fill
              priority
              quality={90}
              sizes={isMobile ? '100vw' : '110vw'}
              className={isMobile ? 'object-cover object-center' : 'object-cover object-top'}
            />
          </div>
        </div>
      )}

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
