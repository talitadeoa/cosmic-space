/**
 * 👆 Gesture Types - Sistema de detecção de gestos
 * @module shared/types/gestures
 */

export type GestureType = 'tap' | 'longPress' | 'swipe' | 'pinch' | 'doubleTap';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Configuração para detecção de long press
 */
export interface LongPressConfig {
  duration?: number; // ms, padrão 500
  threshold?: number; // px de movimento máximo antes de cancelar, padrão 10
}

/**
 * Configuração para detecção de swipe
 */
export interface SwipeConfig {
  threshold?: number; // px mínimo de movimento, padrão 50
  velocity?: number; // px/ms mínimo, padrão 0.3
}

/**
 * Configuração para detecção de pinch
 */
export interface PinchConfig {
  threshold?: number; // mudança mínima de distância, padrão 20
}

/**
 * Eventos de tap
 */
export interface TapGesture {
  type: 'tap';
  x: number;
  y: number;
  timestamp: number;
  element?: HTMLElement;
}

/**
 * Eventos de double tap
 */
export interface DoubleTapGesture {
  type: 'doubleTap';
  x: number;
  y: number;
  timestamp: number;
  element?: HTMLElement;
}

/**
 * Eventos de long press
 */
export interface LongPressGesture {
  type: 'longPress';
  x: number;
  y: number;
  startTime: number;
  duration: number;
  element?: HTMLElement;
}

/**
 * Eventos de swipe
 */
export interface SwipeGesture {
  type: 'swipe';
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  element?: HTMLElement;
}

/**
 * Eventos de pinch
 */
export interface PinchGesture {
  type: 'pinch';
  scale: number; // distância nova / distância anterior
  x: number; // ponto central
  y: number;
  element?: HTMLElement;
}

/**
 * União de todos os tipos de gestos
 */
export type Gesture =
  | TapGesture
  | DoubleTapGesture
  | LongPressGesture
  | SwipeGesture
  | PinchGesture;

/**
 * Callbacks para diferentes gestos
 */
export interface GestureHandlers {
  onTap?: (gesture: TapGesture) => void;
  onDoubleTap?: (gesture: DoubleTapGesture) => void;
  onLongPress?: (gesture: LongPressGesture) => void;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
}

/**
 * Configuração completa de detecção de gestos
 */
export interface GestureDetectorConfig extends GestureHandlers {
  enabled?: boolean;
  longPressConfig?: LongPressConfig;
  swipeConfig?: SwipeConfig;
  pinchConfig?: PinchConfig;
  debug?: boolean;
}
