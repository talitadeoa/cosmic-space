/**
 * Hook para gerenciar o formulário de novo post
 * Responsável por: estado do form, submissão, validação
 */

import { useState, useCallback, FormEvent } from 'react';

export interface PostFormState {
  title: string;
  body: string;
  tags: string;
  images: string;
}

export type PostStatus = 'idle' | 'saving' | 'saved' | 'error';

export const usePostForm = () => {
  const [postForm, setPostForm] = useState<PostFormState>({
    title: '',
    body: '',
    tags: '',
    images: '',
  });
  const [postStatus, setPostStatus] = useState<PostStatus>('idle');
  const [postError, setPostError] = useState('');

  // Atualizar campo do form
  const handlePostChange = useCallback((field: keyof PostFormState, value: string) => {
    setPostForm((prev) => ({ ...prev, [field]: value }));
    setPostStatus('idle');
    setPostError('');
  }, []);

  // Adicionar tag
  const handleAddTag = useCallback((tag: string) => {
    setPostStatus('idle');
    setPostError('');
    setPostForm((prev) => {
      const existing = prev.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (existing.some((item) => item.toLowerCase() === tag.toLowerCase())) {
        return prev;
      }
      return { ...prev, tags: [...existing, tag].join(', ') };
    });
  }, []);

  // Enviar post
  const submitPost = useCallback(async (event: FormEvent) => {
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

      setPostForm({ title: '', body: '', tags: '', images: '' });
      setPostStatus('saved');

      // Reseta status após 2s
      setTimeout(() => setPostStatus('idle'), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar post';
      setPostError(errorMessage);
      setPostStatus('error');
    }
  }, [postForm]);

  const resetForm = useCallback(() => {
    setPostForm({ title: '', body: '', tags: '', images: '' });
    setPostStatus('idle');
    setPostError('');
  }, []);

  return {
    postForm,
    postStatus,
    postError,
    handlePostChange,
    handleAddTag,
    submitPost,
    resetForm,
  };
};
