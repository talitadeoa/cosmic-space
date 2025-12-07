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
    <div className="fixed top-6 left-6 z-50">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded-md bg-black/50 border border-slate-700"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="mt-2 w-56 rounded-xl border border-slate-800 bg-black/60 p-3 shadow-lg backdrop-blur-md">
          <nav className="space-y-2">
            <Link href="/">Home </Link>
            <Link href="/universo">Universo </Link>
            <Link href="/cosmosre">cosmos</Link>
          </nav>

          <div className="mt-3 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <small className="text-xs text-slate-400">SFX</small>
              <button
                onClick={() => sfx.toggle()}
                className="px-2 py-1 rounded bg-slate-800 text-sm"
              >
                {sfx.enabled ? 'On' : 'Off'}
              </button>
            </div>

            <div className="mt-2">
              {!auth.loading && auth.isAuthenticated ? (
                <button
                  onClick={() => auth.logout()}
                  className="w-full rounded px-3 py-2 bg-rose-600 text-sm"
                >
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => auth.googleLogin()}
                  className="w-full rounded px-3 py-2 bg-emerald-500 text-sm"
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
