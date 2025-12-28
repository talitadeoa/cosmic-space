'use client';

import { SpacePageLayout } from '@/components/SpacePageLayout';
import type { CommunityPost } from '@/types/community';
import Link from 'next/link';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

type CommunityProfile = {
  displayName: string;
  avatarUrl: string;
  bio: string;
};

const FALLBACK_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Observatório Lunar',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    title: 'Ritual da Lua Cheia',
    body: 'Compartilhe o que você está encerrando neste ciclo e como a comunidade pode apoiar.',
    tags: ['rituais', 'reflexões'],
    commentsCount: 0,
  },
  {
    id: '2',
    authorName: 'Tripulação Oráculo',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    title: 'Mapa das órbitas de foco',
    body: 'Como usar as fases lunares para distribuir energia entre planetas pessoais.',
    tags: ['foco', 'planejamento'],
    commentsCount: 0,
  },
  {
    id: '3',
    authorName: 'Núcleo Galáctico',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Laboratório de gestos',
    body: 'Experimente arrastar e segurar para reagir aos diários da comunidade.',
    tags: ['gestos', 'experimentos'],
    commentsCount: 0,
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
  const [posts, setPosts] = useState<CommunityPost[]>(FALLBACK_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [searchError, setSearchError] = useState('');
  const [profile, setProfile] = useState<CommunityProfile>({
    displayName: '',
    avatarUrl: '',
    bio: '',
  });
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [profileError, setProfileError] = useState('');
  const [postStatus, setPostStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [postError, setPostError] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    body: '',
    tags: '',
    images: '',
  });
  const [activeTag, setActiveTag] = useState('Todos');
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [reactions, setReactions] = useState<Record<string, { energia: number; apoio: number }>>(
    {}
  );
  const [commentStatus, setCommentStatus] = useState<Record<string, 'idle' | 'saving' | 'error'>>(
    {}
  );
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentError, setCommentError] = useState<Record<string, string>>({});

  useEffect(() => {
    let isActive = true;
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/community/posts?limit=6');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Erro ao buscar posts');
        }
        const apiPosts = Array.isArray(data?.posts)
          ? data.posts.map((post: any) => ({
              id: String(post.id),
              authorName: post.author?.name ?? 'Tripulação',
              authorAvatarUrl: post.author?.avatarUrl ?? null,
              createdAt: post.createdAt ?? new Date().toISOString(),
              title: post.title ?? null,
              body: post.body ?? '',
              tags: Array.isArray(post.tags) ? post.tags : [],
              commentsCount: Number(post.commentsCount ?? 0),
            }))
          : [];

        if (isActive && apiPosts.length > 0) {
          setPosts(apiPosts);
        }
      } catch (error) {
        console.warn('Não foi possível carregar posts da comunidade:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/community/profile');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Erro ao buscar perfil');
        }
        if (isActive && data?.profile) {
          setProfile({
            displayName: data.profile.displayName ?? '',
            avatarUrl: data.profile.avatarUrl ?? '',
            bio: data.profile.bio ?? '',
          });
        }
      } catch (error) {
        if (isActive) {
          setProfileError('Faça login para editar seu perfil.');
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const relativeTime = useMemo(() => {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  }, []);

  const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'agora';
    const diffMs = date.getTime() - Date.now();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffSeconds) < 60) return relativeTime.format(diffSeconds, 'second');
    if (Math.abs(diffMinutes) < 60) return relativeTime.format(diffMinutes, 'minute');
    if (Math.abs(diffHours) < 24) return relativeTime.format(diffHours, 'hour');
    return relativeTime.format(diffDays, 'day');
  };

  const truncate = (text: string, length = 140) => {
    if (text.length <= length) return text;
    return `${text.slice(0, length).trim()}…`;
  };

  const classifyPost = (post: CommunityPost) => {
    const normalizedTags = post.tags.map((tag) => tag.toLowerCase());
    if (normalizedTags.some((tag) => ['evento', 'eventos', 'lua'].includes(tag))) {
      return 'Evento';
    }
    if (post.body.length > 220 || normalizedTags.includes('cartas')) {
      return 'Carta';
    }
    return 'Pulso';
  };

  const initialsFor = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
    return initials.join('') || 'C';
  };

  const fetchPosts = async (query: string) => {
    setSearchStatus('searching');
    setSearchError('');
    try {
      const encodedQuery = query ? `&q=${encodeURIComponent(query)}` : '';
      const response = await fetch(`/api/community/posts?limit=6${encodedQuery}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao buscar posts');
      }
      const apiPosts = Array.isArray(data?.posts)
        ? data.posts.map((post: any) => ({
            id: String(post.id),
            authorName: post.author?.name ?? 'Tripulacao',
            authorAvatarUrl: post.author?.avatarUrl ?? null,
            createdAt: post.createdAt ?? new Date().toISOString(),
            title: post.title ?? null,
            body: post.body ?? '',
            tags: Array.isArray(post.tags) ? post.tags : [],
            commentsCount: Number(post.commentsCount ?? 0),
          }))
        : [];
      setPosts(apiPosts);
      setSearchStatus('idle');
    } catch (error) {
      setSearchStatus('error');
      setSearchError('Nao foi possivel buscar.');
    }
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    await fetchPosts(searchQuery.trim());
  };

  const clearSearch = async () => {
    setSearchQuery('');
    await fetchPosts('');
  };

  const handleProfileChange = (field: keyof CommunityProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileStatus('idle');
    setProfileError('');
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileStatus('saving');
    setProfileError('');
    try {
      const response = await fetch('/api/community/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao salvar perfil');
      }
      setProfile({
        displayName: data.profile.displayName ?? '',
        avatarUrl: data.profile.avatarUrl ?? '',
        bio: data.profile.bio ?? '',
      });
      setProfileStatus('saved');
    } catch (error) {
      setProfileStatus('error');
      setProfileError('Nao foi possivel salvar o perfil.');
    }
  };

  const tagFilters = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
    return ['Todos', ...Array.from(tagSet)];
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (activeTag === 'Todos') return posts;
    return posts.filter((post) => post.tags.includes(activeTag));
  }, [activeTag, posts]);

  const featuredPost = visiblePosts[0];

  const handlePostChange = (field: keyof typeof postForm, value: string) => {
    setPostForm((prev) => ({ ...prev, [field]: value }));
    setPostStatus('idle');
    setPostError('');
  };

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();
    setPostStatus('saving');
    setPostError('');

    const tags = postForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const images = postForm.images
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url }));

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postForm.title.trim(),
          body: postForm.body.trim(),
          tags,
          images,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao criar post');
      }
      setPostStatus('saved');
      setPostForm({ title: '', body: '', tags: '', images: '' });
      const refresh = await fetch('/api/community/posts?limit=6');
      const refreshData = await refresh.json();
      if (refresh.ok && Array.isArray(refreshData?.posts)) {
        setPosts(
          refreshData.posts.map((post: any) => ({
            id: String(post.id),
            authorName: post.author?.name ?? 'Tripulacao',
            authorAvatarUrl: post.author?.avatarUrl ?? null,
            createdAt: post.createdAt ?? new Date().toISOString(),
            title: post.title ?? null,
            body: post.body ?? '',
            tags: Array.isArray(post.tags) ? post.tags : [],
            commentsCount: Number(post.commentsCount ?? 0),
          }))
        );
      }
    } catch (error) {
      setPostStatus('error');
      setPostError('Nao foi possivel publicar. Verifique se esta logado.');
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
    setCommentStatus((prev) => ({ ...prev, [postId]: 'idle' }));
    setCommentError((prev) => ({ ...prev, [postId]: '' }));
  };

  const submitComment = async (event: FormEvent, postId: string) => {
    event.preventDefault();
    setCommentStatus((prev) => ({ ...prev, [postId]: 'saving' }));
    setCommentError((prev) => ({ ...prev, [postId]: '' }));

    const body = commentInputs[postId]?.trim() ?? '';
    if (!body) {
      setCommentStatus((prev) => ({ ...prev, [postId]: 'error' }));
      setCommentError((prev) => ({ ...prev, [postId]: 'Escreva um comentario.' }));
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao comentar');
      }
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setCommentStatus((prev) => ({ ...prev, [postId]: 'idle' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, commentsCount: (post.commentsCount ?? 0) + 1 }
            : post
        )
      );
    } catch (error) {
      setCommentStatus((prev) => ({ ...prev, [postId]: 'error' }));
      setCommentError((prev) => ({
        ...prev,
        [postId]: 'Nao foi possivel comentar.',
      }));
    }
  };

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addReaction = (postId: string, type: 'energia' | 'apoio') => {
    setReactions((prev) => ({
      ...prev,
      [postId]: {
        energia: prev[postId]?.energia ?? 0,
        apoio: prev[postId]?.apoio ?? 0,
        [type]: (prev[postId]?.[type] ?? 0) + 1,
      },
    }));
  };

  return (
    <SpacePageLayout className="px-6 py-12 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="relative space-y-4">
          <div className="absolute right-0 top-0 flex items-center gap-3 rounded-full border border-slate-800/70 bg-black/40 px-4 py-2 text-xs text-slate-200 shadow-2xl shadow-indigo-950/30">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-slate-900 text-[11px] font-semibold text-slate-200">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || 'Perfil'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span>{initialsFor(profile.displayName || 'Tripulacao')}</span>
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                Perfil
              </span>
              <span className="text-sm font-semibold text-slate-100">
                {profile.displayName || 'Tripulacao'}
              </span>
            </div>
            <Link
              href="/perfil"
              className="rounded-full border border-slate-700/70 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white"
            >
              Ver
            </Link>
          </div>
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
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar na comunidade..."
              className="min-w-[220px] flex-1 rounded-full border border-slate-700/70 bg-black/30 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={searchStatus === 'searching'}
              className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searchStatus === 'searching' ? 'Buscando' : 'Buscar'}
            </button>
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-white"
              >
                Limpar
              </button>
            ) : null}
            {searchError ? (
              <span className="text-xs uppercase tracking-[0.3em] text-rose-300">
                {searchError}
              </span>
            ) : null}
          </form>
          <div className="flex flex-wrap gap-2">
            {tagFilters.map((tag) => {
              const isActive = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                    isActive
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-slate-800/70 bg-black/30 text-slate-300 hover:border-indigo-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
            {featuredPost ? (
              <div className="mb-6 rounded-3xl border border-indigo-400/50 bg-gradient-to-br from-indigo-900/30 via-slate-950/70 to-black/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-indigo-400/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-indigo-200">
                    Destaque da semana
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatRelativeTime(featuredPost.createdAt)}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {featuredPost.title || 'Pulso em destaque'}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {truncate(featuredPost.body, 220)}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Curado para inspirar sua orbita pessoal.</span>
                  <button
                    type="button"
                    onClick={() => toggleSave(featuredPost.id)}
                    className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white"
                  >
                    {savedPosts[featuredPost.id] ? 'Salvo' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Fluxo orbital
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">Postagens em tempo real</h2>
                {isLoading ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    Carregando sinais da comunidade...
                  </p>
                ) : null}
              </div>
              <Link
                href="/cosmos"
                className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-white"
              >
                Visitar cosmos
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {visiblePosts.length === 0 ? (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 text-sm text-slate-300">
                  <p className="text-white">Nenhum pulso encontrado.</p>
                  <p className="mt-2 text-slate-400">
                    Tente outra tag ou volte para "Todos" para ver o fluxo completo.
                  </p>
                </div>
              ) : null}
              {visiblePosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 transition hover:border-indigo-400/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-slate-900 text-xs font-semibold text-slate-200">
                        {post.authorAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.authorAvatarUrl}
                            alt={post.authorName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span>{initialsFor(post.authorName)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          {post.authorName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatRelativeTime(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full border border-slate-700/70 px-2 py-1">
                        {classifyPost(post)}
                      </span>
                      <span>
                        {post.commentsCount} comentário{post.commentsCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {post.title || 'Pulso da comunidade'}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {truncate(post.body, 160)}
                  </p>
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
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addReaction(post.id, 'energia')}
                        className="rounded-full border border-slate-700/70 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white"
                      >
                        Energia {reactions[post.id]?.energia ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => addReaction(post.id, 'apoio')}
                        className="rounded-full border border-slate-700/70 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white"
                      >
                        Apoio {reactions[post.id]?.apoio ?? 0}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSave(post.id)}
                      className="rounded-full border border-slate-700/70 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white"
                    >
                      {savedPosts[post.id] ? 'Salvo' : 'Salvar'}
                    </button>
                  </div>
                  <form
                    className="mt-4 space-y-2"
                    onSubmit={(event) => submitComment(event, post.id)}
                  >
                    <textarea
                      value={commentInputs[post.id] ?? ''}
                      onChange={(event) => handleCommentChange(post.id, event.target.value)}
                      rows={2}
                      placeholder="Responder com um comentario..."
                      className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span>{commentError[post.id] ?? ''}</span>
                      <button
                        type="submit"
                        disabled={commentStatus[post.id] === 'saving'}
                        className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {commentStatus[post.id] === 'saving' ? 'Enviando' : 'Comentar'}
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Perfil publico
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Ajuste sua identidade</h2>
              <p className="mt-3 text-sm text-slate-300">
                Escolha como voce aparece nos posts e comentarios.
              </p>
              <form className="mt-5 space-y-4" onSubmit={saveProfile}>
                <input
                  value={profile.displayName}
                  onChange={(event) => handleProfileChange('displayName', event.target.value)}
                  placeholder="Nome publico"
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <input
                  value={profile.avatarUrl}
                  onChange={(event) => handleProfileChange('avatarUrl', event.target.value)}
                  placeholder="URL do avatar"
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <textarea
                  value={profile.bio}
                  onChange={(event) => handleProfileChange('bio', event.target.value)}
                  placeholder="Bio curta"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{profileError}</span>
                  <button
                    type="submit"
                    disabled={profileStatus === 'saving'}
                    className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {profileStatus === 'saving' ? 'Salvando' : 'Salvar perfil'}
                  </button>
                </div>
                {profileStatus === 'saved' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                    Perfil atualizado
                  </p>
                ) : null}
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Novo pulso
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Publicar na comunidade</h2>
              <p className="mt-3 text-sm text-slate-300">
                Compartilhe insights curtos ou notas mais longas. Tags e imagens sao opcionais.
              </p>
              <form className="mt-5 space-y-4" onSubmit={submitPost}>
                <input
                  value={postForm.title}
                  onChange={(event) => handlePostChange('title', event.target.value)}
                  placeholder="Titulo (opcional)"
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <textarea
                  value={postForm.body}
                  onChange={(event) => handlePostChange('body', event.target.value)}
                  placeholder="Escreva seu post..."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <input
                  value={postForm.tags}
                  onChange={(event) => handlePostChange('tags', event.target.value)}
                  placeholder="Tags separadas por virgula (ex: rituais, foco)"
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <input
                  value={postForm.images}
                  onChange={(event) => handlePostChange('images', event.target.value)}
                  placeholder="URLs de imagem separadas por virgula"
                  className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{postError}</span>
                  <button
                    type="submit"
                    disabled={postStatus === 'saving'}
                    className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {postStatus === 'saving' ? 'Publicando' : 'Publicar'}
                  </button>
                </div>
                {postStatus === 'saved' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                    Post publicado
                  </p>
                ) : null}
              </form>
            </div>

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
