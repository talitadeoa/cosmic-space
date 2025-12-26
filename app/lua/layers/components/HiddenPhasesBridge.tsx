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
  { phase: 'luaCrescente', angleDeg: 0, size: 'sm' },
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
  const adjustedOrbitRadius = orbitRadius * 1.5;
  const circleDiameter = adjustedOrbitRadius * 2 + 80;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={{ minWidth: trackWidth }}>
      {anchors.map(({ month, localIndex }) => {
        const monthKey = buildMonthKey(month);
        const isActive = revealedCycleKey === monthKey;
        const centerLeft = virtualOffsetPx + localIndex * tileSpan + tileWidth / 2;

        return (
          <motion.div
            key={`hidden-phases-${monthKey}`}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              width: circleDiameter,
              height: circleDiameter,
              left: centerLeft,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              opacity: isActive ? 1 : 0,
            }}
            transition={bridgeTransition}
          >
            {ORBIT_PHASES.map(({ phase, angleDeg, size }) => {
              const radians = (angleDeg * Math.PI) / 180;
              const offsetX = Math.cos(radians) * adjustedOrbitRadius;
              const offsetY = Math.sin(radians) * adjustedOrbitRadius;
              return (
                <motion.div
                  key={`${monthKey}-${phase}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.6,
                    x: isActive ? offsetX : 0,
                    y: isActive ? offsetY : 0,
                  }}
                  transition={{ duration: 0.3, delay: isActive ? 0.05 : 0 }}
                >
                  <motion.div
                    style={{
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <CelestialObject
                      type={phase}
                      size={size}
                      pulseOnMount={false}
                      className="shadow-[0_0_18px_rgba(56,189,248,0.45)]"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        );
      })}
    </div>
  );
};

export default HiddenPhasesBridge;
