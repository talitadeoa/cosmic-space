'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage, ChatMessageMeta } from '@/lib/chatHistory';
import { ChatStyles, toneStyles } from './chatConstants';
import type { Tone } from './chatConstants';

// ============================================================================
// ChatHeader Component
// ============================================================================

interface ChatHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  headerExtra?: React.ReactNode;
  inline: boolean;
  styles: ChatStyles;
  enableBrainstorm?: boolean;
  isBrainstormActive?: boolean;
  onToggleBrainstorm?: () => void;
}

export function ChatHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  headerExtra,
  inline,
  styles,
  enableBrainstorm,
  isBrainstormActive,
  onToggleBrainstorm,
}: ChatHeaderProps) {
  return (
    <div className={`border-b ${styles.headerBorder} ${inline ? 'pb-3' : 'pb-4'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
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
        </div>
        
        {enableBrainstorm && (
          <button
            onClick={onToggleBrainstorm}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${isBrainstormActive
                ? 'bg-violet-500/30 border border-violet-400/50 text-violet-100 shadow-lg shadow-violet-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }
            `}
            title={isBrainstormActive ? 'Sair do modo brainstorm' : 'Ativar modo brainstorm'}
          >
            <svg className="w-4 h-4" fill={isBrainstormActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">{isBrainstormActive ? 'Brainstorm ativo' : 'Brainstorm'}</span>
          </button>
        )}
      </div>
      
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

// ============================================================================
// ChatMessages Component
// ============================================================================

interface ChatMessagesProps {
  messages: ChatMessage[];
  styles: ChatStyles;
  inline: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  styles,
  inline,
  containerRef,
  messagesEndRef,
}: ChatMessagesProps) {
  const messagesClassName = inline
    ? 'flex-1 min-h-[120px] space-y-4 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20'
    : 'flex-1 min-h-[200px] space-y-4 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20';

  return (
    <div ref={containerRef} className={messagesClassName}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400/60 text-sm">
          <span>💬 Digite algo para começar...</span>
        </div>
      ) : (
        messages.map((message, index) => (
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
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

// ============================================================================
// ChatComposer Component
// ============================================================================

interface ChatComposerProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onSave: () => void;
  placeholder: string;
  inputType?: 'text' | 'password' | 'email';
  inputAutoComplete?: string;
  inputName?: string;
  minInputLength?: number;
  submitLabel: string;
  inline: boolean;
  styles: ChatStyles;
  isSaving: boolean;
  hasUserMessage: boolean;
  submitError: string | null;
  suggestions?: Array<{
    id: string;
    label: string;
    value?: string;
    meta?: ChatMessageMeta;
    tone?: Tone;
    action?: 'auth';
  }>;
  metaDraft: ChatMessageMeta;
  onSuggestionClick: (suggestion: any) => void;
  onClearMeta: (key: keyof ChatMessageMeta) => void;
  isInputDisabled?: boolean;
  isAuthFlowActive?: boolean;
}

export function ChatComposer({
  inputValue,
  setInputValue,
  onKeyDown,
  onSend,
  onSave,
  placeholder,
  inputType = 'text',
  inputAutoComplete,
  inputName,
  minInputLength = 3,
  submitLabel,
  styles,
  isSaving,
  hasUserMessage,
  submitError,
  suggestions,
  metaDraft,
  onSuggestionClick,
  onClearMeta,
  isInputDisabled,
  isAuthFlowActive,
}: ChatComposerProps) {
  const isLocked = isSaving || isInputDisabled;
  const showMeta = !isAuthFlowActive;
  const showSubmitError = !isAuthFlowActive && submitError;
  const showSaveButton = !isAuthFlowActive && hasUserMessage;

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      {showMeta && (metaDraft.category || metaDraft.date || metaDraft.tags?.length) && (
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

      {showSubmitError && (
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
          type={inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isLocked}
          autoComplete={inputAutoComplete}
          name={inputName}
          className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isLocked || inputValue.trim().length < minInputLength}
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

      {showSaveButton && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={onSave}
          disabled={isLocked}
          className={`w-full rounded-2xl border px-4 py-3 font-semibold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.submitButton}`}
        >
          {isSaving ? 'Salvando...' : submitLabel}
        </motion.button>
      )}
    </div>
  );
}
