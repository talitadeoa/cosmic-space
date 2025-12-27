'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InputWindow from './InputWindow';
import { ChatMessage, ChatMessageMeta, loadChatHistory, saveChatHistory } from '@/lib/chatHistory';

type SubmitStrategy = 'concat' | 'last';

type Tone = 'indigo' | 'violet' | 'amber' | 'sky';
type ChatStyles = (typeof toneStyles)['indigo'];

interface CosmosChatModalProps {
  isOpen: boolean;
  inline?: boolean;
  storageKey: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string;
  placeholder: string;
  systemGreeting?: string;
  systemQuestion?: string;
  initialValue?: string;
  initialValueLabel?: string;
  submitLabel?: string;
  tone?: Tone;
  systemResponses?: string[];
  submitStrategy?: SubmitStrategy;
  onClose: () => void;
  onSubmit: (value: string, messages: ChatMessage[], meta?: ChatMessageMeta) => Promise<void>;
  headerExtra?: React.ReactNode;
  contextTitle?: string;
  contextEntries?: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  suggestions?: Array<{
    id: string;
    label: string;
    value?: string;
    meta?: ChatMessageMeta;
    tone?: Tone;
  }>;
}

const toneStyles: Record<
  Tone,
  {
    headerBorder: string;
    eyebrowText: string;
    badge: string;
    userBubble: string;
    systemBubble: string;
    sendButton: string;
    submitButton: string;
  }
> = {
  indigo: {
    headerBorder: 'border-indigo-300/30',
    eyebrowText: 'text-indigo-100/80',
    badge: 'border-indigo-300/40 bg-indigo-500/10 text-indigo-100',
    userBubble: 'bg-indigo-500/40 border border-indigo-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    sendButton: 'border-indigo-300/60 bg-indigo-500/30 text-white hover:bg-indigo-500/45',
    submitButton:
      'border-indigo-300/60 bg-indigo-500/30 text-white hover:bg-indigo-500/45 shadow-indigo-900/40 hover:shadow-indigo-700/40',
  },
  violet: {
    headerBorder: 'border-violet-300/30',
    eyebrowText: 'text-violet-100/80',
    badge: 'border-violet-300/40 bg-violet-500/10 text-violet-100',
    userBubble: 'bg-violet-500/35 border border-violet-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    sendButton: 'border-violet-300/60 bg-violet-500/30 text-white hover:bg-violet-500/45',
    submitButton:
      'border-violet-300/60 bg-violet-500/30 text-white hover:bg-violet-500/45 shadow-violet-900/40 hover:shadow-violet-700/40',
  },
  amber: {
    headerBorder: 'border-amber-300/40',
    eyebrowText: 'text-amber-100/80',
    badge: 'border-amber-300/40 bg-amber-500/10 text-amber-100',
    userBubble: 'bg-amber-500/30 border border-amber-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    sendButton: 'border-amber-300/60 bg-amber-500/30 text-white hover:bg-amber-500/45',
    submitButton:
      'border-amber-300/60 bg-amber-500/30 text-white hover:bg-amber-500/45 shadow-amber-900/40 hover:shadow-amber-700/40',
  },
  sky: {
    headerBorder: 'border-sky-300/40',
    eyebrowText: 'text-sky-100/80',
    badge: 'border-sky-300/40 bg-sky-500/10 text-sky-100',
    userBubble: 'bg-sky-500/30 border border-sky-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    sendButton: 'border-sky-300/60 bg-sky-500/30 text-white hover:bg-sky-500/45',
    submitButton:
      'border-sky-300/60 bg-sky-500/30 text-white hover:bg-sky-500/45 shadow-sky-900/40 hover:shadow-sky-700/40',
  },
};

const buildSystemMessage = (id: string, content: string): ChatMessage => ({
  id,
  role: 'system',
  content,
  timestamp: new Date().toISOString(),
});

