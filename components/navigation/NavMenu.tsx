'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type NavMenuProps = {
  showDevRoutes?: boolean;
};

const baseRoutes = [
  { href: '/page', label: 'Page' },
  { href: '/cosmos', label: 'Cosmos' },
];

const cosmosRoutes = [
  { href: '/cosmos/sol', label: '☀️ Sol' },
  { href: '/cosmos/lua', label: '🌙 Lua' },
  { href: '/cosmos/galaxia', label: '🌌 Galáxia' },
  { href: '/cosmos/planeta', label: '🪐 Planeta' },
  { href: '/cosmos/eclipse', label: '🌑 Eclipse' },
];

const appRoutes = [
  { href: '/comunidade', label: '👥 Comunidade' },
  { href: '/perfil', label: '👤 Perfil' },
];

const devRoutes = [
  { href: '/landing', label: 'Landing' },
  { href: '/page', label: 'Page' },
  { href: '/ilha', label: 'Ilha' },
];

export default function NavMenu({ showDevRoutes = false }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const routes = showDevRoutes
    ? [...baseRoutes, ...cosmosRoutes, ...appRoutes, ...devRoutes]
    : [...baseRoutes, ...cosmosRoutes, ...appRoutes];

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
            {/* Base Routes */}
            {baseRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm"
              >
                {route.label}
              </Link>
            ))}

            {/* Cosmos Routes */}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="px-3 py-1 text-xs text-slate-400 font-semibold">COSMOS</div>
              {cosmosRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm"
                >
                  {route.label}
                </Link>
              ))}
            </div>

            {/* App Routes */}
            <div className="border-t border-slate-700 pt-2 mt-2">
              {appRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm"
                >
                  {route.label}
                </Link>
              ))}
            </div>

            {/* Dev Routes */}
            {showDevRoutes && (
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="px-3 py-1 text-xs text-slate-400 font-semibold">DEV</div>
                {devRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="block px-3 py-2 rounded hover:bg-slate-800/50 transition-colors text-sm text-slate-400"
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div className="mt-3 border-t border-slate-800 pt-3">
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
