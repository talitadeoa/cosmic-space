'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import styles from './LunarCalendarWidget.module.css';

export type LunarPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface LunarDayData {
  phase: LunarPhase;
  illumination: number; // 0 to 1
  showIcon?: boolean;
  hasEvent?: boolean;
}

export interface LunarCalendarWidgetProps {
  month: number; // 1-12
  year: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  lunarDataByDate?: Record<string, LunarDayData>;
  onMonthChange?: (year: number, month: number) => void;
}

const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const weekdayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const monthShort = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];
const monthLong = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const phaseLabels: Record<LunarPhase, string> = {
  new: 'Lua Nova',
  'waxing-crescent': 'Lua Crescente',
  'first-quarter': 'Quarto Crescente',
  'waxing-gibbous': 'Gibosa Crescente',
  full: 'Lua Cheia',
  'waning-gibbous': 'Gibosa Minguante',
  'last-quarter': 'Quarto Minguante',
  'waning-crescent': 'Lua Minguante',
};

const phaseIllumination: Record<LunarPhase, number> = {
  new: 0,
  'waxing-crescent': 0.25,
  'first-quarter': 0.5,
  'waxing-gibbous': 0.75,
  full: 1,
  'waning-gibbous': 0.75,
  'last-quarter': 0.5,
  'waning-crescent': 0.25,
};

const phaseWaxing: Record<LunarPhase, boolean> = {
  new: true,
  'waxing-crescent': true,
  'first-quarter': true,
  'waxing-gibbous': true,
  full: true,
  'waning-gibbous': false,
  'last-quarter': false,
  'waning-crescent': false,
};

interface CalendarCell {
  date: Date;
  inMonth: boolean;
}

const pad = (value: number) => value.toString().padStart(2, '0');

const toDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const buildMonthGrid = (year: number, month: number): CalendarCell[] => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    if (i < firstDay) {
      const day = prevMonthDays - firstDay + i + 1;
      cells.push({ date: new Date(year, month - 2, day), inMonth: false });
      continue;
    }

    const dayNumber = i - firstDay + 1;
    if (dayNumber <= daysInMonth) {
      cells.push({ date: new Date(year, month - 1, dayNumber), inMonth: true });
      continue;
    }

    const nextMonthDay = dayNumber - daysInMonth;
    cells.push({ date: new Date(year, month, nextMonthDay), inMonth: false });
  }

  return cells;
};

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatSelectedLabel = (date: Date) => {
  const weekday = weekdayNames[date.getDay()];
  const month = monthShort[date.getMonth()];
  return `${weekday}, ${month} ${date.getDate()}`;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const MoonPhaseIcon: React.FC<{
  phase: LunarPhase;
  illumination?: number;
  size?: number;
  className?: string;
}> = ({ phase, illumination, size = 220, className }) => {
  const id = useId();
  const fallbackIllumination = phaseIllumination[phase];
  const ratio = clamp(illumination ?? fallbackIllumination, 0, 1);
  const waxing = phaseWaxing[phase];
  const radius = size / 2;
  const offset = ratio * radius * 2;
  const maskCx = radius + (waxing ? offset : -offset);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <mask id={`moon-mask-${id}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={maskCx} cy={radius} r={radius} fill="black" />
        </mask>
      </defs>
      <circle cx={radius} cy={radius} r={radius} fill="#0b0f14" />
      <circle cx={radius} cy={radius} r={radius} fill="#dfe6f2" mask={`url(#moon-mask-${id})`} />
    </svg>
  );
};

const LunarCalendarWidget: React.FC<LunarCalendarWidgetProps> = ({
  month,
  year,
  selectedDate,
  onSelectDate,
  lunarDataByDate = {},
  onMonthChange,
}) => {
  const [internalMonth, setInternalMonth] = useState(month);
  const [internalYear, setInternalYear] = useState(year);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const viewMonth = onMonthChange ? month : internalMonth;
  const viewYear = onMonthChange ? year : internalYear;

  useEffect(() => {
    if (!onMonthChange) {
      setInternalMonth(month);
      setInternalYear(year);
    }
  }, [month, year, onMonthChange]);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedKey = toDateKey(selectedDate);
  const selectedData = lunarDataByDate[selectedKey];
  const heroPhase = selectedData?.phase ?? 'new';
  const heroIllumination = selectedData?.illumination ?? phaseIllumination[heroPhase];
  const heroLabel = phaseLabels[heroPhase];

  const handleMonthShift = (delta: number) => {
    const nextMonthIndex = viewMonth - 1 + delta;
    const nextDate = new Date(viewYear, nextMonthIndex, 1);
    const nextMonth = nextDate.getMonth() + 1;
    const nextYear = nextDate.getFullYear();

    if (onMonthChange) {
      onMonthChange(nextYear, nextMonth);
    } else {
      setInternalMonth(nextMonth);
      setInternalYear(nextYear);
    }
  };

  const handleDaySelect = (date: Date, inMonth: boolean) => {
    if (!inMonth) {
      const nextMonth = date.getMonth() + 1;
      const nextYear = date.getFullYear();
      if (onMonthChange) {
        onMonthChange(nextYear, nextMonth);
      } else {
        setInternalMonth(nextMonth);
        setInternalYear(nextYear);
      }
    }
    onSelectDate(date);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) > 50) {
      handleMonthShift(delta > 0 ? -1 : 1);
    }
    setTouchStartX(null);
  };

  const percentLabel = `${(heroIllumination * 100).toFixed(1)}%`;
  const today = new Date();

  return (
    <section
      className={styles.widget}
      aria-label="Calendario lunar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.hero} aria-live="polite">
        <div className={styles.moonCard}>
          <MoonPhaseIcon
            phase={heroPhase}
            illumination={heroIllumination}
            className={styles.moonHero}
          />
          <p className={styles.moonLabel}>
            {heroLabel} {percentLabel}
          </p>
        </div>
      </div>

      <div
        className={styles.calendar}
        role="grid"
        aria-label={`Calendario de ${monthLong[viewMonth - 1]} de ${viewYear}`}
      >
        <header className={styles.calendarHeader}>
          <div>
            <p className={styles.headerDay}>{formatSelectedLabel(selectedDate)}</p>
            <p className={styles.headerMonth}>
              {monthLong[viewMonth - 1]} {viewYear}
            </p>
          </div>
          <div className={styles.navButtons}>
            <button
              type="button"
              onClick={() => handleMonthShift(-1)}
              aria-label="Mes anterior"
              className={styles.navButton}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => handleMonthShift(1)}
              aria-label="Proximo mes"
              className={styles.navButton}
            >
              ›
            </button>
          </div>
        </header>

        <div className={styles.weekdays}>
          {weekdayLabels.map((label, index) => (
            <span key={`${label}-${index}`} className={styles.weekday}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.grid} key={`${viewYear}-${viewMonth}`}>
          {grid.map((cell) => {
            const dateKey = toDateKey(cell.date);
            const data = lunarDataByDate[dateKey];
            const isSelected = isSameDay(cell.date, selectedDate);
            const isToday = isSameDay(cell.date, today);
            const ariaLabelParts = [
              `${weekdayNames[cell.date.getDay()]}, ${cell.date.getDate()} de ${monthLong[cell.date.getMonth()]}`,
            ];
            if (data?.phase) {
              const phasePercent = `${(data.illumination * 100).toFixed(0)}%`;
              ariaLabelParts.push(`${phaseLabels[data.phase]} ${phasePercent}`);
            }
            if (!cell.inMonth) {
              ariaLabelParts.push('fora do mes atual');
            }

            return (
              <button
                type="button"
                key={dateKey}
                className={styles.dayButton}
                data-selected={isSelected}
                data-outside={!cell.inMonth}
                data-today={isToday}
                onClick={() => handleDaySelect(cell.date, cell.inMonth)}
                aria-label={ariaLabelParts.join(' - ')}
                aria-selected={isSelected}
              >
                <span className={styles.dayNumber}>{cell.date.getDate()}</span>
                {data?.showIcon && (
                  <MoonPhaseIcon
                    phase={data.phase}
                    illumination={data.illumination}
                    size={16}
                    className={styles.miniMoon}
                  />
                )}
                {data?.hasEvent && <span className={styles.eventDot} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LunarCalendarWidget;
