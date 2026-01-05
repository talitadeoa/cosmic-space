'use client';

import { memo } from 'react';
import type { CommunityPost } from '@/types/community';
import { SparklesIcon, BookmarkIcon, BookmarkOutlineIcon } from './icons';

type FeaturedCardProps = {
  post: CommunityPost;
  formatRelativeTime: (date: string) => string;
  truncate: (text: string, length?: number) => string;
  isSaved: boolean;
  onToggleSave: () => void;
};

/**
 * Card de destaque para post em evidência
 * Visual diferenciado com gradiente
 */
export const FeaturedCard = memo(function FeaturedCard({
  post,
  formatRelativeTime,
  truncate,
  isSaved,
  onToggleSave,
}: FeaturedCardProps) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-900/30 via-slate-950/70 to-black/80 p-4 sm:p-5"
      aria-labelledby="featured-post-title"
    >
      {/* Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-3 py-1 text-[11px] uppercase tracking-wide text-indigo-200">
          <SparklesIcon className="h-3.5 w-3.5" />
          Destaque
        </span>
        <time className="text-xs text-slate-500" dateTime={post.createdAt}>
          {formatRelativeTime(post.createdAt)}
        </time>
      </div>

      {/* Content */}
      <h3
        id="featured-post-title"
        className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl"
      >
        {post.title || 'Pulso em destaque'}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{truncate(post.body, 200)}</p>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400">Curado para inspirar sua órbita pessoal.</span>
        <button
          type="button"
          onClick={onToggleSave}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs text-slate-200 transition-colors hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={isSaved ? 'Remover dos salvos' : 'Salvar post'}
          aria-pressed={isSaved}
        >
          {isSaved ? (
            <BookmarkIcon className="h-4 w-4 text-indigo-400" />
          ) : (
            <BookmarkOutlineIcon className="h-4 w-4" />
          )}
          {isSaved ? 'Salvo' : 'Salvar'}
        </button>
      </div>
    </article>
  );
});
