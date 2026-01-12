'use client';

import Link from 'next/link';
import { memo, type FormEvent } from 'react';
import { Avatar } from './Avatar';
import { PaperAirplaneIcon, SparklesIcon } from './icons';

type QuickComposerProps = {
  profile: {
    displayName: string;
    avatarUrl: string;
  };
  prompt: string;
  form: {
    body: string;
    tags: string;
  };
  status: 'idle' | 'saving' | 'saved' | 'error';
  error: string;
  suggestions: string[];
  onChange: (field: 'title' | 'body' | 'tags' | 'images', value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onAddTag: (tag: string) => void;
};

/**
 * Composer rapido para iniciar conversas
 */
export const QuickComposer = memo(function QuickComposer({
  profile,
  prompt,
  form,
  status,
  error,
  suggestions,
  onChange,
  onSubmit,
  onAddTag,
}: QuickComposerProps) {
  const selectedTags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <section
      className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 sm:p-5"
      aria-labelledby="quick-composer-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Pulso rapido</p>
          <h2 id="quick-composer-heading" className="mt-1 text-lg font-semibold text-white">
            Compartilhe em segundos
          </h2>
        </div>
        <Link
          href="#publicar"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-700/70 bg-black/30 px-3 text-xs font-medium text-slate-200 transition-colors hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <SparklesIcon className="h-4 w-4" />
          Editor completo
        </Link>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Prompt do dia: <span className="font-medium text-slate-200">{prompt}</span>
      </p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div className="flex gap-3 rounded-2xl border border-slate-800/70 bg-black/30 p-3 sm:p-4">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName ? `Avatar de ${profile.displayName}` : 'Seu avatar'}
            name={profile.displayName || 'Tripulacao'}
            size="sm"
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <label htmlFor="quick-post-body" className="sr-only">
              Conteudo rapido
            </label>
            <textarea
              id="quick-post-body"
              value={form.body}
              onChange={(event) => onChange('body', event.target.value)}
              placeholder="O que esta pulsando agora?"
              rows={3}
              className="min-h-[90px] w-full resize-none rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              required
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onAddTag(tag)}
                  className="rounded-full border border-slate-700/70 bg-black/40 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  #{tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] text-indigo-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {error && (
              <span className="text-rose-400" role="alert">
                {error}
              </span>
            )}
            {status === 'saved' && (
              <span className="text-emerald-400" role="status">
                Publicado com sucesso!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'saving' || !form.body.trim()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {status === 'saving' ? 'Publicando...' : 'Publicar rapido'}
          </button>
        </div>
      </form>
    </section>
  );
});
