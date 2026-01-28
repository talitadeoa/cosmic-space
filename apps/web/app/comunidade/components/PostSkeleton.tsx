'use client';

import { memo } from 'react';

/**
 * Skeleton de loading para cards de post
 * Animação de pulse para feedback visual
 */
export const PostSkeleton = memo(function PostSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-slate-800" />
          <div className="h-3 w-16 rounded bg-slate-800/60" />
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        <div className="h-5 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800/60" />
        <div className="h-4 w-5/6 rounded bg-slate-800/60" />
      </div>

      {/* Tags */}
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-800/60" />
        <div className="h-6 w-20 rounded-full bg-slate-800/60" />
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-slate-800/50 pt-3">
        <div className="h-9 w-20 rounded-full bg-slate-800/60" />
        <div className="h-9 w-20 rounded-full bg-slate-800/60" />
        <div className="ml-auto h-9 w-20 rounded-full bg-slate-800/60" />
      </div>
    </div>
  );
});

/**
 * Lista de skeletons para loading state
 */
export const PostSkeletonList = memo(function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando posts...">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
      <span className="sr-only">Carregando posts da comunidade...</span>
    </div>
  );
});
