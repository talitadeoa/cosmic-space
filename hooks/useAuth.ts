// hooks/useAuth.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: User | null;
}

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  loading: true,
  error: null,
  user: null,
};

/**
 * Hook centralizado para autenticação
 * Gerencia login, signup, logout e OAuth Google
 */
export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  // Verificar autenticação ao montar
  const verifyAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/auth/verify');
      const data = await response.json();

      setState((prev) => ({
        ...prev,
        isAuthenticated: Boolean(data.authenticated),
        loading: false,
        user: data.user ?? null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        loading: false,
        error: 'Erro ao verificar autenticação',
      }));
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  /**
   * Handler genérico para requisições de autenticação
   * Reduz duplicação de lógica entre login e signup
   */
  const _handleAuthRequest = useCallback(
    async (endpoint: string, email: string, password: string, errorMessage: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: data.error || errorMessage,
            isAuthenticated: false,
          }));
          return false;
        }

        // Verificar após autenticação
        await verifyAuth();

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));

        router.refresh();
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isAuthenticated: false,
        }));
        return false;
      }
    },
    [router, verifyAuth]
  );

  const login = useCallback(
    (email: string, password: string) =>
      _handleAuthRequest('login', email, password, 'Erro ao fazer login'),
    [_handleAuthRequest]
  );

  const signup = useCallback(
    (email: string, password: string) =>
      _handleAuthRequest('signup', email, password, 'Erro ao criar conta'),
    [_handleAuthRequest]
  );

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await fetch('/api/auth/logout', { method: 'POST' });

      setState(INITIAL_STATE);
      router.refresh();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer logout',
      }));
    }
  }, [router]);

  const googleLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/google';
    }
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    verifyAuth,
    googleLogin,
  };
}
