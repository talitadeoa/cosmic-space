'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/lib/chatHistory';

type AuthMode = 'login' | 'signup';
type AuthStep = 'mode' | 'firstName' | 'lastName' | 'birthDate' | 'gender' | 'email' | 'password';
type AuthTone = 'indigo' | 'violet' | 'amber' | 'sky';

interface AuthChatHeader {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

interface AuthChatFlowProps {
  variant?: 'page' | 'embedded';
  header?: AuthChatHeader;
  onAuthenticated?: () => void;
  onCancel?: () => void;
  className?: string;
  tone?: AuthTone;
  sendButtonSize?: 'default' | 'compact';
}

const toneStyles: Record<
  AuthTone,
  {
    userBubble: string;
    systemBubble: string;
    button: string;
  }
> = {
  indigo: {
    userBubble: 'bg-indigo-500/40 border border-indigo-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    button: 'border-indigo-300/60 bg-indigo-500/30 text-white hover:bg-indigo-500/45',
  },
  violet: {
    userBubble: 'bg-violet-500/35 border border-violet-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    button: 'border-violet-300/60 bg-violet-500/30 text-white hover:bg-violet-500/45',
  },
  amber: {
    userBubble: 'bg-amber-500/30 border border-amber-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    button: 'border-amber-300/60 bg-amber-500/30 text-white hover:bg-amber-500/45',
  },
  sky: {
    userBubble: 'bg-sky-500/30 border border-sky-300/40 text-white rounded-br-none',
    systemBubble: 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none',
    button: 'border-sky-300/60 bg-sky-500/30 text-white hover:bg-sky-500/45',
  },
};

const buildSystemMessage = (content: string): ChatMessage => ({
  id: `system-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseBirthDate = (value: string) => {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return `${year}-${month}-${day}`;
  }
  return null;
};

const parseGender = (value: string) => {
  const normalized = normalizeText(value);
  if (normalized.includes('fem')) return 'feminino';
  if (normalized.includes('masc')) return 'masculino';
  if (normalized.includes('outro')) return 'outro';
  if (normalized.includes('prefiro') || normalized.includes('nao informar')) {
    return 'prefiro_nao_informar';
  }
  return null;
};

const initialFormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
};

type AuthFlowSuggestion = {
  id: string;
  label: string;
  value: string;
};

export function useAuthChatFlow({
  isActive = true,
  onAuthenticated,
}: {
  isActive?: boolean;
  onAuthenticated?: () => void;
}) {
  const { isAuthenticated, loading, error, login, signup } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<AuthStep>('mode');
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const resetFlow = useCallback((nextMode: AuthMode | null) => {
    setMode(nextMode);
    setStep(nextMode === 'signup' ? 'firstName' : 'email');
    setFormData(initialFormData);
  }, []);

  const resetAll = useCallback(() => {
    setMessages([]);
    setStep('mode');
    setMode(null);
    setIsSubmitting(false);
    setFormData(initialFormData);
  }, []);

  useEffect(() => {
    if (!isActive) {
      resetAll();
      return;
    }

    if (loading || messages.length > 0) return;
    setMessages([buildSystemMessage('Você prefere entrar ou criar conta?')]);
  }, [isActive, loading, messages.length, resetAll]);

  const stepSuggestions: AuthFlowSuggestion[] = useMemo(() => {
    if (step === 'mode') {
      return [
        { id: 'login', label: 'Entrar', value: 'entrar' },
        { id: 'signup', label: 'Criar conta', value: 'criar conta' },
      ];
    }
    if (step === 'gender') {
      return [
        { id: 'feminino', label: 'Feminino', value: 'feminino' },
        { id: 'masculino', label: 'Masculino', value: 'masculino' },
        { id: 'outro', label: 'Outro', value: 'outro' },
        { id: 'prefiro', label: 'Prefiro não informar', value: 'prefiro não informar' },
      ];
    }
    return [];
  }, [step]);

  const pushSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, buildSystemMessage(content)]);
  }, []);

  const submitAuth = useCallback(
    async (payload: typeof formData, activeMode: AuthMode) => {
      setIsSubmitting(true);
      const success =
        activeMode === 'login'
          ? await login(payload.email, payload.password)
          : await signup({
              email: payload.email,
              password: payload.password,
              firstName: payload.firstName,
              lastName: payload.lastName,
              birthDate: payload.birthDate,
              gender: payload.gender,
            });
      setIsSubmitting(false);

      if (!success) {
        pushSystemMessage(error || 'Não consegui autenticar. Vamos tentar de novo?');
        resetFlow(activeMode);
        pushSystemMessage(
          activeMode === 'login'
            ? 'Me diga seu email para tentar novamente.'
            : 'Vamos reiniciar o cadastro. Qual seu nome?'
        );
        return false;
      }

      pushSystemMessage('Acesso liberado.');
      onAuthenticated?.();
      return true;
    },
    [error, login, onAuthenticated, pushSystemMessage, resetFlow, signup]
  );

  const handleUserInput = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!isActive || !trimmed || isSubmitting || loading || isAuthenticated) return false;

      const shouldMask = step === 'password';
      const visibleValue = shouldMask ? '****' : trimmed;
      setMessages((prev) => [...prev, buildUserMessage(visibleValue)]);

      const normalized = normalizeText(trimmed);

      if (step === 'mode') {
        if (normalized.includes('entrar') || normalized.includes('login')) {
          setMode('login');
          setStep('email');
          pushSystemMessage('Perfeito. Qual seu email?');
          return true;
        }
        if (
          normalized.includes('criar') ||
          normalized.includes('cadastro') ||
          normalized.includes('signup')
        ) {
          setMode('signup');
          setStep('firstName');
          pushSystemMessage('Vamos criar sua conta. Como você se chama?');
          return true;
        }
        pushSystemMessage('Não entendi. Você prefere entrar ou criar conta?');
        return true;
      }

      if (step === 'firstName') {
        if (trimmed.length < 2) {
          pushSystemMessage('Pode me dizer seu nome com mais detalhes?');
          return true;
        }
        setFormData((prev) => ({ ...prev, firstName: trimmed }));
        setStep('lastName');
        pushSystemMessage('E seu sobrenome?');
        return true;
      }

      if (step === 'lastName') {
        if (trimmed.length < 2) {
          pushSystemMessage('Sobrenome completo ajuda. Pode reenviar?');
          return true;
        }
        setFormData((prev) => ({ ...prev, lastName: trimmed }));
        setStep('birthDate');
        pushSystemMessage('Qual sua data de nascimento? (dd/mm/aaaa)');
        return true;
      }

      if (step === 'birthDate') {
        const parsed = parseBirthDate(trimmed);
        if (!parsed) {
          pushSystemMessage('Ainda não peguei. Me envie no formato dd/mm/aaaa.');
          return true;
        }
        setFormData((prev) => ({ ...prev, birthDate: parsed }));
        setStep('gender');
        pushSystemMessage('Como você prefere registrar seu gênero?');
        return true;
      }

      if (step === 'gender') {
        const parsed = parseGender(trimmed);
        if (!parsed) {
          pushSystemMessage(
            'Pode escolher uma das opções: feminino, masculino, outro, prefiro não informar.'
          );
          return true;
        }
        setFormData((prev) => ({ ...prev, gender: parsed }));
        setStep('email');
        pushSystemMessage('Qual email vamos usar?');
        return true;
      }

      if (step === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          pushSystemMessage('Esse email parece inválido. Tenta de novo?');
          return true;
        }
        setFormData((prev) => ({ ...prev, email: trimmed }));
        setStep('password');
        pushSystemMessage('Agora digite sua senha.');
        return true;
      }

      if (step === 'password') {
        if (trimmed.length < 4) {
          pushSystemMessage('A senha está muito curta. Pode enviar outra?');
          return true;
        }
        const nextPayload = { ...formData, password: trimmed };
        setFormData(nextPayload);
        if (!mode) {
          pushSystemMessage('Algo deu errado com o fluxo. Vamos recomeçar?');
          resetFlow(null);
          return true;
        }
        await submitAuth(nextPayload, mode);
        return true;
      }

      return false;
    },
    [
      formData,
      isActive,
      isAuthenticated,
      isSubmitting,
      loading,
      mode,
      pushSystemMessage,
      resetFlow,
      step,
      submitAuth,
    ]
  );

  return {
    messages,
    step,
    stepSuggestions,
    isSubmitting,
    isAuthenticated,
    loading,
    handleUserInput,
    resetAll,
  };
}

export default function AuthChatFlow({
  variant = 'embedded',
  header,
  onAuthenticated,
  onCancel,
  className = '',
  tone = 'indigo',
  sendButtonSize = 'default',
}: AuthChatFlowProps) {
  const { messages, step, stepSuggestions, isSubmitting, isAuthenticated, loading, handleUserInput } =
    useAuthChatFlow({ onAuthenticated });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeTone = toneStyles[tone];

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const handleSend = () => {
    void handleUserInput(inputValue).then((didSend) => {
      if (didSend) {
        setInputValue('');
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleUserInput(inputValue).then((didSend) => {
        if (didSend) {
          setInputValue('');
        }
      });
    }
  };

  const shouldShowHeader = variant === 'page' && header;
  const rootSizing =
    variant === 'page' ? '' : 'max-h-[55vh] sm:max-h-[320px] overflow-hidden';
  const messagesHeight =
    variant === 'page' ? 'max-h-[45vh] sm:max-h-[360px]' : 'max-h-[30vh] sm:max-h-[220px]';
  const inputType = step === 'password' ? 'password' : step === 'email' ? 'email' : 'text';
  const inputPlaceholder = step === 'password' ? 'Digite sua senha...' : 'Digite sua resposta...';
  const inputAutoComplete =
    step === 'email' ? 'email' : step === 'password' ? 'current-password' : undefined;
  const inputName = step === 'email' ? 'email' : step === 'password' ? 'password' : undefined;
  const sendButtonClasses =
    sendButtonSize === 'compact'
      ? 'px-3 py-0 text-sm h-11'
      : 'px-4 py-3';
  const sendIconClasses = sendButtonSize === 'compact' ? 'h-4 w-4' : 'h-5 w-5';
  const inputRowClassName =
    sendButtonSize === 'compact'
      ? 'flex flex-row items-center gap-2 border-t border-white/10 pt-3'
      : 'flex flex-col items-stretch gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center';
  const sendButtonWidthClasses =
    sendButtonSize === 'compact' ? 'w-auto' : 'w-full sm:w-auto';
  const inputHeightClasses = sendButtonSize === 'compact' ? 'h-11 py-0' : '';

  return (
    <div className={`flex min-h-0 flex-col gap-3 ${rootSizing} ${className}`}>
      {shouldShowHeader && (
        <div className="space-y-2 border-b border-white/10 pb-4">
          {header?.eyebrow && (
            <p className="text-[0.6rem] uppercase tracking-[0.32em] text-slate-400 sm:text-[0.65rem]">
              {header.eyebrow}
            </p>
          )}
          <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">{header?.title}</h1>
          {header?.subtitle && <p className="text-xs text-slate-300 sm:text-sm">{header.subtitle}</p>}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-0.5 py-1 sm:gap-4 sm:px-1 ${messagesHeight} scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20`}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-xs sm:max-w-md sm:px-4 sm:py-3 sm:text-sm ${
                message.role === 'user' ? activeTone.userBubble : activeTone.systemBubble
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {stepSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stepSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => void handleUserInput(suggestion.value)}
              className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition ${activeTone.button}`}
              disabled={isSubmitting || loading || isAuthenticated}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <div className={inputRowClassName}>
        <input
          type={inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          disabled={isSubmitting || loading || isAuthenticated}
          autoComplete={inputAutoComplete}
          name={inputName}
          className={`min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50 ${inputHeightClasses}`}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSubmitting || loading || isAuthenticated || inputValue.trim().length < 1}
          className={`rounded-2xl border text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${activeTone.button} ${sendButtonClasses} ${sendButtonWidthClasses}`}
          aria-label="Enviar mensagem"
        >
          <svg className={sendIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:text-white sm:w-auto"
          >
            Agora não
          </button>
        )}
      </div>
    </div>
  );
}
