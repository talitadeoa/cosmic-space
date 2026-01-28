'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useHaptics, type HapticPattern } from '@/hooks/useHaptics';
import type {
  GestureDetectorConfig,
  LongPressConfig,
  SwipeConfig,
  PinchConfig,
  TapGesture,
  DoubleTapGesture,
  LongPressGesture,
  SwipeGesture,
  PinchGesture,
  SwipeDirection,
} from '@/types/gestures';

const DEFAULT_LONG_PRESS_CONFIG: Required<LongPressConfig> = {
  duration: 500,
  threshold: 10,
};

const DEFAULT_SWIPE_CONFIG: Required<SwipeConfig> = {
  threshold: 50,
  velocity: 0.3,
};

const DEFAULT_PINCH_CONFIG: Required<PinchConfig> = {
  threshold: 20,
};

interface TouchState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
  longPressTimeout?: NodeJS.Timeout;
  touches: TouchList | null;
  lastTapTime?: number;
}

interface ExtendedGestureDetectorConfig extends GestureDetectorConfig {
  /** Habilita feedback háptico nativo (requer Capacitor) */
  hapticFeedback?: boolean;
  /** Padrão háptico customizado para cada gesto */
  hapticPatterns?: {
    tap?: HapticPattern;
    doubleTap?: HapticPattern;
    longPress?: HapticPattern;
    swipe?: HapticPattern;
    pinch?: HapticPattern;
  };
}

/**
 * Componente wrapper que detecta e dispara eventos de gestos
 * Suporta: tap, doubleTap, longPress, swipe, pinch
 * 
 * Agora com integração nativa via Capacitor:
 * - Feedback háptico automático
 * - Performance otimizada para mobile
 *
 * @example
 * <GestureDetector
 *   onTap={(gesture) => console.log('Tap em', gesture.x, gesture.y)}
 *   onSwipe={(gesture) => console.log('Swipe para', gesture.direction)}
 *   onPinch={(gesture) => console.log('Pinch com escala', gesture.scale)}
 *   hapticFeedback
 * >
 *   <div>Conteúdo interativo</div>
 * </GestureDetector>
 */
export const GestureDetector = React.forwardRef<
  HTMLDivElement,
  ExtendedGestureDetectorConfig & { children: React.ReactNode; className?: string }
