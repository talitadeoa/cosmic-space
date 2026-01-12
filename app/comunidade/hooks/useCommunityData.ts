/**
 * Hook para gerenciar estado de dados da comunidade
 * Responsável por: carregar posts, perfil, state de carregamento
 */

import { useCallback, useEffect, useState } from 'react';
import type { CommunityComment, CommunityPost } from '@/types/community';

export interface CommunityProfile {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

export const useCommunityData = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [searchError, setSearchError] = useState('');
  const [profile, setProfile] = useState<CommunityProfile>({
    displayName: '',
    avatarUrl: '',
    bio: '',
  });

  // Carregar posts de uma API
  const loadPosts = useCallback(async (query?: string) => {
    try {
      const encodedQuery = query ? `&q=${encodeURIComponent(query)}` : '';
      const response = await fetch(`/api/community/posts?limit=6${encodedQuery}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao buscar posts');
      }
      const apiPosts = Array.isArray(data?.posts) ? data.posts : [];
      return apiPosts;
    } catch (error) {
      throw error;
    }
  }, []);

  // Inicializar dados (posts + profile)
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

  // Buscar posts com query
  const handleSearch = useCallback(async (query: string) => {
    setSearchStatus('searching');
    setSearchError('');
    try {
      const results = await loadPosts(query.trim());
      setPosts(results);
      setSearchQuery(query);
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
      setSearchError('Não foi possível buscar.');
    }
  }, [loadPosts]);

  // Limpar busca
  const clearSearch = useCallback(async () => {
    setSearchQuery('');
    setSearchStatus('searching');
    try {
      const results = await loadPosts('');
      setPosts(results);
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
    }
  }, [loadPosts]);

  // Retry no caso de erro
  const handleRetry = useCallback(async () => {
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
  }, [loadPosts]);

  return {
    posts,
    setPosts,
    loadingState,
    searchQuery,
    searchStatus,
    searchError,
    profile,
    handleSearch,
    clearSearch,
    handleRetry,
  };
};
