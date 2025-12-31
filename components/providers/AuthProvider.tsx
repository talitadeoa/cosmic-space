'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from 'react';
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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyAuth: ({ silent }: { silent?: boolean }) => Promise<void>;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  loading: true,
  error: null,
  user: null,
};

const AUTH_CACHE_KEY = 'flua-auth-state';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const verifyingRef = useRef(false);
  const mountedRef = useRef(false);

  // Inicializar apenas uma vez após mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const cached = readCachedAuthState();
    setState(cached);
    
    // Verificar autenticação silenciosamente se tinha cache
    if (cached.isAuthenticated) {
      verifyAuth({ silent: true });
    } else {
      verifyAuth({ silent: false });
    }
  }, []);

  const verifyAuth = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    // Evitar múltiplas requisições simultâneas
    if (verifyingRef.current) return;
    verifyingRef.current = true;

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
      // Erros de rede/fetch são diferentes de "não autenticado"
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.warn('Erro ao verificar autenticação:', message);
      const nextState: AuthState = {
        isAuthenticated: false,
        loading: false,
        error: silent ? null : 'Erro ao verificar autenticação',
        user: null,
      };

      setState(nextState);
      persistAuthState(nextState);
    } finally {
      verifyingRef.current = false;
    }
  }, []);

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

        await verifyAuth();
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

  const value = useMemo(
    () => ({
      ...state,
      login,
      signup,
      logout,
      verifyAuth,
      googleLogin,
    }),
    [state, login, signup, logout, verifyAuth, googleLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
