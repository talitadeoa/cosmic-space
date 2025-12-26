import React from 'react';
import { motion } from 'framer-motion';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import { buildMonthKey, type MonthEntry } from '@/app/cosmos/utils/luaList';

const bridgeTransition = { duration: 0.32, ease: [0.23, 1, 0.32, 1] };

type HiddenPhasesBridgeProps = {
  months: MonthEntry[];
  tileWidth: number;
  gap: number;
  virtualOffsetPx: number;
  trackWidth: number;
  revealedCycleKey: string | null;
};

const HiddenPhasesBridge: React.FC<HiddenPhasesBridgeProps> = ({
  months,
  tileWidth,
  gap,
  virtualOffsetPx,
  trackWidth,
  revealedCycleKey,
}) => {
  if (months.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 top-1/2 z-10 -translate-y-1/2"
      style={{ minWidth: trackWidth }}
    >
      <div
        className="flex min-w-max items-center"
        style={{ paddingLeft: virtualOffsetPx, columnGap: gap }}
      >
        {months.map((month) => {
          const monthKey = buildMonthKey(month);
          const isActive = revealedCycleKey === monthKey;

          return (
            <div
              key={`hidden-phases-${monthKey}`}
              className="relative flex w-full flex-col items-center"
              style={{ width: tileWidth }}
            >
              <motion.div
                className="absolute left-1/2 top-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-200/0 via-sky-300/30 to-sky-200/5"
                animate={{ opacity: isActive ? 0.5 : 0, scaleY: isActive ? 1 : 0.5 }}
                transition={bridgeTransition}
              />

              <motion.div
                className="mb-4 flex justify-center"
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 0.6,
                  y: isActive ? -26 : 0,
                  filter: isActive ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={bridgeTransition}
              >
                <CelestialObject
                  type="luaCrescente"
                  size="sm"
                  pulseOnMount={false}
                  className="shadow-[0_0_25px_rgba(56,189,248,0.45)]"
                />
              </motion.div>

              <motion.div
                className="mt-4 flex justify-center"
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 0.6,
                  y: isActive ? 26 : 0,
                  filter: isActive ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={bridgeTransition}
              >
                <CelestialObject
                  type="luaMinguante"
                  size="sm"
                  pulseOnMount={false}
                  className="shadow-[0_0_25px_rgba(56,189,248,0.45)]"
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiddenPhasesBridge;
