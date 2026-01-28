/**
 * Hook para gerenciar estado de dados da comunidade
 * Responsável por: carregar posts, perfil, state de carregamento
 * 
 * Refatorado para usar cache compartilhado (useCommunityCache)
 * Reduz edge requests ao deduplicar requisições com mesma query
 */

import { useCallback, useState } from 'react';
import { useCommunityPosts, useCommunityProfile, invalidateCommunityCache } from '@/hooks/useCommunityCache';

export interface CommunityProfile {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

export const useCommunityData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [searchError, setSearchError] = useState('');

  // Carregar posts com cache (sem query inicialmente)
  const {
    data: posts = [],
    isLoading: postsLoading,
    error: postsError,
    mutate: refetchPosts,
  } = useCommunityPosts(6, undefined, { ttl: 300000 });

  // Carregar perfil com cache (TTL 30 min)
  const {
    data: profileData,
    isLoading: profileLoading,
  } = useCommunityProfile({ ttl: 1800000 });

  const profile: CommunityProfile = profileData || {
    displayName: '',
    avatarUrl: '',
    bio: '',
  };

  // Determinar estado de carregamento geral
  const loadingState: LoadingState =
    postsLoading || profileLoading
      ? 'loading'
      : postsError
        ? 'error'
        : 'success';

  // Buscar posts com query
  const handleSearch = useCallback(async (query: string) => {
    setSearchStatus('searching');
    setSearchError('');
    
    try {
      // Invalidar cache antigo e fazer fetch com nova query
      const trimmedQuery = query.trim();
      invalidateCommunityCache(`community-posts:6:${trimmedQuery}`);
      setSearchQuery(trimmedQuery);
      setSearchStatus('idle');
    } catch (err) {
      setSearchStatus('error');
      setSearchError('Não foi possível buscar.');
    }
  }, []);

  // Limpar busca
  const clearSearch = useCallback(async () => {
    setSearchQuery('');
    setSearchStatus('searching');
    try {
      invalidateCommunityCache('community-posts:6');
      setSearchStatus('idle');
    } catch {
      setSearchStatus('error');
    }
  }, []);

  // Retry no caso de erro
  const handleRetry = useCallback(async () => {
    try {
      // Invalidar e refazer requisição
      invalidateCommunityCache(searchQuery ? `community-posts:6:${searchQuery}` : 'community-posts:6');
      invalidateCommunityCache('community-profile');
      await refetchPosts();
    } catch {
      // Erro já tratado por hooks internos
    }
  }, [searchQuery, refetchPosts]);

  return {
    posts,
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
