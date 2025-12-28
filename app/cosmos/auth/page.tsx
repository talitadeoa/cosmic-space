'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

export default function CosmosAuthPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/cosmos');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <AuthGate>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.12),transparent_36%)]" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
          <div className="mb-10 flex w-full max-w-xl flex-col items-center text-center space-y-3">
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-slate-400">Cosmos</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Autenticação para entrar no{' '}
              <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
                espaço
              </span>
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              Use a senha mestre para liberar o acesso. Assim que validar, você será levado direto
              para o Cosmos.
            </p>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-black/50 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 text-sm text-slate-200">
              <Link
                href="/"
                className="rounded-full border border-slate-700/70 bg-black/50 px-3 py-1.5 transition hover:border-sky-200/60 hover:bg-sky-500/15"
              >
                ← Voltar
              </Link>
              <Link
                href="/cosmos/sol-preview"
                className="text-xs font-medium text-slate-300 underline decoration-dotted underline-offset-4 transition hover:text-sky-200"
              >
                Ver prévia do Sol
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-left text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Liberar acesso</p>
              <p className="mt-1">
                Essa área é restrita. Faça login para entrar no painel interativo do Cosmos.
              </p>
              {isAuthenticated && !loading && (
                <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-200">
                  Acesso liberado! Redirecionando...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
