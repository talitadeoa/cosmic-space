'use client';

import { SpacePageLayout } from '@/components/layouts';
import type { CommunityPost } from '@/types/community';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CommunityHeader,
  CategoryChips,
  PostCard,
  PostSkeletonList,
  FeaturedCard,
  EmptyState,
  ErrorState,
  NewPostForm,
  StreamList,
} from './components';

// =============================================================================
// TYPES
// =============================================================================

type CommunityProfile = {
  displayName: string;
  avatarUrl: string;
  bio: string;
};

type LoadingState = 'idle' | 'loading' | 'error' | 'success';
type PostType = 'Todos' | 'Pulso' | 'Carta' | 'Evento';

// =============================================================================
// CONSTANTS
// =============================================================================

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

const TYPE_FILTERS: PostType[] = ['Todos', 'Pulso', 'Carta', 'Evento'];

// =============================================================================
// HELPERS
// =============================================================================

const classifyPost = (post: CommunityPost): PostType => {
  const normalizedTags = post.tags.map((tag) => tag.toLowerCase());
  if (normalizedTags.some((tag) => ['evento', 'eventos', 'lua'].includes(tag))) {
    return 'Evento';
  }
  if (post.body.length > 220 || normalizedTags.includes('cartas')) {
    return 'Carta';
  }
  return 'Pulso';
};

const truncate = (text: string, length = 140) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapApiPost = (post: any): CommunityPost => ({
  id: String(post.id),
  authorName: post.author?.name ?? 'Tripulação',
  authorAvatarUrl: post.author?.avatarUrl ?? null,
  createdAt: post.createdAt ?? new Date().toISOString(),
  title: post.title ?? null,
  body: post.body ?? '',
  tags: Array.isArray(post.tags) ? post.tags : [],
  commentsCount: Number(post.commentsCount ?? 0),
});

// =============================================================================
// COMPONENT
// =============================================================================

