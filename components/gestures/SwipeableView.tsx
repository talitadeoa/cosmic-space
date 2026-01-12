'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import { useNativeGestures } from '@/hooks/useNativeGestures';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import type { SwipeGesture } from '@/types/gestures';

export interface SwipeableViewProps {
  children: React.ReactNode;
  /** Callback quando swipe left é confirmado */
  onSwipeLeft?: () => void;
  /** Callback quando swipe right é confirmado */
  onSwipeRight?: () => void;
  /** Callback quando swipe up é confirmado */
  onSwipeUp?: () => void;
  /** Callback quando swipe down é confirmado */
  onSwipeDown?: () => void;
  /** Distância mínima para confirmar swipe */
  threshold?: number;
  /** Habilita feedback visual durante swipe */
  visualFeedback?: boolean;
  /** Habilita haptic feedback */
  hapticFeedback?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Direções permitidas para swipe */
  allowedDirections?: ('left' | 'right' | 'up' | 'down')[];
  /** Mostra indicadores de direção */
  showIndicators?: boolean;
  /** Habilita navegação por teclado (setas) */
  enableKeyboardNavigation?: boolean;
  /** Aria label para acessibilidade */
  ariaLabel?: string;
}

/**
 * Componente wrapper com suporte a swipe animado
 * 
 * @example
 * <SwipeableView
 *   onSwipeLeft={() => nextSlide()}
 *   onSwipeRight={() => prevSlide()}
 *   showIndicators
 * >
 *   <SlideContent />
 * </SwipeableView>
 */
