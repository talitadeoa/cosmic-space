/**
 * 🎴 Card - Componente unificado
 * 
 * Substitui:
 * - app/cosmos/components/Card.tsx
 * - components/shared/cosmos/Card.tsx
 * 
 * Usar este componente em todo o projeto.
 */

'use client';

import React, { type ReactNode, type MouseEvent } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// Função cn inline para evitar dependência circular
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'onClick'> {
  /** Conteúdo do card */
  children?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
  /** Se o card é clicável */
  interactive?: boolean;
  /** Callback de clique */
  onClick?: () => void;
  /** Variante visual */
  variant?: 'default' | 'glass' | 'solid' | 'outline';
  /** Tamanho do padding */
  size?: 'sm' | 'md' | 'lg';
  /** Animação ao aparecer */
  animate?: boolean;
}

const variantStyles: Record<CardProps['variant'] & string, string> = {
  default: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  solid: 'bg-slate-900 border border-slate-700',
  outline: 'bg-transparent border border-white/30',
};

const sizeStyles: Record<CardProps['size'] & string, string> = {
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = (props) => {
  const {
    className = '',
    children,
    interactive = false,
    onClick,
    variant = 'default',
    size = 'md',
    animate = true,
    ...motionProps
  } = props;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.();
  };

  const variantKey = variant as keyof typeof variantStyles;
  const sizeKey = size as keyof typeof sizeStyles;

  const baseClasses = cn(
    'rounded-3xl',
    variantStyles[variantKey],
    sizeStyles[sizeKey],
    interactive && 'cursor-pointer',
    className
  );

  // Sem animação
  if (!animate) {
    return (
      <div className={baseClasses} onClick={handleClick}>
        {children}
      </div>
    );
  }

  // Com animação
  return (
    <motion.div
      onClick={handleClick}
      className={baseClasses}
      initial={{ opacity: 0.8, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;