const ComunidadePage = () => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [posts, setPosts] = useState<CommunityPost[]>(FALLBACK_POSTS);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [searchError, setSearchError] = useState('');
  const [profile, setProfile] = useState<CommunityProfile>({
    displayName: '',
    avatarUrl: '',
    bio: '',
  });
  const [postStatus, setPostStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [postError, setPostError] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    body: '',
    tags: '',
    images: '',
  });
  const [activeTag, setActiveTag] = useState('Todos');
  const [activeType, setActiveType] = useState<PostType>('Todos');
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [reactions, setReactions] = useState<Record<string, { energia: number; apoio: number }>>(
    {}
  );
  const [commentStatus, setCommentStatus] = useState<Record<string, 'idle' | 'saving' | 'error'>>(
    {}
  );
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentError, setCommentError] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // MEMOIZED VALUES
  // ---------------------------------------------------------------------------
  const relativeTime = useMemo(() => {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  }, []);

  const formatRelativeTime = useCallback(
    (isoDate: string) => {
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
    },
    [relativeTime]
  );

  const tagFilters = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
    return ['Todos', ...Array.from(tagSet)];
  }, [posts]);

  const visiblePosts = useMemo(() => {
    let filtered = posts;
    if (activeType !== 'Todos') {
      filtered = filtered.filter((post) => classifyPost(post) === activeType);
    }
    if (activeTag !== 'Todos') {
      filtered = filtered.filter((post) => post.tags.includes(activeTag));
    }
    return filtered;
  }, [activeTag, activeType, posts]);

  const featuredPost = visiblePosts[0];
  const feedPosts = visiblePosts.slice(1);

  // ---------------------------------------------------------------------------
  // DATA LOADING
  // ---------------------------------------------------------------------------
  const loadPosts = useCallback(async (query?: string) => {
    try {
      const encodedQuery = query ? `&q=${encodeURIComponent(query)}` : '';
      const response = await fetch(`/api/community/posts?limit=6${encodedQuery}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao buscar posts');
      }
      const apiPosts = Array.isArray(data?.posts) ? data.posts.map(mapApiPost) : [];
      return apiPosts;
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const init = async () => {
      setLoadingState('loading');
      try {
        const [postsData, profileResponse] = await Promise.all([
          loadPosts().catch(() => null),
          fetch('/api/community/profile').catch(() => null),
        ]);

        if (!isActive) return;

        if (postsData && postsData.length > 0) {
          setPosts(postsData);
        }

        if (profileResponse?.ok) {
          const profileData = await profileResponse.json();
          if (profileData?.profile) {
            setProfile({
              displayName: profileData.profile.displayName ?? '',
              avatarUrl: profileData.profile.avatarUrl ?? '',
              bio: profileData.profile.bio ?? '',
            });
          }
        }

        setLoadingState('success');
      } catch {
        if (isActive) {
          setLoadingState('error');
        }
      }
    };

    init();

    return () => {
      isActive = false;
    };
  }, [loadPosts]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setSearchStatus('searching');
    setSearchError('');
    try {
      const results = await loadPosts(searchQuery.trim());
      setPosts(results);
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
      setSearchError('Não foi possível buscar.');
    }
  };

  const clearSearch = async () => {
    setSearchQuery('');
    setSearchStatus('searching');
    try {
      const results = await loadPosts('');
      setPosts(results);
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
    }
  };

  const handleRetry = async () => {
    setLoadingState('loading');
    try {
      const results = await loadPosts();
      if (results.length > 0) {
        setPosts(results);
      }
      setLoadingState('success');
    } catch {
      setLoadingState('error');
    }
  };

  const resetFilters = () => {
    setActiveTag('Todos');
    setActiveType('Todos');
  };

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

      // Refresh posts
      const refreshedPosts = await loadPosts();
      if (refreshedPosts.length > 0) {
        setPosts(refreshedPosts);
      }
    } catch {
      setPostStatus('error');
      setPostError('Não foi possível publicar. Verifique se está logado.');
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
      setCommentError((prev) => ({ ...prev, [postId]: 'Escreva um comentário.' }));
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
          post.id === postId ? { ...post, commentsCount: (post.commentsCount ?? 0) + 1 } : post
        )
      );
    } catch {
      setCommentStatus((prev) => ({ ...prev, [postId]: 'error' }));
      setCommentError((prev) => ({
        ...prev,
        [postId]: 'Não foi possível comentar.',
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <SpacePageLayout className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
        {/* Header compacto */}
        <CommunityHeader
          profile={profile}
          searchQuery={searchQuery}
          searchStatus={searchStatus}
          searchError={searchError}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          onSearchClear={clearSearch}
        />

        {/* Page intro */}
        <section className="mt-6" aria-labelledby="page-title">
          <p className="text-xs uppercase tracking-widest text-slate-500">Comunidade</p>
          <h1
            id="page-title"
            className="mt-1 text-xl font-semibold leading-tight text-white sm:text-2xl"
          >
            Conecte-se através de{' '}
            <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
              histórias
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Descubra um espaço onde cada publicação é uma oportunidade de conexão.
          </p>
        </section>

        {/* Filtros por tipo */}
        <section className="mt-5" aria-label="Filtros de tipo">
          <CategoryChips<PostType>
            items={TYPE_FILTERS}
            activeItem={activeType}
            onSelect={setActiveType}
            variant="type"
            ariaLabel="Filtrar por tipo de post"
          />
        </section>

        {/* Filtros por tag */}
        {tagFilters.length > 1 && (
          <section className="mt-3" aria-label="Filtros de tag">
            <CategoryChips<string>
              items={tagFilters}
              activeItem={activeTag}
              onSelect={setActiveTag}
              variant="tag"
              ariaLabel="Filtrar por tag"
            />
          </section>
        )}

        {/* Active filters indicator */}
        {(activeType !== 'Todos' || activeTag !== 'Todos' || searchQuery) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {searchQuery && (
              <span className="rounded-full border border-slate-700/70 bg-black/30 px-3 py-1">
                Busca: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
            {activeType !== 'Todos' && (
              <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-sky-300">
                {activeType}
              </span>
            )}
            {activeTag !== 'Todos' && (
              <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-indigo-300">
                #{activeTag}
              </span>
            )}
          </div>
        )}

        {/* Main content grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Feed principal */}
          <main className="space-y-5">
            {/* Error state */}
            {loadingState === 'error' && (
              <ErrorState
                title="Erro ao carregar"
                description="Não foi possível carregar os posts da comunidade."
                onRetry={handleRetry}
              />
            )}

            {/* Loading state */}
            {loadingState === 'loading' && <PostSkeletonList count={3} />}

            {/* Success state */}
            {loadingState === 'success' && (
              <>
                {/* Featured post */}
                {featuredPost && (
                  <FeaturedCard
                    post={featuredPost}
                    formatRelativeTime={formatRelativeTime}
                    truncate={truncate}
                    isSaved={savedPosts[featuredPost.id] ?? false}
                    onToggleSave={() => toggleSave(featuredPost.id)}
                  />
                )}

                {/* Empty state */}
                {visiblePosts.length === 0 && (
                  <EmptyState
                    title="Nenhum post encontrado"
                    description="Ajuste os filtros ou volte para 'Todos' para ver o fluxo completo."
                    action={{
                      label: 'Limpar filtros',
                      onClick: resetFilters,
                    }}
                  />
                )}

                {/* Feed posts */}
                {feedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    formatRelativeTime={formatRelativeTime}
                    classifyPost={classifyPost}
                    truncate={truncate}
                    isSaved={savedPosts[post.id] ?? false}
                    reactions={reactions[post.id] ?? { energia: 0, apoio: 0 }}
                    commentValue={commentInputs[post.id] ?? ''}
                    commentStatus={commentStatus[post.id] ?? 'idle'}
                    commentError={commentError[post.id] ?? ''}
                    onToggleSave={() => toggleSave(post.id)}
                    onReaction={(type) => addReaction(post.id, type)}
                    onCommentChange={(value) => handleCommentChange(post.id, value)}
                    onCommentSubmit={(e) => submitComment(e, post.id)}
                  />
                ))}
              </>
            )}
          </main>

          {/* Sidebar (desktop) / Stacked (mobile) */}
          <aside className="space-y-5">
            {/* New Post Form */}
            <NewPostForm
              form={postForm}
              status={postStatus}
              error={postError}
              onChange={handlePostChange}
              onSubmit={submitPost}
            />

            {/* Streams */}
            <StreamList streams={COMMUNITY_STREAMS} />
          </aside>
        </div>
      </div>
    </SpacePageLayout>
  );
};

export default ComunidadePage;
