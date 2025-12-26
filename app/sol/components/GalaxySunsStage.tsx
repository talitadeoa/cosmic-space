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

const GalaxySunsStage: React.FC<GalaxySunsStageProps> = ({
  orbitSizes,
  yearSuns,
  moonData,
  onSunClick,
  onGalaxyCoreClick,
}) => {
  const largestOrbit = orbitSizes[orbitSizes.length - 1] ?? 0;
  const stagePadding = 120;
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

  return (
    <div className="relative mt-6 w-full max-w-[760px]" style={{ minHeight: stageSize }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-full max-w-[720px]">
          {/* Espiral da direita */}
          {orbitSizes.map((size, idx) => (
            <div
              key={`orbit-right-${size}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/15 shadow-[0_0_32px_rgba(79,70,229,0.12)]"
              style={{
                width: size,
                height: size,
                rotate: `${idx * 8}deg`,
                zIndex: 10,
                boxShadow: idx % 2 === 0 ? '0 0 28px rgba(14,165,233,0.14)' : undefined,
              }}
            />
          ))}

          {/* Espiral da esquerda (espelhada) */}
          {orbitSizes.map((size, idx) => (
            <div
              key={`orbit-left-${size}`}
              className="absolute top-1/2 rounded-full border border-indigo-300/15 shadow-[0_0_32px_rgba(79,70,229,0.12)]"
              style={{
                width: size,
                height: size,
                right: '50%',
                translateY: '-50%',
                rotate: `${idx * 8}deg`,
                zIndex: 10,
                boxShadow: idx % 2 === 0 ? '0 0 28px rgba(14,165,233,0.14)' : undefined,
              }}
            />
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 26 }}
          >
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0),rgba(14,165,233,0.12),transparent)] blur-3xl" />
            <CelestialObject
              type="galaxia"
              size="lg"
              interactive
              onClick={(event) => onGalaxyCoreClick?.(event)}
              className="shadow-[0_0_45px_rgba(99,102,241,0.45)]"
              floatOffset={0}
            />
            <div className="absolute left-1/2 top-full mt-4 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-100/80 ring-1 ring-white/10">
              Núcleo galáctico
            </div>
          </motion.div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {yearSuns.map((sun, idx) => {
              const floatOffset = idx % 2 === 0 ? -2 : 2;
              const angle = idx * angleStep;
              const { x, y } = polarToCartesian(sun.orbitIndex, angle);
              const yearData = moonData[sun.year];
              const [isHovered, setIsHovered] = useState(false);

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
                    <CelestialObject
                      type="sol"
                      size="md"
                      interactive
                      onClick={(event) => onSunClick?.(sun.year, event)}
                      floatOffset={floatOffset}
                      className="shadow-[0_0_26px_rgba(251,191,36,0.35)]"
                    />
                    {isHovered && (
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.65rem] font-semibold text-indigo-100 ring-1 ring-white/10">
                          {sun.year}
                        </span>
                      </div>
                    )}
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