export function SwipeableView({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
  visualFeedback = true,
  hapticFeedback = true,
  className = '',
  allowedDirections = ['left', 'right', 'up', 'down'],
  showIndicators = false,
  enableKeyboardNavigation = true,
  ariaLabel = 'Área navegável por gestos ou setas do teclado',
}: SwipeableViewProps) {
  const controls = useAnimation();
  const [dragDirection, setDragDirection] = useState<string | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { triggerHaptic, hapticPattern } = useNativeGestures(
    {},
    { hapticFeedback }
  );

  /**
   * Handler para navegação por teclado (setas)
   */
  const { handleKeyDown } = useKeyboardNavigation({
    enableArrowKeys: enableKeyboardNavigation,
    orientation: 'both',
    onArrowKey: async (direction) => {
      if (!enableKeyboardNavigation) return;
      
      switch (direction) {
        case 'left':
          if (allowedDirections.includes('left') && onSwipeLeft) {
            if (hapticFeedback) await hapticPattern('swipe');
            onSwipeLeft();
          }
          break;
        case 'right':
          if (allowedDirections.includes('right') && onSwipeRight) {
            if (hapticFeedback) await hapticPattern('swipe');
            onSwipeRight();
          }
          break;
        case 'up':
          if (allowedDirections.includes('up') && onSwipeUp) {
            if (hapticFeedback) await hapticPattern('swipe');
            onSwipeUp();
          }
          break;
        case 'down':
          if (allowedDirections.includes('down') && onSwipeDown) {
            if (hapticFeedback) await hapticPattern('swipe');
            onSwipeDown();
          }
          break;
      }
    },
    enableEscape: false,
    enableEnterSpace: false,
    enableHomeEnd: false,
  });

  /**
   * Handler para movimento de arrasto
   */
  const handleDrag = useCallback((_event: PointerEvent | TouchEvent | MouseEvent, info: PanInfo) => {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // Determina direção dominante
    if (absX > absY && absX > 20) {
      setDragDirection(offset.x > 0 ? 'right' : 'left');
      setDragProgress(Math.min(absX / threshold, 1));
    } else if (absY > absX && absY > 20) {
      setDragDirection(offset.y > 0 ? 'down' : 'up');
      setDragProgress(Math.min(absY / threshold, 1));
    }
  }, [threshold]);

  /**
   * Handler para fim do arrasto
   */
  const handleDragEnd = useCallback(async (_event: PointerEvent | TouchEvent | MouseEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // Verifica se passou do threshold ou tem velocidade alta
    const shouldTriggerX = absX > threshold || Math.abs(velocity.x) > 500;
    const shouldTriggerY = absY > threshold || Math.abs(velocity.y) > 500;

    let triggered = false;

    if (absX > absY && shouldTriggerX) {
      if (offset.x > 0 && allowedDirections.includes('right') && onSwipeRight) {
        triggered = true;
        if (hapticFeedback) await hapticPattern('swipe');
        onSwipeRight();
      } else if (offset.x < 0 && allowedDirections.includes('left') && onSwipeLeft) {
        triggered = true;
        if (hapticFeedback) await hapticPattern('swipe');
        onSwipeLeft();
      }
    } else if (absY > absX && shouldTriggerY) {
      if (offset.y > 0 && allowedDirections.includes('down') && onSwipeDown) {
        triggered = true;
        if (hapticFeedback) await hapticPattern('swipe');
        onSwipeDown();
      } else if (offset.y < 0 && allowedDirections.includes('up') && onSwipeUp) {
        triggered = true;
        if (hapticFeedback) await hapticPattern('swipe');
        onSwipeUp();
      }
    }

    // Anima de volta à posição original se não triggerou
    if (!triggered) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
    }

    setDragDirection(null);
    setDragProgress(0);
  }, [threshold, allowedDirections, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, hapticFeedback, hapticPattern, controls]);

  // Constraints de arrasto
  const dragConstraints = {
    left: allowedDirections.includes('left') ? -window.innerWidth : 0,
    right: allowedDirections.includes('right') ? window.innerWidth : 0,
    top: allowedDirections.includes('up') ? -window.innerHeight : 0,
    bottom: allowedDirections.includes('down') ? window.innerHeight : 0,
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
      onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
      tabIndex={enableKeyboardNavigation ? 0 : undefined}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="Navegue com gestos de deslizar ou use as setas do teclado"
    >
      {/* Indicadores de direção */}
      {showIndicators && (
        <AnimatePresence>
          {dragDirection === 'left' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: dragProgress, x: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">→</span>
              </div>
            </motion.div>
          )}
          {dragDirection === 'right' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: dragProgress, x: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">←</span>
              </div>
            </motion.div>
          )}
          {dragDirection === 'up' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: dragProgress, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">↑</span>
              </div>
            </motion.div>
          )}
          {dragDirection === 'down' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: dragProgress, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">↓</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Conteúdo arrastável */}
      <motion.div
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full h-full"
        style={{
          opacity: visualFeedback ? 1 - dragProgress * 0.3 : 1,
          scale: visualFeedback ? 1 - dragProgress * 0.05 : 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export interface PullToRefreshProps {
  children: React.ReactNode;
  /** Callback quando refresh é acionado */
  onRefresh: () => Promise<void>;
  /** Distância para acionar refresh */
  threshold?: number;
  /** Cor do indicador de loading */
  indicatorColor?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente de Pull to Refresh nativo
 * 
 * @example
 * <PullToRefresh onRefresh={async () => await fetchData()}>
 *   <ContentList />
 * </PullToRefresh>
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  indicatorColor = '#9333ea',
  className = '',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { hapticPattern } = useNativeGestures({}, { hapticFeedback: true });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Só permite pull se estiver no topo do scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || startY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Aplica resistência
      const resistance = Math.min(diff * 0.5, threshold * 1.5);
      setPullDistance(resistance);
      
      if (resistance >= threshold && !canRefresh) {
        setCanRefresh(true);
        hapticPattern('selection');
      } else if (resistance < threshold && canRefresh) {
        setCanRefresh(false);
      }
    }
  }, [isRefreshing, threshold, canRefresh, hapticPattern]);

  const handleTouchEnd = useCallback(async () => {
    startY.current = 0;

    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await hapticPattern('lunar');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setCanRefresh(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [canRefresh, isRefreshing, onRefresh, hapticPattern]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicador de Pull */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center items-center"
        style={{
          top: -60,
          height: 60,
        }}
        animate={{
          y: pullDistance,
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: indicatorColor }}
          animate={{
            rotate: isRefreshing ? 360 : pullDistance * 3,
            scale: canRefresh ? 1.2 : 1,
          }}
          transition={{
            rotate: isRefreshing ? { repeat: Number.POSITIVE_INFINITY, duration: 0.8, ease: 'linear' } : { duration: 0 },
          }}
        />
      </motion.div>

      {/* Conteúdo */}
      <motion.div
        animate={{
          y: isRefreshing ? threshold / 2 : pullDistance,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
