'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InputWindow from './InputWindow';
import { ChatMessage, ChatMessageMeta } from '@/lib/chatHistory';
import { useAuth } from '@/hooks/useAuth';
import { useAuthChatFlow } from '@/components/auth/AuthChatFlow';
import { useBrainstormSession } from '@/hooks/useBrainstormSession';
import { BrainstormPanel } from '@/components/brainstorm';
import { useChatState } from './chat/useChatState';
import { ChatHeader, ChatMessages, ChatComposer } from './chat/ChatComponents';
import { toneStyles } from './chat/chatConstants';
import type { Tone } from './chat/chatConstants';
import { CosmosChatModalProps } from './chat/types';

export default function CosmosChatModal({
  isOpen,
  inline = false,
  storageKey,
  title,
  eyebrow,
  subtitle,
  badge,
  placeholder,
  systemGreeting,
  systemQuestion,
  initialValue,
  initialValueLabel,
  submitLabel = '✨ Concluir e Salvar',
  tone = 'indigo',
  systemResponses = [],
  submitStrategy = 'concat',
  resetOnSubmit = false,
  closeOnSubmit = true,
  submitOnSend = false,
  windowClassName = '',
  requiresAuthOnSave = false,
  allowUnauthedSubmit = false,
  authNudgeMessage = 'Se deseja salvar no servidor, entre ou crie sua conta.',
  enableBrainstorm = false,
  onClose,
  onSubmit,
  headerExtra,
  contextTitle,
  contextEntries = [],
  suggestions = [],
}: CosmosChatModalProps) {
  const { isAuthenticated, verifyAuth } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Chat state
  const {
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
  } = useChatState({
    isOpen,
    storageKey,
    initialValue,
    initialValueLabel,
    systemGreeting,
    systemQuestion,
  });

  // Auth flow
  const {
    messages: authMessages,
    step: authStep,
    stepSuggestions: authSuggestions,
    isSubmitting: isAuthSubmitting,
    isAuthenticated: isAuthComplete,
    loading: isAuthLoading,
    handleUserInput: handleAuthInput,
    resetAll: resetAuthFlow,
  } = useAuthChatFlow({ isActive: showAuthPrompt, onAuthenticated: handleAuthComplete });

  // Brainstorm
  const brainstorm = useBrainstormSession(`${storageKey}-brainstorm`);
  const [showBrainstormPanel, setShowBrainstormPanel] = useState(false);

  const styles = toneStyles[tone];
  const authInputLocked = isAuthSubmitting || isAuthLoading || isAuthComplete;
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === 'user'),
    [messages]
  );
  const userMessageCount = useMemo(
    () => messages.filter((message) => message.role === 'user').length,
    [messages]
  );

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messagesContainerRef, messagesEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, authMessages, showAuthPrompt, scrollToBottom]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      authBypassRef.current = false;
      setShowAuthNudge(false);
    }
  }, [isAuthenticated, authBypassRef, setShowAuthNudge]);

  useEffect(() => {
    if (!showAuthPrompt) {
      resetAuthFlow();
    }
  }, [showAuthPrompt, resetAuthFlow]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (inline || !isOpen || typeof document === 'undefined') return;

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const previousHtmlOverflow = htmlElement.style.overflow;
    const previousBodyOverflow = bodyElement.style.overflow;
    const previousPaddingRight = htmlElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - htmlElement.clientWidth;

    htmlElement.style.overflow = 'hidden';
    bodyElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      htmlElement.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      htmlElement.style.overflow = previousHtmlOverflow;
      bodyElement.style.overflow = previousBodyOverflow;
      htmlElement.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen, inline]);

  // Handlers
  function handleAuthComplete() {
    void verifyAuth({ silent: true });
    authBypassRef.current = true;
    setShowAuthPrompt(false);
    const shouldSave = pendingAuthSave && !isSaving;
    if (shouldSave) {
      setPendingAuthSave(false);
      setTimeout(() => {
        void handleSave();
      }, 0);
      return;
    }
    setPendingAuthSave(false);
  }

  async function handleAuthSend(value: string) {
    const didSend = await handleAuthInput(value);
    if (didSend) {
      setInputValue('');
    }
  }

  function handleSendMessage() {
    const trimmed = inputValue.trim();
    if (trimmed.length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para enviar.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      meta: metaDraft.category || metaDraft.date || metaDraft.tags ? metaDraft : undefined,
    };
    
    setInputValue('');
    setMetaDraft({});
    setSubmitError(null);

    const nextMessages = [...messages, userMessage];
    persistMessages(nextMessages);

    // Brainstorm mode
    if (brainstorm.isActive && brainstorm.status === 'brainstorming') {
      brainstorm.addIdea(trimmed);
      window.setTimeout(() => {
        const brainstormResponse = brainstorm.consumePendingResponse();
        if (brainstormResponse) {
          const systemMessage: ChatMessage = {
            id: `brainstorm-${Date.now()}`,
            role: 'system',
            content: brainstormResponse,
            timestamp: new Date().toISOString(),
          };
          persistMessages([...nextMessages, systemMessage]);
        }
      }, 500);
      return;
    }

    if (submitOnSend) {
      const value = submitStrategy === 'last' ? userMessage.content : buildSubmitValue(nextMessages, submitStrategy);
      void submitMessages(value, nextMessages, userMessage.meta);
    }

    if (systemResponses.length > 0) {
      window.setTimeout(() => {
        const response = systemResponses[Math.floor(Math.random() * systemResponses.length)];
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: response,
          timestamp: new Date().toISOString(),
        };
        persistMessages([...nextMessages, systemMessage]);
      }, 700);
    }
  }

  async function submitMessages(value: string, messagesToSubmit: ChatMessage[], meta?: ChatMessageMeta) {
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
      await onSubmit(value, messagesToSubmit, meta ?? getLastUserMeta(messagesToSubmit));
      if (shouldNudgeAuth && !showAuthNudge) {
        pushSystemMessage(authNudgeMessage);
        setShowAuthNudge(true);
      }
      if (resetOnSubmit) {
        persistMessages([]);
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
  }

  async function handleSave() {
    const value = buildSubmitValue(messages, submitStrategy);
    await submitMessages(value, messages);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (showAuthPrompt) {
        void handleAuthSend(inputValue);
        return;
      }
      handleSendMessage();
    }
  }

  function handleSuggestionClick(
    suggestion: NonNullable<CosmosChatModalProps['suggestions']>[number]
  ) {
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
      setInputValue((prev) =>
        prev ? `${prev} ${suggestion.value}` : (suggestion.value as string)
      );
    }
    if (suggestion.meta) {
      const meta = suggestion.meta;
      setMetaDraft((prev) => ({
        ...prev,
        ...meta,
        tags: meta.tags ?? prev.tags,
      }));
    }
  }

  function handleToggleBrainstorm() {
    if (brainstorm.isActive) {
      setShowBrainstormPanel((prev) => !prev);
    } else {
      brainstorm.startSession(title);
      setShowBrainstormPanel(true);
      const welcomeResponse = brainstorm.consumePendingResponse();
      if (welcomeResponse) {
        const systemMessage: ChatMessage = {
          id: `brainstorm-welcome-${Date.now()}`,
          role: 'system',
          content: welcomeResponse,
          timestamp: new Date().toISOString(),
        };
        persistMessages([...messages, systemMessage]);
      }
    }
  }

  function handleEndBrainstorm() {
    const finalSession = brainstorm.endSession();
    setShowBrainstormPanel(false);
    if (finalSession?.summary) {
      const summaryMessage: ChatMessage = {
        id: `brainstorm-summary-${Date.now()}`,
        role: 'system',
        content: finalSession.summary,
        timestamp: new Date().toISOString(),
      };
      persistMessages([...messages, summaryMessage]);
    }
  }

  if (!isMounted) return null;

  const displayMessages = showAuthPrompt ? [...messages, ...authMessages] : messages;
  const composerPlaceholder = showAuthPrompt
    ? authStep === 'password'
      ? 'Digite sua senha...'
      : 'Digite sua resposta...'
    : placeholder;
  const composerInputType = showAuthPrompt
    ? authStep === 'password'
      ? 'password'
      : authStep === 'email'
        ? 'email'
        : 'text'
    : 'text';
  const composerAutoComplete = showAuthPrompt
    ? authStep === 'email'
      ? 'email'
      : authStep === 'password'
        ? 'current-password'
        : undefined
    : undefined;
  const composerInputName = showAuthPrompt
    ? authStep === 'email'
      ? 'email'
      : authStep === 'password'
        ? 'password'
        : undefined
    : undefined;
  const authNudgeSuggestions =
    !showAuthPrompt && showAuthNudge
      ? [{ id: 'auth-cta', label: 'Entrar ou criar conta', action: 'auth' as const, tone: 'amber' as Tone }]
      : [];
  const composerSuggestions = showAuthPrompt
    ? authSuggestions.map((suggestion) => ({ ...suggestion, tone }))
    : [...authNudgeSuggestions, ...(suggestions ?? [])];
  const composerInputDisabled = showAuthPrompt ? authInputLocked : false;

  function handleComposerSend() {
    if (showAuthPrompt) {
      void handleAuthSend(inputValue);
      return;
    }
    handleSendMessage();
  }

  const chatWindow = (
    <InputWindow
      variant="glass"
      size={inline ? 'sm' : 'md'}
      radius="lg"
      showAccent
      className={`flex flex-col relative ${inline ? 'w-full max-h-[420px] overflow-auto' : 'h-[600px]'} ${brainstorm.isActive && showBrainstormPanel ? 'pr-80' : ''} ${windowClassName}`}
    >
      {!inline && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white z-20"
          aria-label="Fechar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <ChatHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        badge={badge}
        headerExtra={headerExtra}
        inline={inline}
        styles={styles}
        enableBrainstorm={enableBrainstorm}
        isBrainstormActive={brainstorm.isActive}
        onToggleBrainstorm={handleToggleBrainstorm}
      />
      
      {enableBrainstorm && (
        <BrainstormPanel
          isOpen={showBrainstormPanel && brainstorm.isActive}
          status={brainstorm.status}
          ideas={brainstorm.ideas}
          clusters={brainstorm.clusters}
          stats={brainstorm.stats}
          onToggleKeyIdea={brainstorm.toggleKeyIdea}
          onCreateCluster={brainstorm.createCluster}
          onStartOrganizing={() => {
            brainstorm.startOrganizing();
            const response = brainstorm.consumePendingResponse();
            if (response) {
              const systemMessage: ChatMessage = {
                id: `brainstorm-organize-${Date.now()}`,
                role: 'system',
                content: response,
                timestamp: new Date().toISOString(),
              };
              persistMessages([...messages, systemMessage]);
            }
          }}
          onGenerateSummary={() => {
            const summary = brainstorm.generateSummary();
            if (summary) {
              const systemMessage: ChatMessage = {
                id: `brainstorm-summary-${Date.now()}`,
                role: 'system',
                content: summary,
                timestamp: new Date().toISOString(),
              };
              persistMessages([...messages, systemMessage]);
            }
          }}
          onEndSession={handleEndBrainstorm}
          onClose={() => setShowBrainstormPanel(false)}
        />
      )}

      {!showAuthPrompt && contextEntries.length > 0 && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-200/80 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold uppercase tracking-[0.18em] text-[0.65rem] text-slate-200/80">
              {contextTitle ?? 'Inputs conectados'}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {contextEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] text-slate-100"
              >
                <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                  {entry.label}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-xs text-slate-100/90">
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChatMessages
        messages={displayMessages}
        styles={styles}
        inline={inline}
        containerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
      />

      {hasUserMessage && !inline && !showAuthPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/10 px-2 py-2 text-center text-xs text-slate-400"
        >
          {userMessageCount} mensagem{userMessageCount !== 1 ? 's' : ''} registrada
          {userMessageCount !== 1 ? 's' : ''}
        </motion.div>
      )}

      <ChatComposer
        inputValue={inputValue}
        setInputValue={setInputValue}
        onKeyDown={handleKeyDown}
        onSend={handleComposerSend}
        onSave={handleSave}
        placeholder={composerPlaceholder}
        inputType={composerInputType}
        inputAutoComplete={composerAutoComplete}
        inputName={composerInputName}
        minInputLength={showAuthPrompt ? 1 : 3}
        submitLabel={submitLabel}
        inline={inline}
        styles={styles}
        isSaving={isSaving}
        hasUserMessage={hasUserMessage}
        submitError={submitError}
        suggestions={composerSuggestions}
        metaDraft={metaDraft}
        onSuggestionClick={handleSuggestionClick}
        onClearMeta={handleClearMeta}
        isInputDisabled={composerInputDisabled}
        isAuthFlowActive={showAuthPrompt}
      />
    </InputWindow>
  );

  if (inline) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="w-full overflow-visible"
          >
            {chatWindow}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex w-full max-w-2xl flex-col gap-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {chatWindow}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
