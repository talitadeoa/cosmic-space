'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import type { SwipeGesture, SwipeDirection, PinchGesture } from '@/types/gestures';
import { useHaptics } from './useHaptics';
import { useMotion } from './useMotion';

export type { SwipeDirection };

/**
 * Configuração de gestos nativos
 */
export interface NativeGestureConfig {
  /** Habilita feedback háptico */
  hapticFeedback?: boolean;
  /** Habilita detecção de shake */
  shakeDetection?: boolean;
  /** Habilita parallax baseado em orientação */
  parallaxEnabled?: boolean;
  /** Limiar mínimo de swipe em pixels */
  swipeThreshold?: number;
  /** Velocidade mínima de swipe em px/ms */
  swipeVelocity?: number;
  /** Duração do long press em ms */
  longPressDuration?: number;
  /** Threshold de pinch para detectar zoom */
  pinchThreshold?: number;
  /** Zona de borda para edge swipe (% da tela) */
  edgeZone?: number;
}

/**
 * Callbacks para gestos nativos
 */
export interface NativeGestureCallbacks {
  onSwipeLeft?: (gesture: SwipeGesture) => void;
  onSwipeRight?: (gesture: SwipeGesture) => void;
  onSwipeUp?: (gesture: SwipeGesture) => void;
  onSwipeDown?: (gesture: SwipeGesture) => void;
  onEdgeSwipeLeft?: (gesture: SwipeGesture) => void;
  onEdgeSwipeRight?: (gesture: SwipeGesture) => void;
  onPinchIn?: (gesture: PinchGesture) => void;
  onPinchOut?: (gesture: PinchGesture) => void;
  onShake?: () => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onTwoFingerTap?: (x: number, y: number) => void;
  onThreeFingerTap?: () => void;
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
  id: number;
}

const DEFAULT_CONFIG: Required<NativeGestureConfig> = {
  hapticFeedback: true,
  shakeDetection: true,
  parallaxEnabled: true,
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  longPressDuration: 500,
  pinchThreshold: 30,
  edgeZone: 0.1, // 10% da borda
};

/**
 * Hook avançado para gestos nativos com integração Capacitor
 * 
 * Suporta:
 * - Swipe em 4 direções + edge swipes
 * - Pinch to zoom (in/out)
 * - Double tap, long press
 * - Multi-finger taps (2 e 3 dedos)
 * - Rotação com 2 dedos
 * - Shake detection
 * - Feedback háptico automático
 * - Parallax via orientação do dispositivo
 * 
 * @example
 * const { bind, parallax, isGesturing } = useNativeGestures({
 *   onSwipeLeft: () => navigateTo('next'),
 *   onSwipeRight: () => navigateBack(),
 *   onPinchOut: () => setZoom(zoom + 0.1),
 *   onShake: () => resetState(),
 * });
 * 
 * return <div {...bind()} style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }} />;
 */
