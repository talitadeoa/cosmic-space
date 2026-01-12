/**
 * Hook customizado para gerenciar estado do CosmosChatModal
 * Separa lógica de estado da UI
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage, ChatMessageMeta, loadChatHistory, saveChatHistory } from '@/lib/chatHistory';

interface UseChatStateProps {
  isOpen: boolean;
  storageKey: string;
  initialValue?: string;
  initialValueLabel?: string;
  systemGreeting?: string;
  systemQuestion?: string;
}

export function useChatState({
  isOpen,
  storageKey,
  initialValue,
  initialValueLabel,
  systemGreeting,
  systemQuestion,
}: UseChatStateProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metaDraft, setMetaDraft] = useState<ChatMessageMeta>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingAuthSave, setPendingAuthSave] = useState(false);
  const [showAuthNudge, setShowAuthNudge] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const authBypassRef = useRef(false);

  const persistMessages = useCallback(
    (next: ChatMessage[]) => {
      setMessages(next);
      saveChatHistory(storageKey, next);
    },
    [storageKey]
  );

  const buildSubmitValue = useCallback((messagesToSubmit: ChatMessage[], submitStrategy: 'concat' | 'last') => {
    const userMessages = messagesToSubmit
      .filter((message) => message.role === 'user')
      .map((message) => message.content);
    if (!userMessages.length) return '';
    if (submitStrategy === 'last') {
      return userMessages[userMessages.length - 1] ?? '';
    }
    return userMessages.join('\n\n');
  }, []);

  const getLastUserMeta = useCallback((messagesToSearch: ChatMessage[]) => {
    for (let i = messagesToSearch.length - 1; i >= 0; i -= 1) {
      if (messagesToSearch[i].role === 'user') {
        return messagesToSearch[i].meta;
      }
    }
    return undefined;
  }, []);

  const handleClearMeta = useCallback((key: keyof ChatMessageMeta) => {
    setMetaDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const pushSystemMessage = useCallback(
    (content: string) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'system',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, systemMessage];
        saveChatHistory(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  // Initialize messages on open
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setSubmitError(null);
      setIsSaving(false);
      setShowAuthPrompt(false);
      setPendingAuthSave(false);
      setShowAuthNudge(false);
      setMetaDraft({});
      authBypassRef.current = false;
      return;
    }

    const stored = loadChatHistory(storageKey);
    if (stored.length > 0) {
      setMessages(stored);
      return;
    }

    const seed: ChatMessage[] = [];
    if (systemGreeting) {
      seed.push({
        id: 'greeting',
        role: 'system',
        content: systemGreeting,
        timestamp: new Date().toISOString(),
      });
    }

    if (initialValue?.trim()) {
      const label = initialValueLabel ? ` (${initialValueLabel})` : '';
      seed.push({
        id: 'saved',
        role: 'system',
        content: `💾 Registro anterior${label}:\n\n"${initialValue.trim()}"`,
        timestamp: new Date().toISOString(),
      });
    }

    if (systemQuestion) {
      seed.push({
        id: 'question',
        role: 'system',
        content: systemQuestion,
        timestamp: new Date().toISOString(),
      });
    }

    persistMessages(seed);
    setMetaDraft({});
  }, [initialValue, initialValueLabel, isOpen, storageKey, systemGreeting, systemQuestion, persistMessages]);

  return {
    inputValue,
    setInputValue,
    messages,
    setMessages,
    metaDraft,
    setMetaDraft,
    submitError,
    setSubmitError,
    isSaving,
    setIsSaving,
    showAuthPrompt,
    setShowAuthPrompt,
    pendingAuthSave,
    setPendingAuthSave,
    showAuthNudge,
    setShowAuthNudge,
    messagesEndRef,
    messagesContainerRef,
    authBypassRef,
    persistMessages,
    buildSubmitValue,
    getLastUserMeta,
    handleClearMeta,
    pushSystemMessage,
  };
}
