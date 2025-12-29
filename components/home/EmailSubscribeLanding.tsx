'use client';

import Link from 'next/link';
import EmailSignupForm from '@/components/home/EmailSignupForm';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';

export default function EmailSubscribeLanding() {
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SpaceBackground />
      {/* Gradientes originais da página */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-rose-500/10" />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl border border-slate-800 bg-black/40 px-4 py-6 sm:px-6 sm:py-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">Em breve</p>
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl md:text-4xl leading-tight">
            Um novo jeito de navegar{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
              sua constelação
            </span>
            ✨🌙
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 md:text-base">
            Deixe seu e-mail se quiser acompanhar de perto 👀
          </p>
        </div>
        <EmailSignupForm />
        <div className="mt-4 text-center">
          <Link
            href="/home"
            className="text-sm text-slate-300/90 transition hover:text-slate-100"
          >
            Toque aqui se quiser explorar o{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
              cosmos
            </span>{' '}
            antes do lançamento
          </Link>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-slate-400/80 text-center">© {year} Construido no hiperespaço</p>
    </main>
    </div>
  );
}