export function useNativeGestures(
  callbacks: NativeGestureCallbacks = {},
  config: NativeGestureConfig = {}
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const { triggerHaptic, hapticPattern } = useHaptics();
  const { isShaking, getParallax, orientation } = useMotion({
    enableShake: cfg.shakeDetection,
    onShake: () => {
      if (cfg.hapticFeedback) hapticPattern('cosmic');
      callbacks.onShake?.();
    },
  });

  // Estados
  const [isGesturing, setIsGesturing] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);

  // Refs para tracking
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const startTouchesRef = useRef<TouchPoint[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialRotationRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  /**
   * Calcula distância entre dois pontos
   */
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Calcula ângulo entre dois pontos
   */
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }, []);

  /**
   * Calcula centro entre dois pontos
   */
  const getCenter = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }, []);

  /**
   * Verifica se o toque está na borda da tela
   */
  const isEdgeTouch = useCallback((x: number) => {
    const screenWidth = window.innerWidth;
    const edgeSize = screenWidth * cfg.edgeZone;
    return x < edgeSize || x > screenWidth - edgeSize;
  }, [cfg.edgeZone]);

  /**
   * Processa início do toque
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const now = Date.now();

    // Limpa timer de long press anterior
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Armazena todos os toques
    startTouchesRef.current = [];
    for (const touch of touches) {
      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
        id: touch.identifier,
      };
      touchesRef.current.set(touch.identifier, point);
      startTouchesRef.current.push(point);
    }

    setIsGesturing(true);

    // Detecta multi-finger taps
    if (touches.length === 2) {
      // Prepara para pinch/rotate
      const p1 = startTouchesRef.current[0];
      const p2 = startTouchesRef.current[1];
      initialPinchDistanceRef.current = getDistance(p1, p2);
      initialRotationRef.current = getAngle(p1, p2);
    } else if (touches.length === 3) {
      // Three finger tap
      if (cfg.hapticFeedback) triggerHaptic('medium');
      callbacks.onThreeFingerTap?.();
      return;
    }

    // Configura long press para toque único
    if (touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        const touch = startTouchesRef.current[0];
        if (touch) {
          if (cfg.hapticFeedback) hapticPattern('longPress');
          setCurrentGesture('longPress');
          callbacks.onLongPress?.(touch.x, touch.y);
        }
      }, cfg.longPressDuration);
    }
  }, [callbacks, cfg.hapticFeedback, cfg.longPressDuration, getDistance, getAngle, triggerHaptic, hapticPattern]);

  /**
   * Processa movimento do toque
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const now = Date.now();

    // Atualiza posições
    for (const touch of touches) {
      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
        id: touch.identifier,
      };
      touchesRef.current.set(touch.identifier, point);
    }

    // Cancela long press se houver movimento significativo
    if (startTouchesRef.current.length === 1 && touches.length === 1) {
      const start = startTouchesRef.current[0];
      const current = touchesRef.current.get(touches[0].identifier);
      
      if (start && current) {
        const distance = getDistance(start, current);
        if (distance > 10 && longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }

    // Detecta pinch/rotate com 2 dedos
    if (touches.length === 2 && startTouchesRef.current.length === 2) {
      const p1 = touchesRef.current.get(touches[0].identifier);
      const p2 = touchesRef.current.get(touches[1].identifier);
      
      if (p1 && p2 && initialPinchDistanceRef.current !== null) {
        const currentDistance = getDistance(p1, p2);
        const distanceDiff = currentDistance - initialPinchDistanceRef.current;

        // Detecta pinch
        if (Math.abs(distanceDiff) > cfg.pinchThreshold) {
          const scale = currentDistance / initialPinchDistanceRef.current;
          const center = getCenter(p1, p2);
          
          const gesture: PinchGesture = {
            type: 'pinch',
            scale,
            x: center.x,
            y: center.y,
          };

          if (distanceDiff > 0) {
            setCurrentGesture('pinchOut');
            if (cfg.hapticFeedback) triggerHaptic('light');
            callbacks.onPinchOut?.(gesture);
          } else {
            setCurrentGesture('pinchIn');
            if (cfg.hapticFeedback) triggerHaptic('light');
            callbacks.onPinchIn?.(gesture);
          }

          initialPinchDistanceRef.current = currentDistance;
        }

        // Detecta rotação
        if (initialRotationRef.current !== null && callbacks.onRotate) {
          const currentAngle = getAngle(p1, p2);
          const angleDiff = currentAngle - initialRotationRef.current;
          
          if (Math.abs(angleDiff) > 5) {
            const center = getCenter(p1, p2);
            setCurrentGesture('rotate');
            callbacks.onRotate(angleDiff, center);
            initialRotationRef.current = currentAngle;
          }
        }
      }
    }
  }, [callbacks, cfg.hapticFeedback, cfg.pinchThreshold, getDistance, getCenter, getAngle, triggerHaptic]);

  /**
   * Processa fim do toque
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();

    // Cancela long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Detecta gestos com base no toque inicial
    if (startTouchesRef.current.length === 1 && e.changedTouches.length === 1) {
      const start = startTouchesRef.current[0];
      const endTouch = e.changedTouches[0];
      
      const dx = endTouch.clientX - start.x;
      const dy = endTouch.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = now - start.time;
      const velocity = distance / duration;

      // Detecta swipe
      if (distance > cfg.swipeThreshold && velocity > cfg.swipeVelocity && duration < 500) {
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        const isEdge = isEdgeTouch(start.x);
        
        const gesture: SwipeGesture = {
          type: 'swipe',
          direction: 'left' as SwipeDirection,
          distance,
          velocity,
          startX: start.x,
          startY: start.y,
          endX: endTouch.clientX,
          endY: endTouch.clientY,
          duration,
        };

        if (isHorizontal) {
          if (dx > 0) {
            gesture.direction = 'right';
            setCurrentGesture('swipeRight');
            if (cfg.hapticFeedback) hapticPattern('swipe');
            
            if (isEdge && start.x < window.innerWidth * cfg.edgeZone) {
              callbacks.onEdgeSwipeRight?.(gesture);
            } else {
              callbacks.onSwipeRight?.(gesture);
            }
          } else {
            gesture.direction = 'left';
            setCurrentGesture('swipeLeft');
            if (cfg.hapticFeedback) hapticPattern('swipe');
            
            if (isEdge && start.x > window.innerWidth * (1 - cfg.edgeZone)) {
              callbacks.onEdgeSwipeLeft?.(gesture);
            } else {
              callbacks.onSwipeLeft?.(gesture);
            }
          }
        } else {
          if (dy > 0) {
            gesture.direction = 'down';
            setCurrentGesture('swipeDown');
            if (cfg.hapticFeedback) hapticPattern('swipe');
            callbacks.onSwipeDown?.(gesture);
          } else {
            gesture.direction = 'up';
            setCurrentGesture('swipeUp');
            if (cfg.hapticFeedback) hapticPattern('swipe');
            callbacks.onSwipeUp?.(gesture);
          }
        }
      }
      // Detecta tap/double tap
      else if (distance < 10 && duration < 300) {
        const lastTap = lastTapRef.current;
        
        if (lastTap && now - lastTap.time < 300) {
          // Double tap
          if (cfg.hapticFeedback) triggerHaptic('light');
          setCurrentGesture('doubleTap');
          callbacks.onDoubleTap?.(start.x, start.y);
          lastTapRef.current = null;
        } else {
          // Single tap (aguarda possível double tap)
          lastTapRef.current = { time: now, x: start.x, y: start.y };
        }
      }
    }

    // Detecta two-finger tap
    if (startTouchesRef.current.length === 2 && e.touches.length === 0) {
      const [p1, p2] = startTouchesRef.current;
      const center = getCenter(p1, p2);
      const duration = now - p1.time;
      
      // Se foi um tap rápido sem muito movimento
      if (duration < 300) {
        if (cfg.hapticFeedback) triggerHaptic('medium');
        setCurrentGesture('twoFingerTap');
        callbacks.onTwoFingerTap?.(center.x, center.y);
      }
    }

    // Limpa estados
    for (const touch of e.changedTouches) {
      touchesRef.current.delete(touch.identifier);
    }

    if (e.touches.length === 0) {
      setIsGesturing(false);
      setCurrentGesture(null);
      startTouchesRef.current = [];
      initialPinchDistanceRef.current = null;
      initialRotationRef.current = null;
    }
  }, [callbacks, cfg, getCenter, hapticPattern, triggerHaptic, isEdgeTouch]);

  /**
   * Retorna props para bind no elemento
   */
  const bind = useCallback(() => {
    return {
      ref: (el: HTMLElement | null) => {
        elementRef.current = el;
      },
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      style: { touchAction: 'none' } as React.CSSProperties,
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Calcula parallax
  const parallax = cfg.parallaxEnabled ? getParallax() : { x: 0, y: 0 };

  return {
    // Binding
    bind,
    
    // Estados
    isGesturing,
    currentGesture,
    isShaking,
    
    // Parallax
    parallax: {
      x: parallax.x * 10, // Amplifica para efeito visual
      y: parallax.y * 10,
    },
    orientation,
    
    // Haptics manuais
    triggerHaptic,
    hapticPattern,
  };
}
