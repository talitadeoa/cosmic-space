"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSfxContext } from './SfxProvider';
import { useAuth } from '@/hooks/useAuth';

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const sfx = useSfxContext();
  const auth = useAuth();

  return (
    <div className="fixed top-4 left-4 z-50 sm:top-6 sm:left-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded-md bg-black/50 border border-slate-700 transition-colors hover:bg-black/70 active:bg-black/40"
          aria-label="Menu de navegação"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="mt-2 w-56 rounded-lg sm:rounded-xl border border-slate-800 bg-black/60 p-3 shadow-lg backdrop-blur-md">
          <nav className="space-y-2">
            <Link href="/" className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm">Home </Link>
            <Link href="/universo" className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm">Universo </Link>
            <Link href="/cosmos" className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm">Cosmos</Link>
          </nav>

          <div className="mt-3 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <small className="text-xs text-slate-400">SFX</small>
              <button
                onClick={() => sfx.toggle()}
                className="px-2 py-1 rounded bg-slate-800 text-xs sm:text-sm hover:bg-slate-700 transition-colors"
              >
                {sfx.enabled ? 'On' : 'Off'}
              </button>
            </div>

            <div className="mt-2">
              {!auth.loading && auth.isAuthenticated ? (
                <button
                  onClick={() => auth.logout()}
                  className="w-full rounded px-3 py-2 bg-rose-600 text-xs sm:text-sm hover:bg-rose-700 transition-colors"
                >
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => auth.googleLogin()}
                  className="w-full rounded px-3 py-2 bg-emerald-500 text-xs sm:text-sm hover:bg-emerald-600 transition-colors"
                >
                  Entrar com Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
