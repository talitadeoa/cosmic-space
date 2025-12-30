'use client';

import React, { useCallback } from 'react';
import type { TabItem } from '../types/screen';

interface AccessibleTabsProps {
  /**
   * Lista de abas
   */
  items: TabItem[];

  /**
   * Valor da aba atualmente selecionada
   */
  value: string;

  /**
   * Callback ao trocar de aba
   */
  onChange: (value: string) => void;

  /**
   * ID único para o container de tabs (para acessibilidade)
   */
  id?: string;

  /**
   * Classes CSS customizadas para o container
   */
  containerClassName?: string;

  /**
   * Classes CSS customizadas para a aba ativa
   */
  activeClassName?: string;

  /**
   * Classes CSS customizadas para a aba inativa
   */
  inactiveClassName?: string;
}

/**
 * Accessible Tabs Component
 *
 * Implementa padrão WAI-ARIA:
 * - role="tablist" no container
 * - role="tab" em cada aba
 * - aria-selected para estado
 * - Navegação por teclado (Arrow Keys, Home, End)
 * - Focus ring visível
 */
export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  items,
  value,
  onChange,
  id = 'tabs',
  containerClassName = '',
  activeClassName = 'border-indigo-400 bg-indigo-500/20 text-indigo-100',
  inactiveClassName = 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60',
}) => {
  const currentIndex = items.findIndex((item) => item.value === value);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex = index;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (index + 1) % items.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (index - 1 + items.length) % items.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      onChange(items[nextIndex].value);
      // Focus management
      setTimeout(() => {
        document.getElementById(`${id}-tab-${nextIndex}`)?.focus();
      }, 0);
    },
    [items, onChange, id]
  );

  return (
    <div
      role="tablist"
      className={`flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 sm:pb-4 ${containerClassName}`}
      aria-label="Navigation tabs"
    >
      {items.map((item, index) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            id={`${id}-tab-${index}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`${id}-panel-${item.value}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              isActive ? activeClassName : inactiveClassName
            }`}
          >
            {item.icon && <span className="flex items-center justify-center">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AccessibleTabs;
