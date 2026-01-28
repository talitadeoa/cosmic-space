/**
 * Hook para gerenciar filtros da comunidade
 * Responsável por: filtros de tipo e tag, posts visíveis
 */

import { useMemo, useState } from 'react';
import type { CommunityPost } from '@/types/community';

export type PostType = 'Todos' | 'Pulso' | 'Carta' | 'Evento';

export const classifyPost = (post: CommunityPost): PostType => {
  const normalizedTags = post.tags.map((tag) => tag.toLowerCase());
  if (normalizedTags.some((tag) => ['evento', 'eventos', 'lua'].includes(tag))) {
    return 'Evento';
  }
  if (post.body.length > 220 || normalizedTags.includes('cartas')) {
    return 'Carta';
  }
  return 'Pulso';
};

export const useCommunityFilters = (posts: CommunityPost[] | null) => {
  const [activeTag, setActiveTag] = useState('Todos');
  const [activeType, setActiveType] = useState<PostType>('Todos');

  // Gerar lista de tags disponíveis
  const tagFilters = useMemo(() => {
    const tagSet = new Set<string>();
    posts?.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
    return ['Todos', ...Array.from(tagSet)];
  }, [posts]);

  // Filtrar posts baseado em tags e tipos
  const visiblePosts = useMemo(() => {
    let filtered = posts || [];
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

  const resetFilters = () => {
    setActiveTag('Todos');
    setActiveType('Todos');
  };

  return {
    activeTag,
    setActiveTag,
    activeType,
    setActiveType,
    tagFilters,
    visiblePosts,
    featuredPost,
    feedPosts,
    resetFilters,
  };
};
