'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Chat modules
import { ChatHeader, ChatMessages, ChatComposer } from './chat/ChatComponents';
import { ContextEntries, MessageCounter, CloseButton } from './chat/ChatSubComponents';
import { toneStyles } from './chat/chatConstants';
import type { CosmosChatModalProps } from './chat/types';
import { useChatState } from './chat/useChatState';
import { useMessageSubmit } from './chat/useMessageSubmit';
import { useBrainstormIntegration } from './chat/useBrainstormIntegration';
import { useCosmosChatHandlers } from './chat/useCosmosChatHandlers';
import { useScrollToBottom } from './chat/useScrollToBottom';
import { computeComposerProps } from './chat/computeComposerProps';

// Components
import InputWindow from './InputWindow';
import { useAuth } from '@/hooks/useAuth';
import { useAuthChatFlow } from '@/components/auth/AuthChatFlow';
import { BrainstormPanel } from '@/app/cosmos/brainstorm';

// ============================================================================
// Effects Hooks
// ============================================================================

function useBodyScrollLock(isOpen: boolean, inline: boolean) {
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
}

function useAuthEffects(
  isAuthenticated: boolean,
  authBypassRef: React.MutableRefObject<boolean>,
  setShowAuthNudge: (show: boolean) => void,
  showAuthPrompt: boolean,
  resetAuthFlow: () => void
) {
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
}

// ============================================================================
// Main Component
// ============================================================================

export default function CosmosChatModal(props: CosmosChatModalProps) {
  const {
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
  } = props;

  // ===== Core State =====
  const { isAuthenticated, verifyAuth } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // ===== Chat State =====
  const chatState = useChatState({
    isOpen,
    storageKey,
    initialValue,
    initialValueLabel,
    systemGreeting,
    systemQuestion,
  });

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
    handleClearMeta,
    pushSystemMessage,
    getLastUserMeta,
  } = chatState;

  // ===== Message Submit =====
  const messageSubmit = useMessageSubmit({
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
  });

  const { buildUserMessage, submitMessages, buildSubmitValue } = messageSubmit;

  // ===== Brainstorm =====
  const brainstorm = useBrainstormIntegration({
    storageKey,
    title,
    enabled: enableBrainstorm,
    setMessages,
  });

  // ===== Auth Flow =====
  const handleAuthComplete = useCallback(() => {
    void verifyAuth({ silent: true });
    authBypassRef.current = true;
    setShowAuthPrompt(false);

    if (pendingAuthSave && !isSaving) {
      setPendingAuthSave(false);
      setTimeout(() => void handlers.handleSave(), 0);
    } else {
      setPendingAuthSave(false);
    }
  }, [verifyAuth, authBypassRef, setShowAuthPrompt, pendingAuthSave, isSaving, setPendingAuthSave]);

  const authFlow = useAuthChatFlow({
    isActive: showAuthPrompt,
    onAuthenticated: handleAuthComplete,
  });

  const {
    messages: authMessages,
    step: authStep,
    stepSuggestions: authSuggestions,
    isSubmitting: isAuthSubmitting,
    isAuthenticated: isAuthComplete,
    loading: isAuthLoading,
    handleUserInput: handleAuthInput,
    resetAll: resetAuthFlow,
  } = authFlow;

  const authInputLocked = isAuthSubmitting || isAuthLoading || isAuthComplete;

  // ===== Handlers =====
  const handlers = useCosmosChatHandlers({
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
    brainstormIsActive: brainstorm.isActive,
    brainstormStatus: brainstorm.status,
    brainstormAddIdea: brainstorm.addIdea,
    brainstormProcessResponse: brainstorm.processIdeaResponse,
  });

  // ===== Derived State =====
  const styles = toneStyles[tone];
  const hasUserMessage = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const userMessageCount = useMemo(() => messages.filter((m) => m.role === 'user').length, [messages]);

  // ===== Scroll =====
  const scrollToBottom = useScrollToBottom({ messagesContainerRef, messagesEndRef });

  // ===== Effects =====
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, authMessages, showAuthPrompt, scrollToBottom]);
  useBodyScrollLock(isOpen, inline);
  useAuthEffects(isAuthenticated, authBypassRef, setShowAuthNudge, showAuthPrompt, resetAuthFlow);

  // ===== Computed Props =====
  if (!isMounted) return null;

  const composerProps = computeComposerProps({
    messages,
    authMessages,
    showAuthPrompt,
    showAuthNudge,
    authStep,
    authSuggestions,
    authInputLocked,
    placeholder,
    tone,
    suggestions,
  });

  // ===== Render =====
  const chatWindow = (
    <InputWindow
      variant="glass"
      size={inline ? 'sm' : 'md'}
      radius="lg"
      showAccent
      className={`flex flex-col relative ${inline ? 'w-full max-h-[420px] overflow-auto' : 'h-[600px]'} ${brainstorm.showPanel ? 'pr-80' : ''} ${windowClassName}`}
    >
      {!inline && <CloseButton onClose={onClose} />}

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
        onToggleBrainstorm={brainstorm.handleToggle}
      />

      {enableBrainstorm && (
        <BrainstormPanel
          isOpen={brainstorm.showPanel}
          status={brainstorm.status}
          ideas={brainstorm.ideas}
          clusters={brainstorm.clusters}
          stats={brainstorm.stats}
          onToggleKeyIdea={brainstorm.toggleKeyIdea}
          onCreateCluster={brainstorm.createCluster}
          onStartOrganizing={brainstorm.handleStartOrganizing}
          onGenerateSummary={brainstorm.handleGenerateSummary}
          onEndSession={brainstorm.handleEnd}
          onClose={() => brainstorm.setShowPanel(false)}
        />
      )}

      {!showAuthPrompt && <ContextEntries contextTitle={contextTitle} contextEntries={contextEntries} />}

      <ChatMessages
        messages={composerProps.displayMessages}
        styles={styles}
        inline={inline}
        containerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
      />

      <MessageCounter count={userMessageCount} inline={inline} showAuthPrompt={showAuthPrompt} />

      <ChatComposer
        inputValue={inputValue}
        setInputValue={setInputValue}
        onKeyDown={handlers.handleKeyDown}
        onSend={handlers.handleComposerSend}
        onSave={handlers.handleSave}
        placeholder={composerProps.placeholder}
        inputType={composerProps.inputType}
        inputAutoComplete={composerProps.autoComplete}
        inputName={composerProps.inputName}
        minInputLength={composerProps.minInputLength}
        submitLabel={submitLabel}
        inline={inline}
        styles={styles}
        isSaving={isSaving}
        hasUserMessage={hasUserMessage}
        submitError={submitError}
        suggestions={composerProps.suggestions}
        metaDraft={metaDraft}
        onSuggestionClick={handlers.handleSuggestionClick}
        onClearMeta={handleClearMeta}
        isInputDisabled={composerProps.inputDisabled}
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
