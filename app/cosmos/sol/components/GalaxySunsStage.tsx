'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { YearMoonData } from '@/hooks/useGalaxySunsSync';

export type YearSun = {
  id: string;
  label: string;
  year: number;
  orbitIndex: number;
};

type GalaxySunsStageProps = {
  orbitSizes: number[];
  yearSuns: YearSun[];
  moonData: Record<number, YearMoonData>;
  onSunClick?: (year: number, event: React.MouseEvent<HTMLDivElement>) => void;
  onGalaxyCoreClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

// Cores para partículas orbitais
const orbitColors = [
  { primary: 'rgba(99, 102, 241, 0.8)', glow: 'rgba(99, 102, 241, 0.4)' },
  { primary: 'rgba(14, 165, 233, 0.8)', glow: 'rgba(14, 165, 233, 0.4)' },
  { primary: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.4)' },
  { primary: 'rgba(236, 72, 153, 0.8)', glow: 'rgba(236, 72, 153, 0.4)' },
];

// Componente de partícula orbital luminosa
const OrbitalParticle: React.FC<{
  size: number;
  duration: number;
  delay: number;
  color: { primary: string; glow: string };
  reverse?: boolean;
}> = ({ size, duration, delay, color, reverse }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 rounded-full"
    style={{
      width: size / 2,
      height: size / 2,
      marginLeft: -(size / 4),
      marginTop: -(size / 4),
    }}
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
  >
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 4,
        height: 4,
        left: '50%',
        top: 0,
        marginLeft: -2,
        backgroundColor: color.primary,
        boxShadow: `0 0 8px ${color.glow}, 0 0 16px ${color.glow}, 0 0 24px ${color.glow}`,
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </motion.div>
);

// Componente de anel orbital com efeito 3D
const OrbitRing3D: React.FC<{
  size: number;
  index: number;
  isLeft?: boolean;
}> = ({ size, index, isLeft }) => {
  const rotation = index * 8;
  const color = orbitColors[index % orbitColors.length];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        ...(isLeft
          ? { right: '50%', top: '50%', transform: `translateY(-50%) rotate(${rotation}deg)` }
          : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }),
        zIndex: 10,
      }}
      initial={{ rotate: rotation }}
      animate={{ rotate: rotation + (index % 2 === 0 ? 3 : -3) }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: index * 0.5,
      }}
    >
      {/* Anel principal com gradiente luminoso */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            conic-gradient(
              from ${index * 45}deg,
              ${color.glow} 0%,
              transparent 15%,
              ${color.glow} 25%,
              transparent 40%,
              ${color.glow} 50%,
              transparent 65%,
              ${color.glow} 75%,
              transparent 90%,
              ${color.glow} 100%
            )
          `,
          mask: 'radial-gradient(circle, transparent 97%, white 97.5%, white 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 97%, white 97.5%, white 100%)',
        }}
      />

      {/* Borda luminosa interna */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: color.glow,
          boxShadow: `
            inset 0 0 20px ${color.glow},
            0 0 15px ${color.glow},
            0 0 30px rgba(99, 102, 241, 0.1)
          `,
        }}
      />

      {/* Efeito de brilho pontual */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 8,
          height: 8,
          top: -4,
          left: '50%',
          marginLeft: -4,
          background: color.primary,
          boxShadow: `0 0 12px ${color.primary}, 0 0 24px ${color.glow}`,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.3,
        }}
      />
    </motion.div>
  );
};

const GalaxySunsStage: React.FC<GalaxySunsStageProps> = ({
  orbitSizes,
  yearSuns,
  moonData,
  onSunClick,
  onGalaxyCoreClick,
}) => {
  const largestOrbit = orbitSizes[orbitSizes.length - 1] ?? 0;
  const stagePadding = Math.max(80, Math.round(largestOrbit * 0.28));
  const stageSize = largestOrbit + stagePadding;
  const angleStep = yearSuns.length > 0 ? 360 / yearSuns.length : 0;

  const polarToCartesian = (orbitIndex: number, angle: number) => {
    const orbitSize = orbitSizes[orbitIndex] ?? orbitSizes[orbitSizes.length - 1] ?? 0;
    const radius = orbitSize / 2;
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  // Gera partículas para cada órbita
  const orbitalParticles = useMemo(() => {
    return orbitSizes.flatMap((size, idx) => {
      const particleCount = 3 + idx;
      return Array.from({ length: particleCount }, (_, pIdx) => ({
        id: `${idx}-${pIdx}`,
        size,
        duration: 15 + idx * 5 + pIdx * 2,
        delay: pIdx * (10 / particleCount),
        color: orbitColors[idx % orbitColors.length],
        reverse: pIdx % 2 === 0,
      }));
    });
  }, [orbitSizes]);

  return (
    <div className="relative mt-6 w-full max-w-[760px]" style={{ minHeight: stageSize }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-full max-w-[720px]">
          {/* Órbitas da direita com efeito 3D */}
          {orbitSizes.map((size, idx) => (
            <OrbitRing3D key={`orbit-right-${size}`} size={size} index={idx} />
          ))}

          {/* Órbitas da esquerda (espelhadas) com efeito 3D */}
          {orbitSizes.map((size, idx) => (
            <OrbitRing3D key={`orbit-left-${size}`} size={size} index={idx} isLeft />
          ))}

          {/* Partículas orbitais luminosas */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {orbitalParticles.map((particle) => (
              <OrbitalParticle
                key={particle.id}
                size={particle.size}
                duration={particle.duration}
                delay={particle.delay}
                color={particle.color}
                reverse={particle.reverse}
              />
            ))}
          </div>

          {/* Núcleo da galáxia com efeitos aprimorados */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 26 }}
          >
            {/* Halo de luz pulsante externo */}
            <motion.div
              className="absolute -inset-20"
              style={{
                background: `radial-gradient(circle at center, 
                  rgba(99, 102, 241, 0.3) 0%, 
                  rgba(168, 85, 247, 0.15) 30%,
                  rgba(14, 165, 233, 0.1) 50%,
                  transparent 70%
                )`,
                filter: 'blur(20px)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Raios de luz do núcleo */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.div
                key={`ray-${angle}`}
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                  width: 2,
                  height: 80,
                  marginLeft: -1,
                  marginTop: -80,
                  transform: `rotate(${angle}deg)`,
                  background: `linear-gradient(to top, 
                    rgba(99, 102, 241, 0.6) 0%, 
                    rgba(168, 85, 247, 0.3) 40%,
                    transparent 100%
                  )`,
                  filter: 'blur(2px)',
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scaleY: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (angle / 360) * 2,
                }}
              />
            ))}

            {/* Efeito de brilho interno */}
            <motion.div
              className="absolute -inset-10"
              style={{
                background: `radial-gradient(circle at center,
                  rgba(255, 255, 255, 0.2) 0%,
                  rgba(99, 102, 241, 0.2) 30%,
                  transparent 60%
                )`,
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <CelestialObject
              type="galaxia"
              size="lg"
              interactive
              onClick={(event) => onGalaxyCoreClick?.(event)}
              className="shadow-[0_0_45px_rgba(99,102,241,0.45),0_0_90px_rgba(168,85,247,0.25),0_0_120px_rgba(14,165,233,0.15)]"
              floatOffset={0}
            />

            {/* Label do núcleo com efeito de brilho */}
            <motion.div
              className="absolute left-1/2 top-full mt-4 -translate-x-1/2 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-100/90"
              style={{
                background: 'rgba(15, 10, 40, 0.9)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1)',
                  '0 0 30px rgba(99, 102, 241, 0.5), inset 0 0 15px rgba(99, 102, 241, 0.2)',
                  '0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Núcleo galáctico
            </motion.div>
          </motion.div>

          {/* Sóis com efeitos aprimorados */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {yearSuns.map((sun, idx) => {
              const floatOffset = idx % 2 === 0 ? -2 : 2;
              const angle = idx * angleStep;
              const { x, y } = polarToCartesian(sun.orbitIndex, angle);
              const [isHovered, setIsHovered] = useState(false);
              const sunColor = orbitColors[sun.orbitIndex % orbitColors.length];

              return (
                <motion.div
                  key={sun.id}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={() => setIsHovered(true)}
                  onTouchEnd={() => setIsHovered(false)}
                >
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{ y: [0, floatOffset, 0] }}
                    transition={{
                      duration: 6 + idx,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Halo de luz do sol */}
                    <motion.div
                      className="absolute -inset-6 rounded-full"
                      style={{
                        background: `radial-gradient(circle at center,
                          rgba(251, 191, 36, 0.3) 0%,
                          rgba(251, 146, 60, 0.15) 40%,
                          transparent 70%
                        )`,
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        opacity: isHovered ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
                        scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Partículas ao redor do sol */}
                    {[0, 60, 120, 180, 240, 300].map((particleAngle) => (
                      <motion.div
                        key={`sun-particle-${sun.id}-${particleAngle}`}
                        className="absolute rounded-full"
                        style={{
                          width: 3,
                          height: 3,
                          background: 'rgba(251, 191, 36, 0.8)',
                          boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)',
                        }}
                        animate={{
                          x: [
                            Math.cos((particleAngle * Math.PI) / 180) * 20,
                            Math.cos(((particleAngle + 30) * Math.PI) / 180) * 25,
                            Math.cos((particleAngle * Math.PI) / 180) * 20,
                          ],
                          y: [
                            Math.sin((particleAngle * Math.PI) / 180) * 20,
                            Math.sin(((particleAngle + 30) * Math.PI) / 180) * 25,
                            Math.sin((particleAngle * Math.PI) / 180) * 20,
                          ],
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 4 + idx * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: (particleAngle / 360) * 2,
                        }}
                      />
                    ))}

                    <CelestialObject
                      type="sol"
                      size="md"
                      interactive
                      onClick={(event) => onSunClick?.(sun.year, event)}
                      floatOffset={floatOffset}
                      className="shadow-[0_0_26px_rgba(251,191,36,0.45),0_0_52px_rgba(251,146,60,0.25),0_0_78px_rgba(251,191,36,0.15)]"
                    />

                    {/* Label do ano com animação */}
                    <motion.div
                      className="mt-2 flex flex-col items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ 
                        opacity: isHovered ? 1 : 0, 
                        y: isHovered ? 0 : -5,
                        scale: isHovered ? 1 : 0.9,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <span 
                        className="rounded-full px-3 py-1 text-[0.7rem] font-bold text-amber-100"
                        style={{
                          background: 'rgba(15, 10, 40, 0.95)',
                          boxShadow: '0 0 15px rgba(251, 191, 36, 0.3), inset 0 0 8px rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.4)',
                        }}
                      >
                        {sun.year}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalaxySunsStage;
