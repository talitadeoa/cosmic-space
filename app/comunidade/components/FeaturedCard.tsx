'use client';

import { memo, useState } from 'react';
import type { CommunityPost } from '@/types/community';
import { Avatar } from './Avatar';
import {
  SparklesIcon,
  BookmarkIcon,
  BookmarkOutlineIcon,
  EyeIcon,
  ShareIcon,
  ChatBubbleIcon,
} from './icons';

type FeaturedCardProps = {
  post: CommunityPost;
  formatRelativeTime: (date: string) => string;
  truncate: (text: string, length?: number) => string;
  isSaved: boolean;
  onToggleSave: () => void;
};

/**
 * Card de destaque para post em evidência
 * Visual diferenciado com gradiente e mais interatividade
 */
export const FeaturedCard = memo(function FeaturedCard({
  post,
  formatRelativeTime,
  truncate,
  isSaved,
  onToggleSave,
}: FeaturedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-900/30 via-slate-950/70 to-black/80 p-5 sm:p-6"
      aria-labelledby="featured-post-title"
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:opacity-70" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl transition-opacity group-hover:opacity-70" />

      {/* Header with badge and meta */}
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-3 py-1 text-[11px] uppercase tracking-wide text-indigo-200">
            <SparklesIcon className="h-3.5 w-3.5" />
            Destaque
          </span>
          <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
            <EyeIcon className="h-3.5 w-3.5" />
            {Math.floor(Math.random() * 500 + 100)} leituras
          </span>
        </div>
        <time className="text-xs text-slate-500" dateTime={post.createdAt}>
          {formatRelativeTime(post.createdAt)}
        </time>
      </div>

      {/* Author info */}
      <div className="relative mt-4 flex items-center gap-3">
        <Avatar
          src={post.authorAvatarUrl}
          alt={`Avatar de ${post.authorName}`}
          name={post.authorName}
          size="md"
        />
        <div>
          <span className="block text-sm font-semibold text-white">{post.authorName}</span>
          <span className="text-xs text-slate-400">Curador da comunidade</span>
        </div>
      </div>

      {/* Content */}
      <h3
        id="featured-post-title"
        className="relative mt-4 text-xl font-bold leading-snug text-white sm:text-2xl"
      >
        {post.title || 'Pulso em destaque'}
      </h3>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
        {isExpanded ? post.body : truncate(post.body, 200)}
      </p>
      {post.body.length > 200 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative mt-2 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
        >
          {isExpanded ? 'Ver menos' : 'Ler mais...'}
        </button>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200 transition-colors hover:bg-indigo-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      <div className="relative mt-5 flex flex-wrap items-center gap-3 border-t border-slate-700/50 pt-4">
        <button
          type="button"
          onClick={onToggleSave}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition-all hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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

        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition-all hover:border-purple-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Compartilhar post"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>

        <span className="ml-auto flex items-center gap-2 text-sm text-slate-400">
          <ChatBubbleIcon className="h-4 w-4" />
          {post.commentsCount} comentário{post.commentsCount !== 1 ? 's' : ''}
        </span>
      </div>
    </article>
  );
});
