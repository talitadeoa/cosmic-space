/**
 * Hook customizado para gerenciar envio e submissão de mensagens
 */
'use client';

import { useCallback } from 'react';
import { ChatMessage, ChatMessageMeta, saveChatHistory } from '@/lib/chatHistory';

interface UseMessageSubmitProps {
  storageKey: string;
  submitStrategy: 'concat' | 'last';
  resetOnSubmit: boolean;
  closeOnSubmit: boolean;
  submitOnSend: boolean;
  systemResponses: string[];
  requiresAuthOnSave: boolean;
  allowUnauthedSubmit: boolean;
  isAuthenticated: boolean;
  onSubmit: (value: string, messages: ChatMessage[], meta?: ChatMessageMeta) => Promise<void>;
  onClose: () => void;
}

export function useMessageSubmit({
  storageKey,
  submitStrategy,
  resetOnSubmit,
  closeOnSubmit,
  submitOnSend,
  systemResponses,
  requiresAuthOnSave,
  allowUnauthedSubmit,
  isAuthenticated,
  onSubmit,
  onClose,
}: UseMessageSubmitProps) {
  const buildUserMessage = useCallback((content: string): ChatMessage => ({
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  }), []);

  const buildSystemMessage = useCallback((id: string, content: string): ChatMessage => ({
    id,
    role: 'system',
    content,
    timestamp: new Date().toISOString(),
  }), []);

  const buildSubmitValue = useCallback(
    (messages: ChatMessage[]): string => {
      const userMessages = messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content);
      if (!userMessages.length) return '';
      if (submitStrategy === 'last') {
        return userMessages[userMessages.length - 1] ?? '';
      }
      return userMessages.join('\n\n');
    },
    [submitStrategy]
  );

  const getLastUserMeta = useCallback((messages: ChatMessage[]): ChatMessageMeta | undefined => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        return messages[i].meta;
      }
    }
    return undefined;
  }, []);

  const submitMessages = useCallback(
    async (
      value: string,
      messages: ChatMessage[],
      meta: ChatMessageMeta | undefined,
      setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void,
      setSubmitError: (error: string | null) => void,
      setIsSaving: (saving: boolean) => void,
      setInputValue: (value: string) => void,
      setMetaDraft: (meta: ChatMessageMeta) => void,
      setShowAuthPrompt: (show: boolean) => void,
      setShowAuthNudge: (show: boolean) => void,
      setPendingAuthSave: (pending: boolean) => void,
      authBypassRef: React.MutableRefObject<boolean>,
      pushSystemMessage: (content: string) => void,
      authNudgeMessage: string
    ): Promise<boolean> => {
      if (value.trim().length < 3) {
        setSubmitError('Escreva pelo menos 3 caracteres para salvar.');
        return false;
      }

      const shouldNudgeAuth = allowUnauthedSubmit && !isAuthenticated && !authBypassRef.current;

      if (requiresAuthOnSave && !isAuthenticated && !authBypassRef.current && !allowUnauthedSubmit) {
        setShowAuthPrompt(true);
        setPendingAuthSave(true);
        return false;
      }

      setIsSaving(true);
      setSubmitError(null);

      try {
        await onSubmit(value, messages, meta ?? getLastUserMeta(messages));
        if (shouldNudgeAuth) {
          pushSystemMessage(authNudgeMessage);
          setShowAuthNudge(true);
          return true;
        }
        if (resetOnSubmit) {
          setMessages(() => []);
          saveChatHistory(storageKey, []);
          setInputValue('');
          setMetaDraft({});
          setSubmitError(null);
        }
        if (closeOnSubmit) {
          onClose();
        }
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar.';
        const normalized = message.toLowerCase();
        if (
          normalized.includes('não autenticado') ||
          normalized.includes('nao autenticado') ||
          normalized.includes('não autorizado') ||
          normalized.includes('nao autorizado') ||
          normalized.includes('unauthorized')
        ) {
          authBypassRef.current = false;
          setShowAuthPrompt(true);
          setSubmitError(null);
          return false;
        }
        setSubmitError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [requiresAuthOnSave, allowUnauthedSubmit, isAuthenticated, onSubmit, onClose, resetOnSubmit, closeOnSubmit, storageKey, getLastUserMeta]
  );

  return {
    buildUserMessage,
    buildSystemMessage,
    buildSubmitValue,
    getLastUserMeta,
    submitMessages,
  };
}
