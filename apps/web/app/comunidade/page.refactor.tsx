'use client';

import { SpacePageLayout } from '@/components/layouts';
import AuthGate from '@/components/auth/AuthGate';
import {
  useCommunityData,
  useCommunityFilters,
  classifyPost,
  useCommunityInteractions,
  usePostForm,
  useCommunityHelpers,
} from './hooks';
import { CommunityFeed } from './components/CommunityFeed';
import { CommunitySidebar } from './components/CommunitySidebar';
import { CommunityFiltersBar } from './components/CommunityFiltersBar';
import { CommunityHeader } from './components';

// Constants
const TYPE_FILTERS = ['Todos', 'Pulso', 'Carta', 'Evento'] as const;
const QUICK_TAG_SUGGESTIONS = ['rituais', 'lua-cheia', 'reflexões', 'planejamento', 'autocuidado'];
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

/**
 * Página da Comunidade
 * Orquestra hooks e componentes para exibir feed de comunidade
 */
export default function ComunidadePage() {
  // Data loading
  const {
    posts,
    loadingState,
    searchQuery,
    profile,
    handleSearch,
    clearSearch,
    handleRetry,
  } = useCommunityData();

  // Filtering
  const {
    activeTag,
    setActiveTag,
    activeType,
    setActiveType,
    tagFilters,
    visiblePosts,
    featuredPost,
    feedPosts,
    resetFilters,
  } = useCommunityFilters(posts);

  // User interactions
  const {
    savedPosts,
    toggleSave,
    reactions,
    addReaction,
    commentStatus,
    commentInputs,
    commentError,
    commentPreviews,
    handleCommentChange,
    loadCommentPreview,
    submitComment,
  } = useCommunityInteractions();

  // Post form
  const {
    postForm,
    postStatus,
    postError,
    handlePostChange,
    handleAddTag,
    submitPost,
  } = usePostForm();

  // Helpers (formatting, etc)
  const {
    promptOfDay,
    formatRelativeTime,
    truncate,
  } = useCommunityHelpers();

  return (
    <AuthGate accessTarget="comunidade" chatButtonSize="compact">
      <SpacePageLayout>
        <div className="space-y-8">
        {/* Header */}
        <CommunityHeader
          profile={profile}
          searchQuery={searchQuery}
          searchStatus={loadingState === 'loading' ? 'searching' : loadingState === 'error' ? 'error' : 'idle'}
          searchError={loadingState === 'error' ? 'Erro ao buscar posts' : ''}
          onSearchChange={handleSearch}
          onSearchSubmit={(e) => { e.preventDefault(); }}
          onSearchClear={clearSearch}
        />

        {/* Filters */}
        <CommunityFiltersBar
          activeType={activeType}
          onTypeChange={setActiveType}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          tagFilters={tagFilters}
          typeFilters={TYPE_FILTERS as any}
          searchQuery={searchQuery}
          onResetFilters={resetFilters}
        />

        {/* Main content grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Feed */}
          <CommunityFeed
            loadingState={loadingState}
            featuredPost={featuredPost}
            feedPosts={feedPosts}
            profile={profile}
            postForm={postForm}
            postStatus={postStatus}
            postError={postError}
            savedPosts={savedPosts}
            reactions={reactions}
            commentStatus={commentStatus}
            commentInputs={commentInputs}
            commentError={commentError}
            commentPreviews={commentPreviews}
            promptOfDay={promptOfDay}
            formatRelativeTime={formatRelativeTime}
            truncate={truncate}
            classifyPost={classifyPost}
            quickTagSuggestions={QUICK_TAG_SUGGESTIONS}
            onPostChange={handlePostChange}
            onPostSubmit={submitPost}
            onAddTag={handleAddTag}
            onToggleSave={toggleSave}
            onReaction={addReaction}
            onLoadCommentPreview={loadCommentPreview}
            onCommentChange={handleCommentChange}
            onCommentSubmit={submitComment}
            onRetry={handleRetry}
            onResetFilters={resetFilters}
          />

          {/* Sidebar */}
          <CommunitySidebar
            profile={profile}
            postForm={postForm}
            postStatus={postStatus}
            postError={postError}
            streams={COMMUNITY_STREAMS}
            onPostChange={handlePostChange}
            onPostSubmit={submitPost}
            onTopicClick={(topic) => setActiveTag(topic.name)}
          />
        </div>
        </div>
      </SpacePageLayout>
    </AuthGate>
  );
}
