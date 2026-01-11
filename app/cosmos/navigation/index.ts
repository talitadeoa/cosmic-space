/**
 * Módulo centralizado de navegação e gestos do cosmos
 * Exporte todos os tipos, hooks e componentes daqui
 */

// Types
export type {
  GestureType,
  SwipeDirection,
  LongPressConfig,
  SwipeConfig,
  PinchConfig,
  TapGesture,
  DoubleTapGesture,
  LongPressGesture,
  SwipeGesture,
  PinchGesture,
  Gesture,
  GestureHandlers,
  GestureDetectorConfig,
} from '@/types/gestures';

// Hooks
export { useUniverseNavigation } from './hooks/useUniverseNavigation';
export type { NavigationFocusContext } from './hooks/useUniverseNavigation';

// Componentes
export { GestureDetector } from './components/GestureDetector';
