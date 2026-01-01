'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMoonData, type MoonTimeData } from '@/lib/moon-calculations';
import styles from './LunarTimeScrubber.module.css';

const DAY_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addHours = (date: Date, hours: number) => {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
};

const formatDateTime = (date: Date, timeZone?: string) => {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '';
  return `${day} de ${month} as ${hour}:${minute}`;
};

type LunarTimeScrubberProps = {
  initialDate?: Date;
  timezone?: string;
  rangeDays?: number;
  onTimeChange?: (date: Date, data: MoonTimeData) => void;
};

const LunarTimeScrubber: React.FC<LunarTimeScrubberProps> = ({
  initialDate = new Date(),
  timezone,
  rangeDays = 7,
  onTimeChange,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cachedDataRef = useRef<Map<string, MoonTimeData>>(new Map());

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [containerWidth, setContainerWidth] = useState(0);

  const pixelsPerHour = 28;
  const totalHours = rangeDays * HOURS_PER_DAY;
  const timelineWidth = totalHours * pixelsPerHour;
  const timelineStart = useMemo(() => {
    const base = startOfDay(initialDate);
    const offsetDays = Math.floor(rangeDays / 2);
    base.setDate(base.getDate() - offsetDays);
    return base;
  }, [initialDate, rangeDays]);

  const getCachedMoonData = (date: Date) => {
    const key = `${date.getTime()}`;
    const cached = cachedDataRef.current.get(key);
    if (cached) return cached;
    const fresh = getMoonData(date);
    cachedDataRef.current.set(key, fresh);
    if (cachedDataRef.current.size > 500) {
      const firstKey = cachedDataRef.current.keys().next().value as string | undefined;
      if (firstKey) cachedDataRef.current.delete(firstKey);
    }
    return fresh;
  };

  const selectedMoonData = useMemo(() => getCachedMoonData(selectedDate), [selectedDate]);

  const updateSelectedFromScroll = () => {
    if (!scrollRef.current || containerWidth === 0) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const centerOffset = containerWidth / 2;
    const hoursFromStart = (scrollLeft + centerOffset) / pixelsPerHour;
    const clampedHours = clamp(hoursFromStart, 0, totalHours);
    const nextDate = addHours(timelineStart, clampedHours);
    setSelectedDate(nextDate);
    onTimeChange?.(nextDate, getCachedMoonData(nextDate));
  };

  const handleScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateSelectedFromScroll();
    });
  };

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!scrollRef.current || containerWidth === 0) return;
    const hoursFromStart =
      (initialDate.getTime() - timelineStart.getTime()) / (MINUTES_PER_HOUR * 60 * 1000);
    const centerOffset = containerWidth / 2;
    const targetLeft = hoursFromStart * pixelsPerHour - centerOffset;
    scrollRef.current.scrollLeft = clamp(targetLeft, 0, timelineWidth - containerWidth);
    updateSelectedFromScroll();
  }, [containerWidth, initialDate, timelineStart, timelineWidth]);

  const dayMarkers = useMemo(() => {
    return Array.from({ length: rangeDays }, (_, index) => {
      const dayDate = addHours(timelineStart, index * HOURS_PER_DAY);
      const dayIndex = (dayDate.getDay() + 6) % 7;
      return {
        label: DAY_LABELS[dayIndex],
        left: index * HOURS_PER_DAY * pixelsPerHour,
        date: dayDate,
      };
    });
  }, [pixelsPerHour, rangeDays, timelineStart]);

  const hourTicks = useMemo(() => {
    return Array.from({ length: totalHours + 1 }, (_, hour) => {
      const mod = hour % HOURS_PER_DAY;
      const size = mod === 0 ? 'xl' : mod % 6 === 0 ? 'lg' : 'sm';
      return { hour, left: hour * pixelsPerHour, size };
    });
  }, [pixelsPerHour, totalHours]);

  const phaseName = selectedMoonData.phaseName;
  const illuminationLabel = `${(selectedMoonData.illumination * 100).toFixed(1)}%`;

  return (
    <section className={styles.scene} ref={containerRef} aria-label="Linha do tempo lunar">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.moonWrap}>
        <MoonRenderer
          illumination={selectedMoonData.illumination}
          isWaxing={selectedMoonData.isWaxing}
        />
        <div className={styles.moonText}>
          <p className={styles.phaseLabel}>
            {phaseName} · {illuminationLabel}
          </p>
          <p className={styles.dateLabel}>{formatDateTime(selectedDate, timezone)}</p>
        </div>
      </div>

      <div className={styles.timelineZone}>
        <div className={styles.centerIndicator} aria-hidden="true">
          <span className={styles.centerLine} />
          <span className={styles.centerArrow} />
        </div>
        <div className={styles.timelineScroll} ref={scrollRef} onScroll={handleScroll}>
          <div className={styles.timeline} style={{ width: `${timelineWidth}px` }}>
            {hourTicks.map((tick) => (
              <span
                key={`tick-${tick.hour}`}
                className={`${styles.tick} ${styles[`tick-${tick.size}`]}`}
                style={{ left: `${tick.left}px` }}
                aria-hidden="true"
              />
            ))}
            {dayMarkers.map((day) => (
              <span
                key={`day-${day.left}`}
                className={styles.dayLabel}
                style={{ left: `${day.left}px` }}
              >
                {day.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MoonRenderer: React.FC<{ illumination: number; isWaxing: boolean }> = ({
  illumination,
  isWaxing,
}) => {
  const id = React.useId();
  const radius = 180;
  const size = radius * 2;
  const offset = clamp(illumination, 0, 1) * radius * 2;
  const maskCx = radius + (isWaxing ? offset : -offset);

  return (
    <svg
      className={styles.moon}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Lua renderizada"
    >
      <defs>
        <radialGradient id={`moon-surface-${id}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f2f5fb" />
          <stop offset="55%" stopColor="#d2d9e3" />
          <stop offset="100%" stopColor="#b3bdcc" />
        </radialGradient>
        <filter id={`moon-noise-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.18" />
          </feComponentTransfer>
        </filter>
        <mask id={`moon-mask-${id}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={maskCx} cy={radius} r={radius} fill="black" />
        </mask>
      </defs>
      <circle cx={radius} cy={radius} r={radius} fill="#0b0f14" />
      <circle cx={radius} cy={radius} r={radius} fill={`url(#moon-surface-${id})`} />
      <circle
        cx={radius}
        cy={radius}
        r={radius}
        fill="white"
        mask={`url(#moon-mask-${id})`}
        filter={`url(#moon-noise-${id})`}
      />
      <circle cx={radius} cy={radius} r={radius} fill="rgba(12, 16, 22, 0.35)" />
    </svg>
  );
};

export default LunarTimeScrubber;
