'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import {
  ProfileHeader,
  ProfileStats,
  ProfilePostGrid,
  FollowButton,
} from '../../components/profile';

// =============================================================================
// TYPES
// =============================================================================

type CosmicLevel = 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';

type ProfileData = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  lunarSign: string | null;
  cosmicLevel: CosmicLevel;
  cosmicPoints: number;
  joinedAt: string;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  streakDays: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
};

type Post = {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  tags: string[];
  commentsCount: number;
};

type LoadingState = 'loading' | 'success' | 'error' | 'not-found';

// =============================================================================
// COMPONENT
// =============================================================================

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // DATA LOADING
  // ---------------------------------------------------------------------------

  const loadProfile = useCallback(async () => {
    try {
      setLoadingState('loading');
      const response = await fetch(`/api/community/profile/${userId}`);

      if (response.status === 404) {
        setLoadingState('not-found');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const data = await response.json();
      setProfile(data.profile);
      setPosts(data.recentPosts ?? []);
      setLoadingState('success');
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Não foi possível carregar o perfil.');
      setLoadingState('error');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleFollowChange = (isNowFollowing: boolean) => {
    if (!profile) return;

    setProfile({
      ...profile,
      isFollowing: isNowFollowing,
      stats: {
        ...profile.stats,
        followersCount: profile.stats.followersCount + (isNowFollowing ? 1 : -1),
      },
    });
  };

  // ---------------------------------------------------------------------------
  // RENDER STATES
  // ---------------------------------------------------------------------------

  if (loadingState === 'loading') {
    return (
      <SpacePageLayout>
        <div className="space-y-6">
          {/* Skeleton Header */}
          <div className="animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/50 p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="h-24 w-24 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-3">
                <div className="mx-auto h-6 w-40 rounded bg-slate-800 sm:mx-0" />
                <div className="mx-auto h-4 w-60 rounded bg-slate-800 sm:mx-0" />
                <div className="mx-auto h-4 w-32 rounded bg-slate-800 sm:mx-0" />
              </div>
            </div>
          </div>

          {/* Skeleton Stats */}
          <div className="animate-pulse rounded-xl border border-slate-800/50 bg-black/30 p-4">
            <div className="flex justify-center gap-8 sm:justify-start">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 text-center">
                  <div className="mx-auto h-6 w-12 rounded bg-slate-800" />
                  <div className="mx-auto h-3 w-16 rounded bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SpacePageLayout>
    );
  }

  if (loadingState === 'not-found') {
    return (
      <SpacePageLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl">🌑</span>
          <h1 className="mt-4 text-xl font-semibold text-white">Perfil não encontrado</h1>
          <p className="mt-2 text-sm text-slate-400">
            Esta órbita parece vazia. O usuário pode ter se desconectado do cosmos.
          </p>
          <button
            onClick={() => router.push('/comunidade')}
            className="mt-6 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-6 py-2 text-sm text-indigo-200 transition-colors hover:bg-indigo-500/30"
          >
            Voltar para a comunidade
          </button>
        </div>
      </SpacePageLayout>
    );
  }

  if (loadingState === 'error' || !profile) {
    return (
      <SpacePageLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl">⚠️</span>
          <h1 className="mt-4 text-xl font-semibold text-white">Erro ao carregar</h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-6 rounded-full border border-indigo-400/70 bg-indigo-500/20 px-6 py-2 text-sm text-indigo-200 transition-colors hover:bg-indigo-500/30"
          >
            Tentar novamente
          </button>
        </div>
      </SpacePageLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <SpacePageLayout>
      <div className="space-y-6">
        {/* Header com info principal */}
        <ProfileHeader
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          bio={profile.bio}
          lunarSign={profile.lunarSign}
          cosmicLevel={profile.cosmicLevel}
          cosmicPoints={profile.cosmicPoints}
          joinedAt={profile.joinedAt}
          streakDays={profile.streakDays}
          isOwnProfile={profile.isOwnProfile}
        >
          {!profile.isOwnProfile && (
            <FollowButton
              userId={profile.userId}
              isFollowing={profile.isFollowing}
              onFollowChange={handleFollowChange}
            />
          )}
          {profile.isOwnProfile && (
            <button
              onClick={() => router.push('/perfil')}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              Editar perfil
            </button>
          )}
        </ProfileHeader>

        {/* Stats */}
        <ProfileStats
          userId={profile.userId}
          postsCount={profile.stats.postsCount}
          followersCount={profile.stats.followersCount}
          followingCount={profile.stats.followingCount}
        />

        {/* Posts Recentes */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Posts recentes</h2>
          <ProfilePostGrid
            posts={posts}
            emptyMessage={
              profile.isOwnProfile
                ? 'Você ainda não publicou nenhum post. Que tal compartilhar algo com a comunidade?'
                : `${profile.displayName} ainda não publicou nenhum post.`
            }
          />
        </section>
      </div>
    </SpacePageLayout>
  );
}
