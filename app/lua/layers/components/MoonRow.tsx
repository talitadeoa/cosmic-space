import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { HighlightTarget, MonthEntry } from '@/app/cosmos/utils/luaList';
import { ANIMATION_CONFIG, buildMonthKey, getFloatOffset } from '@/app/cosmos/utils/luaList';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

type MoonRowItem = {
  month: MonthEntry;
  phase: MoonPhase;
};

type MoonRowProps = {
  items: MoonRowItem[];
  highlightTarget: HighlightTarget | null;
  trackWidth: number;
  virtualOffsetPx: number;
  tileWidth: number;
  gap: number;
  onMoonClick: (month: MonthEntry, phase: MoonPhase) => void;
  orbitRadius: number;
  revealedCycleKey: string | null;
  onCycleReveal: (monthKey: string | null) => void;
};

const MoonRow: React.FC<MoonRowProps> = ({
  items,
  highlightTarget,
  trackWidth,
  virtualOffsetPx,
  tileWidth,
  gap,
  onMoonClick,
  orbitRadius,
  revealedCycleKey,
  onCycleReveal,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const touchRevealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTouchRevealTimeout = () => {
    if (touchRevealTimeout.current) {
      clearTimeout(touchRevealTimeout.current);
      touchRevealTimeout.current = null;
    }
  };

  useEffect(() => () => clearTouchRevealTimeout(), []);

  return (
    <div
      className="flex min-w-max items-center"
      style={{
        minWidth: trackWidth,
        paddingLeft: virtualOffsetPx,
        columnGap: gap,
      }}
    >
        {items.map(({ month, phase }, idx) => {
        const monthKey = buildMonthKey(month);
        const phaseKey = `${monthKey}-${phase}`;
        const isHovered = hoveredKey === phaseKey;
          const isCycleActive = revealedCycleKey === monthKey;
          const isFullPhase = phase === 'luaCheia';
          const isNewPhase = phase === 'luaNova';

        const isHighlighted =
          highlightTarget &&
          highlightTarget.phase === phase &&
          highlightTarget.monthNumber === month.monthNumber &&
          highlightTarget.year === month.year;

          const floatDirection = idx % 2 === 0 ? 'up' : 'down';
          const floatOffset = getFloatOffset(floatDirection, idx);
          const delay = idx * 0.015;
          const initialY = floatDirection === 'up' ? 10 : -10;
          const orbitOffsets: Record<MoonPhase, { x: number; y: number }> = {
            luaNova: { x: 0, y: -orbitRadius },
            luaCrescente: { x: orbitRadius, y: 0 },
            luaCheia: { x: 0, y: orbitRadius },
            luaMinguante: { x: -orbitRadius, y: 0 },
          };
          const targetOffset = orbitOffsets[phase] ?? { x: 0, y: 0 };
          const translatedX = isCycleActive ? targetOffset.x : 0;
          const translatedY = isCycleActive ? targetOffset.y : 0;
          const tooltipDirection = isCycleActive ? (isNewPhase ? 'up' : isFullPhase ? 'down' : floatDirection) : floatDirection;

        const monthPhaseLabel = phase === 'luaNova' ? month.newMoonSign : month.fullMoonSign;
        const monthPhaseDate = phase === 'luaNova' ? month.newMoonDate : month.fullMoonDate;

        return (
          <motion.div
            key={phaseKey}
            transition={{
              ...ANIMATION_CONFIG.spring,
              delay,
            }}
            animate={{
              opacity: 1,
                y: translatedY,
                x: translatedX,
              scale: 1,
            }}
              initial={{ opacity: 0, y: initialY, x: 0, scale: 0.95 }}
            onPointerEnter={() => {
              clearTouchRevealTimeout();
              setHoveredKey(phaseKey);
                onCycleReveal(monthKey);
            }}
            onPointerLeave={() => {
              clearTouchRevealTimeout();
              setHoveredKey(null);
                onCycleReveal(null);
            }}
            onTouchStart={() => {
              clearTouchRevealTimeout();
              setHoveredKey(phaseKey);
                onCycleReveal(monthKey);
            }}
            onTouchEnd={() => {
              setHoveredKey(null);
              clearTouchRevealTimeout();
              touchRevealTimeout.current = setTimeout(() => {
                  onCycleReveal(null);
                touchRevealTimeout.current = null;
              }, 900);
            }}
            onTouchCancel={() => {
              clearTouchRevealTimeout();
              setHoveredKey(null);
                onCycleReveal(null);
            }}
            onFocus={() => {
              setHoveredKey(phaseKey);
                onCycleReveal(monthKey);
            }}
            onBlur={() => {
              setHoveredKey(null);
                onCycleReveal(null);
            }}
            style={{ width: tileWidth }}
            className="relative"
          >
            <div className="relative flex flex-col items-center justify-center cursor-pointer">
                {isHovered && (
                <motion.div
                    initial={{ opacity: 0, y: tooltipDirection === 'up' ? 10 : -10 }}
                    animate={{ opacity: 1, y: tooltipDirection === 'up' ? -8 : 8 }}
                    exit={{ opacity: 0, y: tooltipDirection === 'up' ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                    className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-sky-400/30 bg-slate-900/95 px-3 py-2 text-xs text-sky-200 shadow-lg backdrop-blur ${tooltipDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                >
                  <div className="font-semibold">
                    {month.monthName} {month.year}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-300/80">
                    {phase === 'luaNova' ? '🌑' : '🌕'} {monthPhaseLabel || '—'}
                  </div>
                  {monthPhaseDate && (
                    <div className="text-[10px] text-slate-400">{monthPhaseDate}</div>
                  )}
                </motion.div>
              )}

              {isHighlighted && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-400/20 blur-xl"
                  animate={{ opacity: [0.5, 0.25, 0.5], scale: [1, 1.05, 1] }}
                  transition={ANIMATION_CONFIG.glow}
                />
              )}

              {isHovered && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-300/50 to-sky-400/0 blur-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}

              <CelestialObject
                type={phase}
                interactive
                onClick={() => onMoonClick(month, phase)}
                floatOffset={floatOffset}
                className={
                  isHovered
                    ? 'ring-2 ring-sky-300/80 shadow-[0_0_0_8px_rgba(56,189,248,0.25)] transition-all duration-200 scale-110'
                    : isHighlighted
                      ? 'ring-2 ring-sky-300/80 shadow-[0_0_0_5px_rgba(56,189,248,0.28)] transition-all duration-300'
                      : 'ring-1 ring-white/5 transition-all duration-300'
                }
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MoonRow;
