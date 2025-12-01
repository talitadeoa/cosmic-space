// hooks/useAuth.ts
'use client';

import { useState, useCallback, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Verificar autenticação ao montar
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      setState(prev => ({
        ...prev,
        isAuthenticated: data.authenticated || false,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        loading: false,
        error: 'Erro ao verificar autenticação',
      }));
    }
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Erro ao fazer login',
          isAuthenticated: false,
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer login',
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await fetch('/api/auth/logout', { method: 'POST' });
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao fazer logout',
      }));
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    verifyAuth,
  };
}
