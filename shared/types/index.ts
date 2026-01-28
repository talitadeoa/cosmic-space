/**
 * Tipos compartilhados genéricos
 * @module shared/types
 */

// API Types (genéricos)
export { ApiError, type ApiResponse, type RequestStatus, type FetchState } from './api';

// Timeline Types
export type {
  TimelinePeriod,
  TimelineItemType,
  TimelineItem,
  TimelineRange,
  TimelineResponse,
  TimelineFiltersState,
} from './timeline';

// Input Types
export type {
  FormEntryType,
  PhaseInputType,
  TodoInputType,
} from './inputs';
export { isValidFormEntry, isValidPhaseInputType, isValidTodoInputType } from './inputs';

// Gesture Types
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
} from './gestures';

// Planet State Types
export type {
  IslandId,
  PlanetView,
  InputTypeFilter,
  TodoStatusFilter,
  CategoryFilter,
  PlanetFiltersState,
  PlanetUiState,
} from './planetState';
export {
  PLANET_FILTER_VIEWS,
  TODO_STATUS_FILTERS,
  DEFAULT_PLANET_FILTERS,
  DEFAULT_PLANET_STATE,
} from './planetState';

// Re-export de domains que já têm barrel exports
export * from '@/domains/todo/types';
export * from '@/domains/lunar-cycle/types';
export * from '@/domains/community/types';
export * from '@/domains/insights/types';
