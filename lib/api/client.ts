/**
 * 🌐 API Client - Centralized HTTP Client
 * 
 * Cliente HTTP com tratamento de erros, autenticação e tipagem.
 * Capacitor-ready: detecta ambiente e ajusta baseURL.
 */

'use client';

import { ApiError, type ApiResponse } from '@/types/api';

/**
 * Obtém URL base dependendo do ambiente
 * Web: origem atual
 * Mobile (Capacitor): API_URL do env
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  // TODO: Quando implementar Capacitor, adicionar:
  // if (Capacitor.isNativePlatform()) {
  //   return process.env.NEXT_PUBLIC_API_URL || 'https://api.flua.app';
  // }
  
  return window.location.origin;
}

/**
 * Cliente HTTP genérico
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  /**
   * Requisição genérica
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Tratar erros HTTP
      if (!response.ok) {
        let errorMessage = 'Erro na requisição';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new ApiError(errorMessage, response.status);
      }

      // Parse JSON
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Network/Parse errors
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new ApiError(message, 0, 'NETWORK_ERROR');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Instância singleton do client
 */
export const apiClient = new ApiClient();
