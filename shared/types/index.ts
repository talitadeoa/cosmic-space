/**
 * Tipos compartilhados genéricos
 * @module shared/types
 */

// API Types (genéricos)
export { ApiError, type ApiResponse, type RequestStatus, type FetchState } from './api';

// Re-export de domains que já têm barrel exports
export * from '@/domains/todo/types';
export * from '@/domains/lunar-cycle/types';

// Tipos temporários que ainda não foram criados nos domínios
export type TimelineItemType = 'mensal' | 'trimestral' | 'anual' | 'energia';
