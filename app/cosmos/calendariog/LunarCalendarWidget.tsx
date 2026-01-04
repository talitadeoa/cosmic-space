'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';

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
      className="relative grid min-h-screen grid-cols-[minmax(240px,0.9fr)_minmax(320px,1.2fr)] gap-[clamp(20px,4vw,40px)] overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(58,77,110,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(120,160,220,0.15),transparent_50%),#0b0f14] p-[clamp(28px,5vw,48px)] font-['Space_Grotesk','Sora',sans-serif] text-[#f2f6ff] shadow-[0_24px_60px_rgba(2,8,20,0.55)] before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0.5px,transparent_1.5px),radial-gradient(circle,rgba(255,255,255,0.08)_0.5px,transparent_1.2px)] before:[background-size:140px_140px,220px_220px] before:[background-position:0_0,80px_40px] before:opacity-[0.35] after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:bg-[linear-gradient(120deg,rgba(9,12,18,0.7),transparent_60%)] max-[900px]:grid-cols-1"
      aria-label="Calendario lunar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative z-[1] flex items-center justify-center" aria-live="polite">
        <div className="flex w-[min(320px,100%)] flex-col items-center justify-center gap-[18px] rounded-[32px] bg-[rgba(16,22,32,0.86)] p-[clamp(20px,4vw,30px)] shadow-[inset_0_0_30px_rgba(16,22,32,0.4),0_18px_50px_rgba(2,8,20,0.55)] backdrop-blur-[10px] [aspect-ratio:1/1.2] max-[900px]:w-full">
          <MoonPhaseIcon
            phase={heroPhase}
            illumination={heroIllumination}
            className="h-[min(220px,60vw)] w-[min(220px,60vw)] rounded-full shadow-[0_0_40px_rgba(180,200,240,0.12)]"
          />
          <p className="text-[1.05rem] font-normal text-[#d8dee9]">
            {heroLabel} {percentLabel}
          </p>
        </div>
      </div>

      <div
        className="relative z-[1] flex flex-col gap-[20px] rounded-[24px] bg-[rgba(16,22,32,0.86)] p-[clamp(20px,4vw,32px)] shadow-[inset_0_0_30px_rgba(16,22,32,0.4)]"
        role="grid"
        aria-label={`Calendario de ${monthLong[viewMonth - 1]} de ${viewYear}`}
      >
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[1.05rem] font-light lowercase text-[#f2f6ff]">
              {formatSelectedLabel(selectedDate)}
            </p>
            <p className="mt-[6px] text-[0.95rem] text-[#9aa6b8]">
              {monthLong[viewMonth - 1]} {viewYear}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleMonthShift(-1)}
              aria-label="Mes anterior"
              className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[1.2rem] text-[#f2f6ff] transition-[transform,background-color] duration-200 ease-in hover:-translate-y-[1px] hover:bg-[rgba(255,255,255,0.12)]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => handleMonthShift(1)}
              aria-label="Proximo mes"
              className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[1.2rem] text-[#f2f6ff] transition-[transform,background-color] duration-200 ease-in hover:-translate-y-[1px] hover:bg-[rgba(255,255,255,0.12)]"
            >
              ›
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-2 text-center text-[0.8rem] tracking-[0.08em] text-[#9aa6b8]">
          {weekdayLabels.map((label, index) => (
            <span key={`${label}-${index}`} className="uppercase">
              {label}
            </span>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-[10px] animate-month-enter max-[600px]:gap-[6px]"
          key={`${viewYear}-${viewMonth}`}
        >
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
                className="relative flex h-12 flex-col items-center justify-center gap-1 rounded-full border-0 bg-transparent text-[0.9rem] text-[#f2f6ff] transition-colors duration-200 before:absolute before:inset-1 before:z-0 before:rounded-full before:bg-transparent before:transition-[background-color,box-shadow] before:duration-200 before:ease-in before:content-[''] data-[selected=true]:before:bg-[rgba(148,163,184,0.25)] data-[selected=true]:before:shadow-[0_0_18px_rgba(120,160,220,0.2)] data-[today=true]:text-white data-[today=true]:before:border data-[today=true]:before:border-[rgba(255,255,255,0.25)] data-[outside=true]:opacity-30 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(148,163,184,0.6)] max-[600px]:h-[42px] max-[600px]:text-[0.85rem]"
                data-selected={isSelected}
                data-outside={!cell.inMonth}
                data-today={isToday}
                onClick={() => handleDaySelect(cell.date, cell.inMonth)}
                aria-label={ariaLabelParts.join(' - ')}
                aria-selected={isSelected}
              >
                <span className="relative z-[1]">{cell.date.getDate()}</span>
                {data?.showIcon && (
                  <MoonPhaseIcon
                    phase={data.phase}
                    illumination={data.illumination}
                    size={16}
                    className="relative z-[1] h-4 w-4 opacity-[0.85]"
                  />
                )}
                {data?.hasEvent && (
                  <span
                    className="relative z-[1] h-1 w-1 rounded-full bg-[rgba(210,230,255,0.7)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LunarCalendarWidget;