const buildUserMessage = (content: string): ChatMessage => ({
  id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  role: 'user',
  content,
  timestamp: new Date().toISOString(),
});

interface ChatHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  headerExtra?: React.ReactNode;
  inline: boolean;
  styles: ChatStyles;
}

function ChatHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  headerExtra,
  inline,
  styles,
}: ChatHeaderProps) {
  return (
    <div className={`border-b ${styles.headerBorder} ${inline ? 'pb-3' : 'pb-4'}`}>
      {eyebrow && (
        <div
          className={`mb-2 font-semibold uppercase tracking-[0.24em] ${styles.eyebrowText} ${
            inline ? 'text-[0.65rem]' : 'text-sm'
          }`}
        >
          {eyebrow}
        </div>
      )}
      <h2 className={`${inline ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{title}</h2>
      {subtitle && (
        <p className={`${inline ? 'text-[0.7rem]' : 'text-xs'} text-slate-200/70`}>{subtitle}</p>
      )}
      {badge && (
        <div
          className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${styles.badge}`}
        >
          {badge}
        </div>
      )}
      {headerExtra}
    </div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  styles: ChatStyles;
  inline: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function ChatMessages({
  messages,
  styles,
  inline,
  containerRef,
  messagesEndRef,
}: ChatMessagesProps) {
  const messagesClassName = inline
    ? 'flex-1 min-h-0 space-y-4 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20'
    : 'flex-1 space-y-4 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20';

  return (
    <div ref={containerRef} className={messagesClassName}>
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className="flex max-w-xs flex-col gap-1">
            {message.meta && (message.meta.category || message.meta.date) && (
              <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-200/80">
                {message.meta.category && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
                    {message.meta.category}
                  </span>
                )}
                {message.meta.date && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
                    {message.meta.date}
                  </span>
                )}
              </div>
            )}
            <div
              className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                message.role === 'user' ? styles.userBubble : styles.systemBubble
              }`}
            >
              {message.content}
            </div>
          </div>
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface ChatComposerProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onSave: () => void;
  placeholder: string;
  submitLabel: string;
  inline: boolean;
  styles: ChatStyles;
  isSaving: boolean;
  hasUserMessage: boolean;
  submitError: string | null;
  suggestions?: CosmosChatModalProps['suggestions'];
  metaDraft: ChatMessageMeta;
  onSuggestionClick: (suggestion: NonNullable<CosmosChatModalProps['suggestions']>[number]) => void;
  onClearMeta: (key: keyof ChatMessageMeta) => void;
}

function ChatComposer({
  inputValue,
  setInputValue,
  onKeyDown,
  onSend,
  onSave,
  placeholder,
  submitLabel,
  inline,
  styles,
  isSaving,
  hasUserMessage,
  submitError,
  suggestions,
  metaDraft,
  onSuggestionClick,
  onClearMeta,
}: ChatComposerProps) {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      {(metaDraft.category || metaDraft.date || metaDraft.tags?.length) && (
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-slate-200/80">
          {metaDraft.category && (
            <button
              type="button"
              onClick={() => onClearMeta('category')}
              className="rounded-full border border-white/15 bg-white/10 px-2 py-1 transition hover:bg-white/20"
            >
              {metaDraft.category} ✕
            </button>
          )}
          {metaDraft.date && (
            <button
              type="button"
              onClick={() => onClearMeta('date')}
              className="rounded-full border border-white/15 bg-white/10 px-2 py-1 transition hover:bg-white/20"
            >
              {metaDraft.date} ✕
            </button>
          )}
          {metaDraft.tags?.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const suggestionTone = suggestion.tone ?? 'indigo';
            const toneStyle = toneStyles[suggestionTone];
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition ${toneStyle.sendButton}`}
              >
                {suggestion.label}
              </button>
            );
          })}
        </div>
      )}

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 shadow-inner shadow-black/20"
        >
          {submitError}
        </motion.div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isSaving || inputValue.trim().length < 3}
          className={`rounded-2xl border px-4 py-3 transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.sendButton}`}
          aria-label="Enviar mensagem"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {hasUserMessage && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`w-full rounded-2xl border px-4 py-3 font-semibold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.submitButton}`}
        >
          {isSaving ? 'Salvando...' : submitLabel}
        </motion.button>
      )}
    </div>
  );
}

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
  onClose,
  onSubmit,
  headerExtra,
  contextTitle,
  contextEntries = [],
  suggestions = [],
}: CosmosChatModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [metaDraft, setMetaDraft] = useState<ChatMessageMeta>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const styles = toneStyles[tone];
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === 'user'),
    [messages]
  );
  const userMessageCount = useMemo(
    () => messages.filter((message) => message.role === 'user').length,
    [messages]
  );

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const persistMessages = (next: ChatMessage[]) => {
    setMessages(next);
    saveChatHistory(storageKey, next);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (inline || !isOpen || typeof document === 'undefined') return;

    // Usar html em vez de body para evitar problemas com overflow
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

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setSubmitError(null);
      setIsSaving(false);
      setMetaDraft({});
      return;
    }

    const stored = loadChatHistory(storageKey);
    if (stored.length > 0) {
      setMessages(stored);
      return;
    }

    const seed: ChatMessage[] = [];
    if (systemGreeting) {
      seed.push(buildSystemMessage('greeting', systemGreeting));
    }

    if (initialValue?.trim()) {
      const label = initialValueLabel ? ` (${initialValueLabel})` : '';
      seed.push(
        buildSystemMessage('saved', `💾 Registro anterior${label}:\n\n"${initialValue.trim()}"`)
      );
    }

    if (systemQuestion) {
      seed.push(buildSystemMessage('question', systemQuestion));
    }

    persistMessages(seed);
    setMetaDraft({});
  }, [initialValue, initialValueLabel, isOpen, storageKey, systemGreeting, systemQuestion]);

  const handleSendMessage = () => {
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

    setMessages((prev) => {
      const next = [...prev, userMessage];
      saveChatHistory(storageKey, next);
      return next;
    });

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
  };

  const buildSubmitValue = () => {
    const userMessages = messages
      .filter((message) => message.role === 'user')
      .map((m) => m.content);
    if (!userMessages.length) return '';
    if (submitStrategy === 'last') {
      return userMessages[userMessages.length - 1] ?? '';
    }
    return userMessages.join('\n\n');
  };

  const getLastUserMeta = () => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        return messages[i].meta;
      }
    }
    return undefined;
  };

  const handleSave = async () => {
    const value = buildSubmitValue();
    if (value.trim().length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para salvar.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      await onSubmit(value, messages, getLastUserMeta());
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestionClick = (
    suggestion: NonNullable<CosmosChatModalProps['suggestions']>[number]
  ) => {
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
  };

  const handleClearMeta = (key: keyof ChatMessageMeta) => {
    setMetaDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!isMounted) return null;

  const chatWindow = (
    <InputWindow
      variant="glass"
      size={inline ? 'sm' : 'md'}
      radius="lg"
      showAccent
      className={`flex flex-col ${inline ? 'w-full max-h-[420px] overflow-auto' : 'h-[600px]'}`}
    >
      {!inline && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
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
      />

      {contextEntries.length > 0 && (
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
        messages={messages}
        styles={styles}
        inline={inline}
        containerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
      />

      {hasUserMessage && !inline && (
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
        onSend={handleSendMessage}
        onSave={handleSave}
        placeholder={placeholder}
        submitLabel={submitLabel}
        inline={inline}
        styles={styles}
        isSaving={isSaving}
        hasUserMessage={hasUserMessage}
        submitError={submitError}
        suggestions={suggestions}
        metaDraft={metaDraft}
        onSuggestionClick={handleSuggestionClick}
        onClearMeta={handleClearMeta}
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
