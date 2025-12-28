// hooks/useAuth.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

const AUTH_CACHE_KEY = 'cosmic-space-auth-state';

type CachedAuthPayload = Pick<AuthState, 'isAuthenticated' | 'user' | 'error'>;

const readCachedAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }

  try {
    const stored = window.sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!stored) {
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(stored) as CachedAuthPayload;
    return {
      ...INITIAL_STATE,
      ...parsed,
      loading: false,
    };
  } catch {
    return INITIAL_STATE;
  }
};

const persistAuthState = (state: AuthState) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: CachedAuthPayload = {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    error: state.error,
  };

  window.sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(payload));
};

const clearAuthStateCache = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_CACHE_KEY);
};

/**
 * Hook centralizado para autenticação
 * Gerencia login, signup, logout e OAuth Google
 */
export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(() => readCachedAuthState());
  const hadCachedAuthRef = useRef(state.isAuthenticated);

  // Verificar autenticação ao montar
  const verifyAuth = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      } else {
        setState((prev) => ({ ...prev, error: null }));
      }
      const response = await fetch('/api/auth/verify');
      const data = await response.json();

      const nextState: AuthState = {
        isAuthenticated: Boolean(data.authenticated),
        loading: false,
        error: null,
        user: data.user ?? null,
      };

      setState(nextState);
      persistAuthState(nextState);
    } catch (error) {
      const nextState: AuthState = {
        isAuthenticated: false,
        loading: false,
        error: 'Erro ao verificar autenticação',
        user: null,
      };

      setState(nextState);
      persistAuthState(nextState);
    }
  }, []);

  useEffect(() => {
    verifyAuth({ silent: hadCachedAuthRef.current });
  }, [verifyAuth]);

  /**
   * Handler genérico para requisições de autenticação
   * Reduz duplicação de lógica entre login e signup
   */
  const _handleAuthRequest = useCallback(
    async (endpoint: string, payload: Record<string, any>, errorMessage: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: data.error || errorMessage,
            isAuthenticated: false,
            user: null,
          }));
          clearAuthStateCache();
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
          user: null,
        }));
        clearAuthStateCache();
        return false;
      }
    },
    [router, verifyAuth]
  );

  const login = useCallback(
    (email: string, password: string) =>
      _handleAuthRequest('login', { email, password }, 'Erro ao fazer login'),
    [_handleAuthRequest]
  );

  const signup = useCallback(
    (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: string;
    }) => _handleAuthRequest('signup', payload, 'Erro ao criar conta'),
    [_handleAuthRequest]
  );

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await fetch('/api/auth/logout', { method: 'POST' });

      setState(INITIAL_STATE);
      clearAuthStateCache();
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
