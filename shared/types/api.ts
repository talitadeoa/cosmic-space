/**
 * 🌐 API Types - Respostas e Erros
 * @module shared/types/api
 */

/**
 * Resposta genérica de API
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Erro de API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Estado de requisição
 */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Estado genérico de fetch
 */
export interface FetchState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
}