>(
  (
    {
      enabled = true,
      children,
      className = '',
      onTap,
      onDoubleTap,
      onLongPress,
      onSwipe,
      onPinch,
      longPressConfig,
      swipeConfig,
      pinchConfig,
      debug = false,
      hapticFeedback = true,
      hapticPatterns = {},
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStateRef = useRef<Partial<TouchState>>({});
    const touchDistanceRef = useRef<number | null>(null);
    
    // Hook de feedback háptico nativo
    const { hapticPattern, triggerHaptic } = useHaptics();

    const longPressCfg = { ...DEFAULT_LONG_PRESS_CONFIG, ...longPressConfig };
    const swipeCfg = { ...DEFAULT_SWIPE_CONFIG, ...swipeConfig };
    const pinchCfg = { ...DEFAULT_PINCH_CONFIG, ...pinchConfig };

    const log = useCallback(
      (message: string, data?: unknown) => {
        if (debug) {
          console.warn(`[GestureDetector] ${message}`, data);
        }
      },
      [debug]
    );
    
    /**
     * Dispara feedback háptico se habilitado
     */
    const triggerFeedback = useCallback(async (gesture: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch') => {
      if (!hapticFeedback) return;
      
      const pattern = hapticPatterns[gesture];
      if (pattern) {
        await hapticPattern(pattern);
      } else {
        // Padrões default
        switch (gesture) {
          case 'tap':
            await triggerHaptic('light');
            break;
          case 'doubleTap':
            await triggerHaptic('medium');
            break;
          case 'longPress':
            await hapticPattern('longPress');
            break;
          case 'swipe':
            await hapticPattern('swipe');
            break;
          case 'pinch':
            await triggerHaptic('soft');
            break;
        }
      }
    }, [hapticFeedback, hapticPatterns, hapticPattern, triggerHaptic]);

    /**
     * Calcula direção do swipe baseado em distâncias X e Y
     */
    const getSwipeDirection = useCallback((dx: number, dy: number): SwipeDirection | null => {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Precisa de movimento mínimo em uma direção
      if (Math.max(absDx, absDy) < swipeCfg.threshold) {
        return null;
      }

      // Ignora diagonais (diferença menor que 30%)
      if (Math.abs(absDx - absDy) / Math.max(absDx, absDy) < 0.3) {
        return null;
      }

      if (absDx > absDy) {
        return dx > 0 ? 'right' : 'left';
      } else {
        return dy > 0 ? 'down' : 'up';
      }
    }, [swipeCfg.threshold]);

    /**
     * Calcula distância entre dois pontos de toque (para pinch)
     */
    const getTouchDistance = useCallback(
      (touch1: Touch, touch2: Touch): number => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      },
      []
    );

    /**
     * Calcula ponto central entre dois toques
     */
    const getTouchCenterPoint = useCallback(
      (touch1: Touch, touch2: Touch): { x: number; y: number } => {
        return {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
      },
      []
    );

    /**
     * Handler para início de toque
     */
    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
        if (!enabled) return;

        const touches = (e as TouchEvent).touches || (e as React.TouchEvent).nativeEvent.touches;
        if (!touches || touches.length === 0) return;

        const touch = touches[0];
        const state: Partial<TouchState> = {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now(),
          touches,
        };

        touchStateRef.current = state;

        // Para pinch, registra distância inicial entre dois dedos
        if (touches.length === 2) {
          touchDistanceRef.current = getTouchDistance(touches[0], touches[1]);
        }

        // Setup para long press
        if (onLongPress && !touchStateRef.current.longPressTimeout) {
          const timeout = setTimeout(() => {
            const currentState = touchStateRef.current;
            if (!currentState.startX || !currentState.startY) return;

            const dx = (currentState.endX || currentState.startX) - currentState.startX;
            const dy = (currentState.endY || currentState.startY) - currentState.startY;

            // Valida movimento dentro do threshold
            if (Math.abs(dx) <= longPressCfg.threshold && Math.abs(dy) <= longPressCfg.threshold) {
              const gesture: LongPressGesture = {
                type: 'longPress',
                x: currentState.startX,
                y: currentState.startY,
                startTime: currentState.startTime ?? 0,
                duration: Date.now() - (currentState.startTime ?? 0),
                element: containerRef.current || undefined,
              };

              log('Long press detectado', gesture);
              triggerFeedback('longPress');
              onLongPress(gesture);
            }

            touchStateRef.current.longPressTimeout = undefined;
          }, longPressCfg.duration);

          touchStateRef.current.longPressTimeout = timeout;
        }

        log('Touch start', { x: touch.clientX, y: touch.clientY, touchCount: touches.length });
      },
      [enabled, onLongPress, longPressCfg, getTouchDistance, log]
    );

    /**
     * Handler para movimento de toque
     */
    const handleTouchMove = useCallback(
      (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
        if (!enabled) return;

        const touches = (e as TouchEvent).touches || (e as React.TouchEvent).nativeEvent.touches;
        if (!touches || touches.length === 0) return;

        const touch = touches[0];
        const state = touchStateRef.current;

        state.endX = touch.clientX;
        state.endY = touch.clientY;
        state.endTime = Date.now();

        // Cancela long press se movimento for muito grande
        if (state.longPressTimeout) {
          const dx = (state.endX || 0) - (state.startX || 0);
          const dy = (state.endY || 0) - (state.startY || 0);

          if (Math.abs(dx) > longPressCfg.threshold || Math.abs(dy) > longPressCfg.threshold) {
            clearTimeout(state.longPressTimeout);
            state.longPressTimeout = undefined;
            log('Long press cancelado por movimento', { dx, dy });
          }
        }

        // Atualiza distância para pinch
        if (touches.length === 2 && onPinch) {
          const currentDistance = getTouchDistance(touches[0], touches[1]);
          if (touchDistanceRef.current && currentDistance) {
            const scaleDiff = Math.abs(currentDistance - touchDistanceRef.current);
            if (scaleDiff > pinchCfg.threshold) {
              const scale = currentDistance / touchDistanceRef.current;
              const center = getTouchCenterPoint(touches[0], touches[1]);

              const gesture: PinchGesture = {
                type: 'pinch',
                scale,
                x: center.x,
                y: center.y,
                element: containerRef.current || undefined,
              };

              log('Pinch detectado', gesture);
              triggerFeedback('pinch');
              onPinch(gesture);

              // Atualiza referência para próximo cálculo
              touchDistanceRef.current = currentDistance;
            }
          }
        }
      },
      [enabled, onPinch, pinchCfg, getTouchDistance, getTouchCenterPoint, log]
    );

    /**
     * Handler para fim de toque
     */
    const handleTouchEnd = useCallback(
      (_e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
        if (!enabled) return;

        const state = touchStateRef.current;

        // Cancela long press
        if (state.longPressTimeout) {
          clearTimeout(state.longPressTimeout);
          state.longPressTimeout = undefined;
        }

        if (
          !state.startX ||
          !state.startY ||
          state.endX === undefined ||
          state.endY === undefined ||
          !state.startTime ||
          !state.endTime
        ) {
          return;
        }

        const dx = state.endX - state.startX;
        const dy = state.endY - state.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = state.endTime - state.startTime;
        const velocity = distance / duration;

        // Detecta swipe
        if (onSwipe && duration < 300 && velocity > swipeCfg.velocity) {
          const direction = getSwipeDirection(dx, dy);
          if (direction) {
            const gesture: SwipeGesture = {
              type: 'swipe',
              direction,
              distance,
              velocity,
              startX: state.startX,
              startY: state.startY,
              endX: state.endX,
              endY: state.endY,
              duration,
              element: containerRef.current || undefined,
            };

            log('Swipe detectado', gesture);
            triggerFeedback('swipe');
            onSwipe(gesture);
          }
        }

        // Detecta tap (movimento mínimo)
        if (onTap && distance < longPressCfg.threshold && duration < 300) {
          // Verifica double tap
          const now = Date.now();
          const isDoubleTap = state.lastTapTime && now - state.lastTapTime < 300;

          if (isDoubleTap && onDoubleTap) {
            const gesture: DoubleTapGesture = {
              type: 'doubleTap',
              x: state.startX,
              y: state.startY,
              timestamp: now,
              element: containerRef.current || undefined,
            };

            log('Double tap detectado', gesture);
            triggerFeedback('doubleTap');
            onDoubleTap(gesture);
            state.lastTapTime = undefined;
          } else {
            const gesture: TapGesture = {
              type: 'tap',
              x: state.startX,
              y: state.startY,
              timestamp: now,
              element: containerRef.current || undefined,
            };

            log('Tap detectado', gesture);
            triggerFeedback('tap');
            onTap(gesture);
            state.lastTapTime = now;
          }
        }

        // Reseta distância de pinch
        touchDistanceRef.current = null;

        // Limpa estado após processamento
        touchStateRef.current = {};
      },
      [
        enabled,
        onTap,
        onDoubleTap,
        onSwipe,
        longPressCfg,
        swipeCfg,
        getSwipeDirection,
        log,
        triggerFeedback,
      ]
    );

    /**
     * Handler para mouse click (fallback para desktop)
     */
    const handleMouseClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enabled || !onTap) return;

        const now = Date.now();
        const isDoubleTap = touchStateRef.current.lastTapTime && now - touchStateRef.current.lastTapTime < 300;

        if (isDoubleTap && onDoubleTap) {
          const gesture: DoubleTapGesture = {
            type: 'doubleTap',
            x: e.clientX,
            y: e.clientY,
            timestamp: now,
            element: containerRef.current || undefined,
          };

          log('Double click detectado', gesture);
          triggerFeedback('doubleTap');
          onDoubleTap(gesture);
          touchStateRef.current.lastTapTime = undefined;
        } else {
          const gesture: TapGesture = {
            type: 'tap',
            x: e.clientX,
            y: e.clientY,
            timestamp: now,
            element: containerRef.current || undefined,
          };

          log('Click detectado', gesture);
          triggerFeedback('tap');
          onTap(gesture);
          touchStateRef.current.lastTapTime = now;
        }
      },
      [enabled, onTap, onDoubleTap, log, triggerFeedback]
    );

    // Registra event listeners no mount
    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;

      // Touch events
      element.addEventListener('touchstart', handleTouchStart as EventListener, false);
      element.addEventListener('touchmove', handleTouchMove as EventListener, false);
      element.addEventListener('touchend', handleTouchEnd as EventListener, false);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart as EventListener);
        element.removeEventListener('touchmove', handleTouchMove as EventListener);
        element.removeEventListener('touchend', handleTouchEnd as EventListener);
      };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Forward ref
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const mouseEvent = {
            clientX: 0,
            clientY: 0,
            currentTarget: containerRef.current,
          } as React.MouseEvent<HTMLDivElement>;
          handleMouseClick(mouseEvent);
        }
      },
      [handleMouseClick]
    );

    return (
      <div
        ref={containerRef}
        className={className}
        onClick={handleMouseClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>
    );
  }
);

GestureDetector.displayName = 'GestureDetector';
