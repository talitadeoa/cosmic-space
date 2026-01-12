/**
 * Hook para gerenciar interações do usuário na comunidade
 * Responsável por: salvar posts, reações, comentários
 */

import { useState, useCallback } from 'react';
import type { CommunityComment } from '@/types/community';

export type CommentPreviewState = {
  status: 'idle' | 'loading' | 'error' | 'success';
  comments: CommunityComment[];
};

export const useCommunityInteractions = () => {
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [reactions, setReactions] = useState<Record<string, { energia: number; apoio: number }>>({});
  const [commentStatus, setCommentStatus] = useState<Record<string, 'idle' | 'saving' | 'error'>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentError, setCommentError] = useState<Record<string, string>>({});
  const [commentPreviews, setCommentPreviews] = useState<Record<string, CommentPreviewState>>({});

  // Toggle save
  const toggleSave = useCallback((postId: string) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }, []);

  // Adicionar reação
  const addReaction = useCallback((postId: string, type: 'energia' | 'apoio') => {
    setReactions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId] || { energia: 0, apoio: 0 },
        [type]: (prev[postId]?.[type] ?? 0) + 1,
      },
    }));
  }, []);

  // Mudar valor de comentário
  const handleCommentChange = useCallback((postId: string, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
    setCommentError((prev) => ({
      ...prev,
      [postId]: '',
    }));
  }, []);

  // Carregar preview de comentários
  const loadCommentPreview = useCallback(async (postId: string) => {
    setCommentPreviews((prev) => ({
      ...prev,
      [postId]: { status: 'loading', comments: [] },
    }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments?limit=3`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao carregar comentários');
      }

      setCommentPreviews((prev) => ({
        ...prev,
        [postId]: {
          status: 'success',
          comments: Array.isArray(data?.comments) ? data.comments : [],
        },
      }));
    } catch {
      setCommentPreviews((prev) => ({
        ...prev,
        [postId]: { status: 'error', comments: [] },
      }));
    }
  }, []);

  // Enviar comentário
  const submitComment = useCallback(async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const body = commentInputs[postId]?.trim();

    if (!body) {
      setCommentError((prev) => ({
        ...prev,
        [postId]: 'Comentário não pode estar vazio',
      }));
      return;
    }

    setCommentStatus((prev) => ({
      ...prev,
      [postId]: 'saving',
    }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao enviar comentário');
      }

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: '',
      }));

      setCommentStatus((prev) => ({
        ...prev,
        [postId]: 'idle',
      }));

      // Recarregar preview
      await loadCommentPreview(postId);
    } catch {
      setCommentStatus((prev) => ({
        ...prev,
        [postId]: 'error',
      }));
      setCommentError((prev) => ({
        ...prev,
        [postId]: 'Erro ao enviar comentário',
      }));
    }
  }, [commentInputs, loadCommentPreview]);

  return {
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
  };
};
