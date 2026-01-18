/**
 * Hook para gerenciar todos os handlers do CosmosChatModal
 */
'use client';

import { useCallback } from 'react';
import { ChatMessage, ChatMessageMeta, saveChatHistory } from '@/lib/chatHistory';
import type { CosmosChatModalProps } from './types';

const buildSystemMessage = (id: string, content: string): ChatMessage => ({
  id,
  role: 'system',
  content,
  timestamp: new Date().toISOString(),
});

interface UseCosmosChatHandlersProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  messages: ChatMessage[];
  metaDraft: ChatMessageMeta;
  setMetaDraft: React.Dispatch<React.SetStateAction<ChatMessageMeta>>;
  setSubmitError: (error: string | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsSaving: (saving: boolean) => void;
  showAuthPrompt: boolean;
  setShowAuthPrompt: (show: boolean) => void;
  setPendingAuthSave: (pending: boolean) => void;
  authBypassRef: React.MutableRefObject<boolean>;
  storageKey: string;
  submitStrategy: 'concat' | 'last';
  submitOnSend: boolean;
  systemResponses: string[];
  authNudgeMessage: string;
  buildUserMessage: (content: string) => ChatMessage;
  buildSubmitValue: (messages: ChatMessage[]) => string;
  persistMessages: (messages: ChatMessage[]) => void;
  pushSystemMessage: (content: string) => void;
  submitMessages: (...args: any[]) => Promise<boolean>;
  getLastUserMeta: (messages: ChatMessage[]) => ChatMessageMeta | undefined;
  handleAuthInput: (value: string) => Promise<boolean>;
  brainstormIsActive: boolean;
  brainstormStatus: string;
  brainstormAddIdea: (idea: string) => void;
  brainstormProcessResponse: () => void;
}

export function useCosmosChatHandlers(props: UseCosmosChatHandlersProps) {
  const {
    inputValue,
    setInputValue,
    messages,
    metaDraft,
    setMetaDraft,
    setSubmitError,
    setMessages,
    setIsSaving,
    showAuthPrompt,
    setShowAuthPrompt,
    setPendingAuthSave,
    authBypassRef,
    storageKey,
    submitStrategy,
    submitOnSend,
    systemResponses,
    authNudgeMessage,
    buildUserMessage,
    buildSubmitValue,
    persistMessages,
    pushSystemMessage,
    submitMessages,
    getLastUserMeta,
    handleAuthInput,
    brainstormIsActive,
    brainstormStatus,
    brainstormAddIdea,
    brainstormProcessResponse,
  } = props;

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para enviar.');
      return;
    }

    const userMessage: ChatMessage = {
      ...buildUserMessage(trimmed),
      meta: metaDraft.category || metaDraft.date || metaDraft.tags ? metaDraft : undefined,
    };
    setInputValue('');
    setMetaDraft({});
    setSubmitError(null);

    const nextMessages = [...messages, userMessage];
    persistMessages(nextMessages);

    // Handle brainstorm mode
    if (brainstormIsActive && brainstormStatus === 'brainstorming') {
      brainstormAddIdea(trimmed);
      brainstormProcessResponse();
      return;
    }

    // Handle submitOnSend
    if (submitOnSend) {
      const value = submitStrategy === 'last' ? userMessage.content : buildSubmitValue(nextMessages);
      void submitMessages(
        value,
        nextMessages,
        userMessage.meta,
        setMessages,
        setSubmitError,
        setIsSaving,
        setInputValue,
        setMetaDraft,
        setShowAuthPrompt,
        setPendingAuthSave,
        authBypassRef,
        pushSystemMessage,
        authNudgeMessage
      );
    }

    // Add system responses
    if (systemResponses.length > 0) {
      window.setTimeout(() => {
        const response = systemResponses[Math.floor(Math.random() * systemResponses.length)];
        const systemMessage = buildSystemMessage(`system-${Date.now()}`, response);
        setMessages((prev) => {
          const next = [...prev, systemMessage];
          saveChatHistory(storageKey, next);
          return next;
        });
      }, 700);
    }
  }, [
    inputValue,
    setSubmitError,
    buildUserMessage,
    metaDraft,
    setInputValue,
    setMetaDraft,
    messages,
    persistMessages,
    brainstormIsActive,
    brainstormStatus,
    brainstormAddIdea,
    brainstormProcessResponse,
    submitOnSend,
    submitStrategy,
    buildSubmitValue,
    submitMessages,
    setMessages,
    setIsSaving,
    setShowAuthPrompt,
    setPendingAuthSave,
    authBypassRef,
    pushSystemMessage,
    authNudgeMessage,
    systemResponses,
    storageKey,
  ]);

  const handleAuthSend = useCallback(
    async (value: string) => {
      const didSend = await handleAuthInput(value);
      if (didSend) {
        setInputValue('');
      }
    },
    [handleAuthInput, setInputValue]
  );

  const handleSave = useCallback(async () => {
    const value = buildSubmitValue(messages);
    await submitMessages(
      value,
      messages,
      getLastUserMeta(messages),
      setMessages,
      setSubmitError,
      setIsSaving,
      setInputValue,
      setMetaDraft,
      setShowAuthPrompt,
      setPendingAuthSave,
      authBypassRef,
      pushSystemMessage,
      authNudgeMessage
    );
  }, [
    buildSubmitValue,
    messages,
    submitMessages,
    getLastUserMeta,
    setMessages,
    setSubmitError,
    setIsSaving,
    setInputValue,
    setMetaDraft,
    setShowAuthPrompt,
    setPendingAuthSave,
    authBypassRef,
    pushSystemMessage,
    authNudgeMessage,
  ]);

  const handleSuggestionClick = useCallback(
    (suggestion: NonNullable<CosmosChatModalProps['suggestions']>[number]) => {
      if (showAuthPrompt) {
        const value = suggestion.value ?? suggestion.label;
        void handleAuthSend(value);
        return;
      }
      if (suggestion.action === 'auth') {
        setShowAuthPrompt(true);
        setPendingAuthSave(false);
        return;
      }
      if (suggestion.value) {
        const newValue = inputValue ? `${inputValue} ${suggestion.value}` : suggestion.value;
        setInputValue(newValue);
      }
      if (suggestion.meta) {
        setMetaDraft((prev) => ({
          ...prev,
          ...suggestion.meta,
          tags: suggestion.meta?.tags ?? prev.tags,
        }));
      }
    },
    [showAuthPrompt, handleAuthSend, setShowAuthPrompt, setPendingAuthSave, setInputValue, setMetaDraft]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (showAuthPrompt) {
          void handleAuthSend(inputValue);
          return;
        }
        handleSendMessage();
      }
    },
    [showAuthPrompt, handleAuthSend, inputValue, handleSendMessage]
  );

  const handleComposerSend = useCallback(() => {
    if (showAuthPrompt) {
      void handleAuthSend(inputValue);
      return;
    }
    handleSendMessage();
  }, [showAuthPrompt, handleAuthSend, inputValue, handleSendMessage]);

  return {
    handleSendMessage,
    handleAuthSend,
    handleSave,
    handleSuggestionClick,
    handleKeyDown,
    handleComposerSend,
  };
}
