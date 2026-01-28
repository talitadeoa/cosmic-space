/**
 * Hook para gerenciar scroll automático para o final da conversa
 */
'use client';

import { useCallback } from 'react';

interface UseScrollToBottomProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollToBottom({ messagesContainerRef, messagesEndRef }: UseScrollToBottomProps) {
  return useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messagesContainerRef, messagesEndRef]);
}
