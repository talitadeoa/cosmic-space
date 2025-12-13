// components/AuthGate.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, loading, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    if (!email) {
      setLocalError('Insira um email');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setLocalError('Insira uma senha');
      setIsSubmitting(false);
      return;
    }

    const success = await login(email, password);
    setIsSubmitting(false);

    if (!success) {
      setLocalError('Email ou senha incorretos');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full rounded-3xl border border-slate-800 bg-black/40 px-6 py-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Acesso ao{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
              Espaço
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">
            Digite a senha para explorar o cosmos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              placeholder="seu@email.com"
            />
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Senha
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              placeholder="••••••••"
            />
          </label>

          {(error || localError) && (
            <p className="text-sm text-rose-400" role="alert">
              {error || localError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">
              {isSubmitting ? 'Entrando...' : 'Entrar no cosmos'}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}
