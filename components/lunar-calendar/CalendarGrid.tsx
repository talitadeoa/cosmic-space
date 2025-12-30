/**
 * Componente com o grid mensal do calendário
 */

import React from 'react';
import { CalendarDay } from './types';
import { MoonPhaseIcon } from './MoonPhaseIcon';
import { getWeekDayInitials } from './utils';
import styles from './styles/CalendarGrid.module.css';

interface CalendarGridProps {
  weeks: CalendarDay[][];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onDayClick?: (date: Date, lunarData?: any) => void;
  locale?: 'pt-BR' | 'en-US';
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weeks,
  selectedDate,
  onSelectDate,
  onDayClick,
  locale = 'pt-BR',
}) => {
  const weekDayInitials = getWeekDayInitials(locale);

  const handleDayClick = (day: CalendarDay) => {
    if (onSelectDate) {
      onSelectDate(day.date);
    }
    if (onDayClick) {
      onDayClick(day.date, day.lunarData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, day: CalendarDay) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  return (
    <div className={styles.calendarGrid} role="grid" aria-label="Calendário mensal">
      {/* Cabeçalho com iniciais dos dias */}
      <div className={styles.weekHeader} role="row">
        {weekDayInitials.map((initial, index) => (
          <div
            key={index}
            className={styles.weekDayInitial}
            role="columnheader"
            aria-label={getFullWeekDayName(index, locale)}
          >
            {initial}
          </div>
        ))}
      </div>

      {/* Grid com semanas e dias */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className={styles.week} role="row">
          {week.map((day, dayIndex) => (
            <div key={`${weekIndex}-${dayIndex}`} className={styles.dayCell} role="gridcell">
              <button
                className={`
                  ${styles.dayButton}
                  ${!day.isCurrentMonth ? styles.outsideMonth : ''}
                  ${day.isToday ? styles.today : ''}
                  ${day.isSelected ? styles.selected : ''}
                  ${day.isWeekend ? styles.weekend : ''}
                `}
                onClick={() => handleDayClick(day)}
                onKeyDown={(e) => handleKeyDown(e, day)}
                aria-label={getAriaLabel(day, locale)}
                aria-pressed={day.isSelected}
                tabIndex={day.isSelected ? 0 : -1}
                disabled={!day.isCurrentMonth}
              >
                {/* Fundo do dia selecionado (pill) */}
                {day.isSelected && <span className={styles.selectionPill} />}

                {/* Número do dia */}
                <span className={styles.dayNumber}>{day.dayOfMonth}</span>

                {/* Mini ícone de fase lunar */}
                {day.isCurrentMonth && day.lunarData && (
                  <div className={styles.lunarIndicator}>
                    <MoonPhaseIcon
                      phase={day.lunarData.phase}
                      illumination={day.lunarData.illumination}
                      size="small"
                      variant="circle"
                      aria-label={`${day.lunarData.phaseName}`}
                    />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

function getFullWeekDayName(index: number, locale: 'pt-BR' | 'en-US'): string {
  const ptBRDays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const enUSdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return locale === 'pt-BR' ? ptBRDays[index] : enUSdays[index];
}

function getAriaLabel(day: CalendarDay, locale: 'pt-BR' | 'en-US'): string {
  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(day.date);

  let label = dateStr;

  if (day.isToday) {
    label += locale === 'pt-BR' ? ', hoje' : ', today';
  }

  if (day.isSelected) {
    label += locale === 'pt-BR' ? ', selecionado' : ', selected';
  }

  if (day.lunarData) {
    label += `, ${day.lunarData.phaseName}, ${day.lunarData.illumination.toFixed(0)}%`;
  }

  if (!day.isCurrentMonth) {
    label += locale === 'pt-BR' ? ', fora do mês' : ', outside month';
  }

  return label;
}

export default CalendarGrid;
