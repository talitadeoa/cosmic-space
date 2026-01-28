/**
 * Hook para integração do Brainstorm com o chat
 */
'use client';

import { useCallback, useState } from 'react';
import { ChatMessage, saveChatHistory } from '@/lib/chatHistory';
import { useBrainstormSession } from '@/hooks/useBrainstormSession';

const buildSystemMessage = (id: string, content: string): ChatMessage => ({
  id,
  role: 'system',
  content,
  timestamp: new Date().toISOString(),
});

interface UseBrainstormIntegrationProps {
  storageKey: string;
  title: string;
  enabled: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useBrainstormIntegration({
  storageKey,
  title,
  enabled,
  setMessages,
}: UseBrainstormIntegrationProps) {
  const [showPanel, setShowPanel] = useState(false);
  const brainstorm = useBrainstormSession(`${storageKey}-brainstorm`);

  const addSystemMessage = useCallback(
    (messageId: string, content: string) => {
      const systemMessage = buildSystemMessage(messageId, content);
      setMessages((prev) => {
        const next = [...prev, systemMessage];
        saveChatHistory(storageKey, next);
        return next;
      });
    },
    [setMessages, storageKey]
  );

  const handleToggle = useCallback(() => {
    if (brainstorm.isActive) {
      setShowPanel((prev) => !prev);
    } else {
      brainstorm.startSession(title);
      setShowPanel(true);

      const welcomeResponse = brainstorm.consumePendingResponse();
      if (welcomeResponse) {
        addSystemMessage(`brainstorm-welcome-${Date.now()}`, welcomeResponse);
      }
    }
  }, [brainstorm, title, addSystemMessage]);

  const handleEnd = useCallback(() => {
    const finalSession = brainstorm.endSession();
    setShowPanel(false);

    if (finalSession?.summary) {
      addSystemMessage(`brainstorm-summary-${Date.now()}`, finalSession.summary);
    }
  }, [brainstorm, addSystemMessage]);

  const handleStartOrganizing = useCallback(() => {
    brainstorm.startOrganizing();
    const response = brainstorm.consumePendingResponse();
    if (response) {
      addSystemMessage(`brainstorm-organize-${Date.now()}`, response);
    }
  }, [brainstorm, addSystemMessage]);

  const handleGenerateSummary = useCallback(() => {
    const summary = brainstorm.generateSummary();
    if (summary) {
      addSystemMessage(`brainstorm-summary-${Date.now()}`, summary);
    }
  }, [brainstorm, addSystemMessage]);

  const processIdeaResponse = useCallback(() => {
    window.setTimeout(() => {
      const response = brainstorm.consumePendingResponse();
      if (response) {
        addSystemMessage(`brainstorm-${Date.now()}`, response);
      }
    }, 500);
  }, [brainstorm, addSystemMessage]);

  return {
    showPanel: enabled && showPanel,
    isActive: brainstorm.isActive,
    status: brainstorm.status,
    ideas: brainstorm.ideas,
    clusters: brainstorm.clusters,
    stats: brainstorm.stats,
    addIdea: brainstorm.addIdea,
    toggleKeyIdea: brainstorm.toggleKeyIdea,
    createCluster: brainstorm.createCluster,
    handleToggle,
    handleEnd,
    handleStartOrganizing,
    handleGenerateSummary,
    processIdeaResponse,
    setShowPanel,
  };
}
