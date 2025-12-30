/**
 * Componente hero com visualização da lua e dados da fase
 */

import React from 'react';
import { LunarData } from './types';
import { MoonPhaseIcon } from './MoonPhaseIcon';
import styles from './styles/LunarHero.module.css';

interface LunarHeroProps {
  date: Date;
  lunarData?: LunarData;
  locale?: 'pt-BR' | 'en-US';
}

export const LunarHero: React.FC<LunarHeroProps> = ({ date, lunarData, locale = 'pt-BR' }) => {
  const dayOfWeek = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const displayDate = `${dayOfWeek}, ${formattedDate}`;

  return (
    <div className={styles.lunarHero} role="region" aria-label="Visualização lunar">
      {/* Cabeçalho com data */}
      <div className={styles.header}>
        <h2 className={styles.dateText}>{displayDate}</h2>
      </div>

      {/* Container visual da lua */}
      <div className={styles.moonContainer}>
        <div className={styles.moonCircle}>
          {lunarData ? (
            <MoonPhaseIcon
              phase={lunarData.phase}
              illumination={lunarData.illumination}
              size="large"
              aria-label={`Fase lunar: ${lunarData.phaseName}`}
            />
          ) : (
            <div className={styles.moonPlaceholder}>
              <p>Sem dados</p>
            </div>
          )}
        </div>
      </div>

      {/* Informações da fase */}
      {lunarData && (
        <div className={styles.phaseInfo}>
          <h3 className={styles.phaseName}>{lunarData.phaseName}</h3>
          <p className={styles.illumination}>{lunarData.illumination.toFixed(1)}% iluminada</p>
          {lunarData.daysInPhase && (
            <p className={styles.daysInPhase}>
              {lunarData.daysInPhase} dia{lunarData.daysInPhase !== 1 ? 's' : ''} nesta fase
            </p>
          )}
        </div>
      )}

      {/* Decoração de estrelas sutil */}
      <div className={styles.starDecoration} aria-hidden="true">
        <span className={styles.star} style={{ left: '10%', top: '15%' }}>
          ✦
        </span>
        <span className={styles.star} style={{ right: '15%', top: '20%' }}>
          ✦
        </span>
        <span className={styles.star} style={{ left: '5%', bottom: '25%' }}>
          ✦
        </span>
      </div>
    </div>
  );
};

export default LunarHero;
