'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

/**
 * Card genérico reutilizável
 * Consolidado de:
 * - components/shared/cosmos/Card.tsx
 * - app/cosmos/components/Card.tsx
 */
export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  interactive = false,
  onClick,
  variant = 'default',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.();
  };

  const variants = {
    default:
      'bg-white/10 p-6 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]',
    outlined: 'bg-transparent border-2 border-white/30 p-6',
    elevated: 'bg-white/15 p-6 backdrop-blur-xl border border-white/40 shadow-lg',
  };

  return (
    <motion.div
      onClick={handleClick}
      className={[
        'rounded-3xl',
        variants[variant],
        interactive && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      initial={{ opacity: 0.8, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
    >
      {children}
    </motion.div>
  );
};
