/**
 * Componente CommunityFeed - Seção principal com feed de posts
 * Exibe: featured post, error/loading/empty states, feed de posts, quick composer
 */

import type { FormEvent } from 'react';
import type { CommunityPost } from '@/types/community';
import {
  PostCard,
  PostSkeletonList,
  FeaturedCard,
  EmptyState,
  ErrorState,
  QuickComposer,
} from '../components';
import type { PostStatus, PostFormState, CommunityProfile } from '../hooks';
import type { CommentPreviewState } from '../hooks/useCommunityInteractions';
import type { LoadingState, PostType } from '../hooks';

export interface CommunityFeedProps {
  loadingState: LoadingState;
  featuredPost: CommunityPost | undefined;
  feedPosts: CommunityPost[];
  profile: CommunityProfile;
  postForm: PostFormState;
  postStatus: PostStatus;
  postError: string;
  savedPosts: Record<string, boolean>;
  reactions: Record<string, { energia: number; apoio: number }>;
  commentStatus: Record<string, 'idle' | 'saving' | 'error'>;
  commentInputs: Record<string, string>;
  commentError: Record<string, string>;
  commentPreviews: Record<string, CommentPreviewState>;
  promptOfDay: string;
  formatRelativeTime: (date: string) => string;
  truncate: (text: string, length?: number) => string;
  classifyPost: (post: CommunityPost) => PostType;
  quickTagSuggestions: string[];
  onPostChange: (field: keyof PostFormState, value: string) => void;
  onPostSubmit: (e: FormEvent) => Promise<void>;
  onAddTag: (tag: string) => void;
  onToggleSave: (postId: string) => void;
  onReaction: (postId: string, type: 'energia' | 'apoio') => void;
  onLoadCommentPreview: (postId: string) => Promise<void>;
  onCommentChange: (postId: string, value: string) => void;
  onCommentSubmit: (e: FormEvent, postId: string) => Promise<void>;
  onRetry: () => Promise<void>;
  onResetFilters: () => void;
}

export const CommunityFeed = ({
  loadingState,
  featuredPost,
  feedPosts,
  profile,
  postForm,
  postStatus,
  postError,
  savedPosts,
  reactions,
  commentStatus,
  commentInputs,
  commentError,
  commentPreviews,
  promptOfDay,
  formatRelativeTime,
  truncate,
  classifyPost,
  quickTagSuggestions,
  onPostChange,
  onPostSubmit,
  onAddTag,
  onToggleSave,
  onReaction,
  onLoadCommentPreview,
  onCommentChange,
  onCommentSubmit,
  onRetry,
  onResetFilters,
}: CommunityFeedProps) => {
  return (
    <main className="space-y-6">
      <QuickComposer
        profile={{
          displayName: profile.displayName || 'Tripulação',
          avatarUrl: profile.avatarUrl,
        }}
        prompt={promptOfDay}
        form={{ body: postForm.body, tags: postForm.tags }}
        status={postStatus}
        error={postError}
        suggestions={quickTagSuggestions}
        onChange={onPostChange}
        onSubmit={onPostSubmit}
        onAddTag={onAddTag}
      />

      {/* Error state */}
      {loadingState === 'error' && (
        <ErrorState
          title="Erro ao carregar"
          description="Não foi possível carregar os posts da comunidade."
          onRetry={onRetry}
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
              onToggleSave={() => onToggleSave(featuredPost.id)}
            />
          )}

          {/* Empty state */}
          {feedPosts.length === 0 && !featuredPost && (
            <EmptyState
              title="Nenhum post encontrado"
              description="Ajuste os filtros ou volte para 'Todos' para ver o fluxo completo."
              action={{
                label: 'Limpar filtros',
                onClick: onResetFilters,
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
              commentPreview={commentPreviews[post.id]?.comments ?? []}
              commentPreviewStatus={commentPreviews[post.id]?.status ?? 'idle'}
              onToggleSave={() => onToggleSave(post.id)}
              onReaction={(type) => onReaction(post.id, type)}
              onLoadCommentPreview={() => onLoadCommentPreview(post.id)}
              onCommentChange={(value) => onCommentChange(post.id, value)}
              onCommentSubmit={(e) => onCommentSubmit(e, post.id)}
            />
          ))}
        </>
      )}
    </main>
  );
};
