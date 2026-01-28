'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChatBubbleIcon } from '../icons';

type Post = {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  tags: string[];
  commentsCount: number;
};

type ProfilePostGridProps = {
  posts: Post[];
  emptyMessage?: string;
};

export const ProfilePostGrid = memo(function ProfilePostGrid({
  posts,
  emptyMessage = 'Nenhum post ainda',
}: ProfilePostGridProps) {
  const truncate = (text: string, length = 100) => {
    if (text.length <= length) return text;
    return `${text.slice(0, length).trim()}…`;
  };

  const formatRelativeTime = (date: string) => {
    try {
      const now = new Date();
      const postDate = new Date(date);
      const diffMs = now.getTime() - postDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays}d`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
      return `${Math.floor(diffDays / 30)}m`;
    } catch {
      return '';
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/50 bg-black/30 p-8 text-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/comunidade/post/${post.id}`}
          className="group rounded-xl border border-slate-800/50 bg-black/30 p-4 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/5"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-white group-hover:text-indigo-300">
              {post.title || 'Pulso'}
            </h3>
            <span className="shrink-0 text-xs text-slate-500">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">{truncate(post.body)}</p>

          <div className="mt-3 flex items-center justify-between">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <ChatBubbleIcon className="h-3 w-3" />
              {post.commentsCount}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
});
