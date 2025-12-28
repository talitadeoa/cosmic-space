'use client';

import { SpacePageLayout } from '@/components/SpacePageLayout';
import Link from 'next/link';

const COMMUNITY_POSTS = [
  {
    id: '1',
    author: 'Observatório Lunar',
    time: 'há 2h',
    title: 'Ritual da Lua Cheia',
    excerpt:
      'Compartilhe o que você está encerrando neste ciclo e como a comunidade pode apoiar.',
    tags: ['rituais', 'reflexões'],
  },
  {
    id: '2',
    author: 'Tripulação Oráculo',
    time: 'ontem',
    title: 'Mapa das órbitas de foco',
    excerpt:
      'Como usar as fases lunares para distribuir energia entre planetas pessoais.',
    tags: ['foco', 'planejamento'],
  },
  {
    id: '3',
    author: 'Núcleo Galáctico',
    time: 'há 3 dias',
    title: 'Laboratório de gestos',
    excerpt: 'Experimente arrastar e segurar para reagir aos diários da comunidade.',
    tags: ['gestos', 'experimentos'],
  },
];

const COMMUNITY_STREAMS = [
  {
    id: 'a',
    title: 'Cartas da Galáxia',
    description: 'Editorial semanal com leituras profundas e convites para jornadas guiadas.',
    cadence: 'Semanal',
  },
  {
    id: 'b',
    title: 'Sussurros Orbitais',
    description: 'Notas rápidas e poéticas para acompanhar ciclos diários.',
    cadence: 'Diário',
  },
  {
    id: 'c',
    title: 'Arquivo do Cosmos',
    description: 'Ensaios longos e pesquisas de comunidade em fases completas.',
    cadence: 'Mensal',
  },
];

const COMMUNITY_GESTURES = [
  {
    title: 'Deslize para navegar',
    description: 'Alterna entre fluxos (micro-posts, cartas longas e eventos).',
  },
  {
    title: 'Toque & segure',
    description: 'Salva uma publicação na sua órbita pessoal.',
  },
  {
    title: 'Arraste para reagir',
    description: 'Envie energia para um post sem usar botões.',
  },
];

const ComunidadePage = () => {
  return (
    <SpacePageLayout className="px-6 py-12 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Comunidade</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            O encontro entre{' '}
            <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
              pulsos sociais
            </span>{' '}
            e narrativas profundas
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Um espaço que mistura a velocidade de um feed social com a profundidade de cartas
            editoriais. Aqui, cada publicação vira uma órbita compartilhada.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-slate-700/70 bg-black/30 px-4 py-2">
              Feed em tempo real
            </span>
            <span className="rounded-full border border-slate-700/70 bg-black/30 px-4 py-2">
              Cartas longas
            </span>
            <span className="rounded-full border border-slate-700/70 bg-black/30 px-4 py-2">
              Eventos de lua cheia
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Fluxo orbital
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">Postagens em tempo real</h2>
              </div>
              <Link
                href="/cosmos"
                className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-white"
              >
                Visitar cosmos
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {COMMUNITY_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 transition hover:border-indigo-400/60"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{post.author}</span>
                    <span>{post.time}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{post.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-700/70 bg-black/40 px-3 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cartas</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Publicações profundas</h2>
              <p className="mt-3 text-sm text-slate-300">
                Escolha uma trilha editorial para acompanhar. Cada stream funciona como um
                Substack cósmico, com histórias longas e arquivadas por ciclo.
              </p>

              <div className="mt-5 space-y-4">
                {COMMUNITY_STREAMS.map((stream) => (
                  <div key={stream.id} className="rounded-2xl border border-slate-800/80 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span className="font-semibold text-white">{stream.title}</span>
                      <span className="rounded-full border border-slate-700/70 px-2 py-1 text-xs">
                        {stream.cadence}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{stream.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Gestos</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Interações sem botões</h2>
              <ul className="mt-4 space-y-4 text-sm text-slate-300">
                {COMMUNITY_GESTURES.map((gesture) => (
                  <li key={gesture.title} className="rounded-2xl border border-slate-800/80 p-4">
                    <p className="text-sm font-semibold text-white">{gesture.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{gesture.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </SpacePageLayout>
  );
};

export default ComunidadePage;
