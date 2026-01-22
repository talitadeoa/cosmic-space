'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllSyncData } from '@/app/cosmos/utils/syncOutbox';

interface User {
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  errorReason: AuthErrorReason | null;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  verifyAuth: ({ silent }: { silent?: boolean }) => Promise<void>;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  loading: true,
  error: null,
  errorReason: null,
  user: null,
};

const AUTH_CACHE_KEY = 'flua-auth-state';

type CachedAuthPayload = Pick<AuthState, 'isAuthenticated' | 'user' | 'error' | 'errorReason'>;

type AuthErrorReason = 'invalid_credentials' | 'provider_mismatch' | 'validation' | 'server' | 'network' | 'unknown';

type AuthResult = {
  ok: boolean;
  error?: string;
  reason?: AuthErrorReason;
  status?: number;
};

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
    errorReason: state.errorReason,
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

  // Definir verifyAuth ANTES do useEffect que o usa
  const verifyAuth = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    // Evitar múltiplas requisições simultâneas
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    try {
      if (!silent) {
        setState((prev) => ({ ...prev, loading: true, error: null, errorReason: null }));
      } else {
        setState((prev) => ({ ...prev, error: null }));
      }
      
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        const reason = (data?.reason as AuthErrorReason | undefined) ?? null;
        const nextState: AuthState = {
          isAuthenticated: false,
          loading: false,
          error: silent ? null : data?.error || 'Erro ao verificar autenticação',
          errorReason: silent ? null : reason ?? 'unknown',
          user: null,
        };

        setState(nextState);
        persistAuthState(nextState);
        return;
      }

      const nextState: AuthState = {
        isAuthenticated: Boolean(data.authenticated),
        loading: false,
        error: null,
        errorReason: null,
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
        errorReason: silent ? null : 'network',
        user: null,
      };

      setState(nextState);
      persistAuthState(nextState);
    } finally {
      verifyingRef.current = false;
    }
  }, []);

  // Inicializar apenas uma vez após mount - verifyAuth agora disponível
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
  }, [verifyAuth]);

  const _handleAuthRequest = useCallback(
    async (endpoint: string, payload: Record<string, any>, errorMessage: string): Promise<AuthResult> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const reason = (data?.reason as AuthErrorReason | undefined) ?? null;
          const fallbackReason =
            response.status >= 500 ? 'server' : response.status === 401 ? 'invalid_credentials' : 'validation';
          setState((prev) => ({
            ...prev,
            loading: false,
            error: data.error || errorMessage,
            errorReason: reason ?? fallbackReason,
            isAuthenticated: false,
            user: null,
          }));
          clearAuthStateCache();
          return {
            ok: false,
            error: data.error || errorMessage,
            reason: reason ?? fallbackReason,
            status: response.status,
          };
        }

        await verifyAuth();
        router.refresh();
        return { ok: true };
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          errorReason: 'network',
          isAuthenticated: false,
          user: null,
        }));
        clearAuthStateCache();
        return {
          ok: false,
          error: errorMessage,
          reason: 'network',
        };
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
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      
      // Limpar IndexedDB de sincronização (cursors e outbox)
      try {
        await clearAllSyncData();
      } catch (e) {
        console.warn('Erro ao limpar dados de sincronização:', e);
      }
      
      // Limpar apenas dados relacionados ao usuário, preservando configurações gerais
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'flua_todos_salvos',
          'flua_planet_state',
          'flua_island_names',
          'flua_island_ids',
          'flua_island_meta',
          'flua_sync_outbox',
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Erro ao remover ${key}:`, e);
          }
        });
        
        // Limpar sessionStorage também
        try {
          sessionStorage.removeItem('flua_planet_state_meta');
          sessionStorage.removeItem('flua_island_meta');
        } catch (e) {
          console.warn('Erro ao limpar sessionStorage:', e);
        }
        
        // Limpar também itens que começam com prefixos específicos
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('flua_sync_') || 
              key.startsWith('flua_outbox_') ||
              key.startsWith('flua_user_')) {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn(`Erro ao remover ${key}:`, e);
            }
          }
        });
      }
      
      setState(INITIAL_STATE);
      clearAuthStateCache();
      router.refresh();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer logout',
        errorReason: 'unknown',
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
