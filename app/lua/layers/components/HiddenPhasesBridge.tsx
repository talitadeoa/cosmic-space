import React from 'react';
import { motion } from 'framer-motion';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import { buildMonthKey, type MonthEntry } from '@/app/cosmos/utils/luaList';

const bridgeTransition = { duration: 0.32, ease: [0.23, 1, 0.32, 1] };

type OrbitAnchor = {
  month: MonthEntry;
  localIndex: number;
};

type HiddenPhasesBridgeProps = {
  anchors: OrbitAnchor[];
  tileWidth: number;
  gap: number;
  virtualOffsetPx: number;
  trackWidth: number;
  revealedCycleKey: string | null;
  orbitRadius: number;
};

const ORBIT_PHASES: Array<{ phase: MoonPhase; angleDeg: number; size: 'sm' | 'md' }> = [
  { phase: 'luaNova', angleDeg: -90, size: 'md' },
  { phase: 'luaCrescente', angleDeg: 0, size: 'sm' },
  { phase: 'luaCheia', angleDeg: 90, size: 'md' },
  { phase: 'luaMinguante', angleDeg: 180, size: 'sm' },
] as const;

const HiddenPhasesBridge: React.FC<HiddenPhasesBridgeProps> = ({
  anchors,
  tileWidth,
  gap,
  virtualOffsetPx,
  trackWidth,
  revealedCycleKey,
  orbitRadius,
}) => {
  if (anchors.length === 0) return null;

  const tileSpan = tileWidth + gap;
  const circleDiameter = orbitRadius * 2 + 28;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={{ minWidth: trackWidth }}>
      {anchors.map(({ month, localIndex }) => {
        const monthKey = buildMonthKey(month);
        const isActive = revealedCycleKey === monthKey;
        const centerLeft = virtualOffsetPx + localIndex * tileSpan + tileWidth / 2;

        return (
          <motion.div
            key={`hidden-phases-${monthKey}`}
            className="absolute flex items-center justify-center"
            style={{
              width: circleDiameter,
              height: circleDiameter,
              left: centerLeft,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 0.85,
              rotateX: isActive ? 0 : 45,
            }}
            transition={bridgeTransition}
          >
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-sky-400/45 bg-slate-900/35 shadow-[0_0_35px_rgba(56,189,248,0.35)] backdrop-blur">
              <motion.div
                className="absolute inset-4 rounded-full border border-sky-300/15"
                animate={{ rotate: isActive ? 360 : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              />
              {ORBIT_PHASES.map(({ phase, angleDeg, size }) => {
                const radians = (angleDeg * Math.PI) / 180;
                const offsetX = Math.cos(radians) * orbitRadius;
                const offsetY = Math.sin(radians) * orbitRadius;
                return (
                  <motion.div
                    key={`${monthKey}-${phase}`}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
                    }}
                    animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.6 }}
                    transition={{ duration: 0.3, delay: isActive ? 0.05 : 0 }}
                  >
                    <CelestialObject
                      type={phase}
                      size={size}
                      pulseOnMount={false}
                      className="shadow-[0_0_18px_rgba(56,189,248,0.45)]"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HiddenPhasesBridge;
