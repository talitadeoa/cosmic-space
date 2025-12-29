/**
 * Controles de navegação (mês anterior, próximo, hoje)
 */

import React from 'react';
import styles from './styles/NavigationControls.module.css';

interface NavigationControlsProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  locale?: 'pt-BR' | 'en-US';
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevMonth,
  onNextMonth,
  onToday,
  locale = 'pt-BR',
}) => {
  const labels = {
    'pt-BR': {
      prev: 'Mês anterior',
      next: 'Próximo mês',
      today: 'Hoje',
    },
    'en-US': {
      prev: 'Previous month',
      next: 'Next month',
      today: 'Today',
    },
  };

  const currentLabels = labels[locale];

  return (
    <div className={styles.navigationControls} role="toolbar" aria-label="Controles de navegação">
      <button
        className={styles.navButton}
        onClick={onPrevMonth}
        title={currentLabels.prev}
        aria-label={currentLabels.prev}
      >
        <span className={styles.arrow}>←</span>
      </button>

      <button
        className={styles.todayButton}
        onClick={onToday}
        title={currentLabels.today}
        aria-label={currentLabels.today}
      >
        {locale === 'pt-BR' ? 'Hoje' : 'Today'}
      </button>

      <button
        className={styles.navButton}
        onClick={onNextMonth}
        title={currentLabels.next}
        aria-label={currentLabels.next}
      >
        <span className={styles.arrow}>→</span>
      </button>
    </div>
  );
};

export default NavigationControls;
