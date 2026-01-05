'use client';

import { memo, type FormEvent } from 'react';
import Link from 'next/link';
import { Avatar } from './Avatar';
import { SearchIcon, XMarkIcon, BellIcon, PlusIcon } from './icons';

type CommunityHeaderProps = {
  profile: {
    displayName: string;
    avatarUrl: string;
  };
  searchQuery: string;
  searchStatus: 'idle' | 'searching' | 'error';
  searchError: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  onSearchClear: () => void;
};

/**
 * Header compacto mobile-first
 * Busca + Perfil + Notificações
 */
export const CommunityHeader = memo(function CommunityHeader({
  profile,
  searchQuery,
  searchStatus,
  searchError,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
}: CommunityHeaderProps) {
  return (
    <header className="sticky top-0 z-20 -mx-4 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={onSearchSubmit} className="relative flex-1" role="search">
          <label htmlFor="community-search" className="sr-only">
            Buscar na comunidade
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              id="community-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="min-h-[44px] w-full rounded-full border border-slate-700/70 bg-black/40 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-describedby={searchError ? 'search-error' : undefined}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onSearchClear}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Limpar busca"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchError && (
            <p id="search-error" className="mt-1 text-xs text-rose-400" role="alert">
              {searchError}
            </p>
          )}
        </form>

        {/* New Post (mobile) */}
        <Link
          href="#publicar"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-400/70 bg-indigo-500/20 text-indigo-200 transition-colors hover:bg-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:hidden"
          aria-label="Criar novo post"
        >
          <PlusIcon className="h-5 w-5" />
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-700/70 bg-black/40 text-slate-400 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex"
          aria-label="Notificações"
        >
          <BellIcon className="h-5 w-5" />
        </button>

        {/* Profile */}
        <Link
          href="/perfil"
          className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-black/40 p-1 pr-3 transition-colors hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={`Perfil de ${profile.displayName || 'Tripulação'}`}
        >
          <Avatar
            src={profile.avatarUrl}
            alt=""
            name={profile.displayName || 'Tripulação'}
            size="sm"
          />
          <span className="hidden text-sm font-medium text-slate-200 sm:block">
            {profile.displayName || 'Tripulação'}
          </span>
        </Link>
      </div>

      {/* Loading indicator */}
      {searchStatus === 'searching' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
          Buscando...
        </div>
      )}
    </header>
  );
});
