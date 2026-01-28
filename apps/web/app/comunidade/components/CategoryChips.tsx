'use client';

import { memo } from 'react';

export type ChipVariant = 'type' | 'tag';

type CategoryChipsProps<T extends string> = {
  items: T[];
  activeItem: T;
  onSelect: (item: T) => void;
  variant?: ChipVariant;
  ariaLabel: string;
};

const variantStyles: Record<ChipVariant, { active: string; inactive: string }> = {
  type: {
    active: 'border-sky-400 bg-sky-500/20 text-white',
    inactive:
      'border-slate-700/70 bg-black/30 text-slate-300 hover:border-sky-400 hover:text-white',
  },
  tag: {
    active: 'border-indigo-400 bg-indigo-500/20 text-white',
    inactive:
      'border-slate-700/70 bg-black/30 text-slate-300 hover:border-indigo-400 hover:text-white',
  },
};

/**
 * Chips de categoria com scroll horizontal no mobile
 * Área de toque mínima de 44px para acessibilidade
 */
function CategoryChipsInner<T extends string>({
  items,
  activeItem,
  onSelect,
  variant = 'type',
  ariaLabel,
}: CategoryChipsProps<T>) {
  const styles = variantStyles[variant];

  return (
    <div
      className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = item === activeItem;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark ${
              isActive ? styles.active : styles.inactive
            }`}
            style={{ minHeight: '44px' }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export const CategoryChips = memo(CategoryChipsInner) as typeof CategoryChipsInner;
