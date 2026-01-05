'use client';

import { memo, type FormEvent } from 'react';
import { PaperAirplaneIcon } from './icons';

type NewPostFormProps = {
  form: {
    title: string;
    body: string;
    tags: string;
    images: string;
  };
  status: 'idle' | 'saving' | 'saved' | 'error';
  error: string;
  onChange: (field: 'title' | 'body' | 'tags' | 'images', value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

/**
 * Formulário para criar novo post
 * Campos: título, corpo, tags, imagens
 */
export const NewPostForm = memo(function NewPostForm({
  form,
  status,
  error,
  onChange,
  onSubmit,
}: NewPostFormProps) {
  return (
    <section
      id="publicar"
      className="rounded-2xl border border-slate-800/70 bg-black/40 p-4 sm:p-5"
      aria-labelledby="new-post-heading"
    >
      <h2 id="new-post-heading" className="text-lg font-semibold text-white">
        Novo post
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Compartilhe insights, reflexões ou convites para a comunidade.
      </p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label htmlFor="post-title" className="sr-only">
            Título (opcional)
          </label>
          <input
            id="post-title"
            type="text"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Título (opcional)"
            className="min-h-[44px] w-full rounded-xl border border-slate-800/80 bg-black/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="post-body" className="sr-only">
            Conteúdo do post
          </label>
          <textarea
            id="post-body"
            value={form.body}
            onChange={(e) => onChange('body', e.target.value)}
            placeholder="O que você gostaria de compartilhar?"
            rows={4}
            className="min-h-[100px] w-full resize-none rounded-xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="post-tags" className="sr-only">
              Tags
            </label>
            <input
              id="post-tags"
              type="text"
              value={form.tags}
              onChange={(e) => onChange('tags', e.target.value)}
              placeholder="Tags (ex: rituais, foco)"
              className="min-h-[44px] w-full rounded-xl border border-slate-800/80 bg-black/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
          </div>
          <div>
            <label htmlFor="post-images" className="sr-only">
              URLs de imagem
            </label>
            <input
              id="post-images"
              type="text"
              value={form.images}
              onChange={(e) => onChange('images', e.target.value)}
              placeholder="URLs de imagem"
              className="min-h-[44px] w-full rounded-xl border border-slate-800/80 bg-black/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {error && (
            <p className="text-xs text-rose-400" role="alert">
              {error}
            </p>
          )}
          {status === 'saved' && (
            <p className="text-xs text-emerald-400" role="status">
              Post publicado com sucesso!
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'saving' || !form.body.trim()}
            className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {status === 'saving' ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </section>
  );
});
