'use client';

import { memo, type FormEvent } from 'react';
import Link from 'next/link';
import type { CommunityComment, CommunityPost } from '@/types/community';
import { Avatar } from './Avatar';
import {
  SparklesIcon,
  HandThumbUpIcon,
  BookmarkIcon,
  BookmarkOutlineIcon,
  ChatBubbleIcon,
  PaperAirplaneIcon,
} from './icons';

type PostCardProps = {
  post: CommunityPost;
  formatRelativeTime: (date: string) => string;
  classifyPost: (post: CommunityPost) => string;
  truncate: (text: string, length?: number) => string;
  isSaved: boolean;
  reactions: { energia: number; apoio: number };
  commentValue: string;
  commentStatus: 'idle' | 'saving' | 'error';
  commentError: string;
  commentPreview: CommunityComment[];
  commentPreviewStatus: 'idle' | 'loading' | 'error' | 'success';
  onToggleSave: () => void;
  onReaction: (type: 'energia' | 'apoio') => void;
  onLoadCommentPreview: () => void;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent) => void;
};

/**
 * Card de post individual com ações inline
 * Layout mobile-first com avatar, conteúdo e ações
 */
export const PostCard = memo(function PostCard({
  post,
  formatRelativeTime,
  classifyPost,
  truncate,
  isSaved,
  reactions,
  commentValue,
  commentStatus,
  commentError,
  commentPreview,
  commentPreviewStatus,
  onToggleSave,
  onReaction,
  onLoadCommentPreview,
  onCommentChange,
  onCommentSubmit,
}: PostCardProps) {
  const postType = classifyPost(post);
  const images = post.images ?? [];
  const imageHeightClass = images.length > 1 ? 'h-40 sm:h-44' : 'h-52 sm:h-64';
  const commentInputId = `comment-${post.id}`;
  const handlePreviewClick = () => {
    if (commentPreviewStatus === 'idle' || commentPreviewStatus === 'error') {
      onLoadCommentPreview();
    }
    const input = document.getElementById(commentInputId);
    input?.focus();
  };

  return (
    <article
      className="group rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 transition-colors hover:border-indigo-400/40"
      aria-labelledby={`post-title-${post.id}`}
    >
      {/* Header: Avatar + Author + Meta */}
      <div className="flex items-start gap-3">
        <Link
          href={`/comunidade/perfil/${post.authorId}`}
          className="shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-full"
          aria-label={`Ver perfil de ${post.authorName}`}
        >
          <Avatar
            src={post.authorAvatarUrl}
            alt={`Avatar de ${post.authorName}`}
            name={post.authorName}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/comunidade/perfil/${post.authorId}`}
              className="text-sm font-semibold text-slate-100 transition-colors hover:text-indigo-300 focus-visible:outline-none focus-visible:text-indigo-300"
            >
              {post.authorName}
            </Link>
            <span className="text-xs text-slate-500">•</span>
            <time className="text-xs text-slate-500" dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
          <span className="mt-0.5 inline-block rounded-full border border-slate-700/70 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {postType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3
          id={`post-title-${post.id}`}
          className="text-base font-semibold leading-snug text-white sm:text-lg"
        >
          {post.title || 'Pulso da comunidade'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{truncate(post.body, 180)}</p>
      </div>

      {/* Media */}
      {images.length > 0 && (
        <div className={`mt-3 grid gap-2 ${images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {images.slice(0, 2).map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className={`relative overflow-hidden rounded-xl border border-slate-800/70 ${imageHeightClass}`}
            >
              <img
                src={image.url}
                alt={image.alt || post.title || 'Imagem do post'}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {index === 1 && images.length > 2 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                  +{images.length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-700/50 bg-black/30 px-2.5 py-1 text-xs text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/50 pt-3">
        <button
          type="button"
          onClick={() => onReaction('energia')}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-700/70 bg-black/40 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label={`Reagir com energia. ${reactions.energia} reações`}
        >
          <SparklesIcon className="h-4 w-4" />
          <span>{reactions.energia}</span>
        </button>

        <button
          type="button"
          onClick={() => onReaction('apoio')}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-700/70 bg-black/40 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-rose-400 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          aria-label={`Reagir com apoio. ${reactions.apoio} reações`}
        >
          <HandThumbUpIcon className="h-4 w-4" />
          <span>{reactions.apoio}</span>
        </button>

        {post.commentsCount > 0 ? (
          <button
            type="button"
            onClick={handlePreviewClick}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-slate-400 transition-colors hover:text-indigo-300"
            aria-label={`${post.commentsCount} comentário${post.commentsCount === 1 ? '' : 's'}`}
          >
            <ChatBubbleIcon className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2 text-xs text-slate-500"
            aria-label="Nenhum comentário"
          >
            <ChatBubbleIcon className="h-4 w-4" />
            <span>0</span>
          </span>
        )}

        <button
          type="button"
          onClick={onToggleSave}
          className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-700/70 bg-black/40 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={isSaved ? 'Remover dos salvos' : 'Salvar post'}
          aria-pressed={isSaved}
        >
          {isSaved ? (
            <BookmarkIcon className="h-4 w-4 text-indigo-400" />
          ) : (
            <BookmarkOutlineIcon className="h-4 w-4" />
          )}
          <span className="sr-only sm:not-sr-only">{isSaved ? 'Salvo' : 'Salvar'}</span>
        </button>
      </div>

      {/* Comment preview */}
      {post.commentsCount > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800/60 bg-black/30 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conversas recentes</span>
            {commentPreviewStatus === 'idle' && (
              <button
                type="button"
                onClick={handlePreviewClick}
                className="text-indigo-300 transition-colors hover:text-indigo-200"
              >
                Ver conversa
              </button>
            )}
            {commentPreviewStatus === 'loading' && <span>Carregando...</span>}
          </div>

          {commentPreviewStatus === 'error' && (
            <p className="mt-2 text-xs text-rose-400" role="alert">
              Não foi possível carregar os comentários.
            </p>
          )}

          {commentPreview.length > 0 && (
            <ul className="mt-3 space-y-3">
              {commentPreview.map((comment) => (
                <li key={comment.id} className="flex gap-2">
                  <Avatar
                    src={comment.authorAvatarUrl}
                    alt={`Avatar de ${comment.authorName}`}
                    name={comment.authorName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-200">{comment.authorName}</span>
                      <time className="text-[10px] text-slate-500" dateTime={comment.createdAt}>
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {truncate(comment.body, 120)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {commentPreviewStatus === 'success' && commentPreview.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">Nenhum comentário recente.</p>
          )}
        </div>
      )}

      {/* Comment form */}
      <form className="mt-3" onSubmit={onCommentSubmit}>
        <div className="flex gap-2">
          <input
            id={commentInputId}
            type="text"
            value={commentValue}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Escreva um comentário..."
            className="min-h-[44px] flex-1 rounded-full border border-slate-800/80 bg-black/40 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Comentário"
          />
          <button
            type="submit"
            disabled={commentStatus === 'saving' || !commentValue.trim()}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-700/70 bg-indigo-500/20 px-3 text-indigo-300 transition-colors hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Enviar comentário"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        {commentError && (
          <p className="mt-1.5 text-xs text-rose-400" role="alert">
            {commentError}
          </p>
        )}
      </form>
    </article>
  );
});
