// components/auth/AuthGate.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import InputWindow from '@/components/shared/cosmos/InputWindow';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: React.ReactNode;
}

type AuthMode = 'login' | 'signup';
type AuthStep = 'mode' | 'firstName' | 'lastName' | 'birthDate' | 'gender' | 'email' | 'password';

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
}

const buildSystemMessage = (content: string): ChatMessage => ({
  id: `system-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  role: 'system',
  content,
});

const buildUserMessage = (content: string): ChatMessage => ({
  id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  role: 'user',
  content,
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

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, loading, error, login, signup } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<AuthStep>('mode');
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Renderiza o conteúdo autenticado
  if (isAuthenticated) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (loading || messages.length > 0) return;
    setMessages([
      buildSystemMessage('Oi! Vamos autenticar em fluxo de conversa.'),
      buildSystemMessage('Você prefere entrar ou criar conta?'),
    ]);
  }, [loading, messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const stepSuggestions = useMemo(() => {
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

  const pushSystemMessage = (content: string) => {
    setMessages((prev) => [...prev, buildSystemMessage(content)]);
  };

  const resetFlow = (nextMode: AuthMode | null) => {
    setMode(nextMode);
    setStep(nextMode === 'signup' ? 'firstName' : 'email');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
    });
  };

  const submitAuth = async (payload: typeof formData, activeMode: AuthMode) => {
    setIsSubmitting(true);
    pushSystemMessage('Validando seus dados...');
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
      return;
    }

    pushSystemMessage('Acesso liberado! Preparando o painel...');
  };

  const handleUserInput = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting || loading) return;

    setInputValue('');
    setMessages((prev) => [...prev, buildUserMessage(trimmed)]);

    const normalized = normalizeText(trimmed);

    if (step === 'mode') {
      if (normalized.includes('entrar') || normalized.includes('login')) {
        setMode('login');
        setStep('email');
        pushSystemMessage('Perfeito. Qual seu email?');
        return;
      }
      if (normalized.includes('criar') || normalized.includes('cadastro') || normalized.includes('signup')) {
        setMode('signup');
        setStep('firstName');
        pushSystemMessage('Vamos criar sua conta. Como você se chama?');
        return;
      }
      pushSystemMessage('Não entendi. Você prefere entrar ou criar conta?');
      return;
    }

    if (step === 'firstName') {
      if (trimmed.length < 2) {
        pushSystemMessage('Pode me dizer seu nome com mais detalhes?');
        return;
      }
      setFormData((prev) => ({ ...prev, firstName: trimmed }));
      setStep('lastName');
      pushSystemMessage('E seu sobrenome?');
      return;
    }

    if (step === 'lastName') {
      if (trimmed.length < 2) {
        pushSystemMessage('Sobrenome completo ajuda. Pode reenviar?');
        return;
      }
      setFormData((prev) => ({ ...prev, lastName: trimmed }));
      setStep('birthDate');
      pushSystemMessage('Qual sua data de nascimento? (dd/mm/aaaa)');
      return;
    }

    if (step === 'birthDate') {
      const parsed = parseBirthDate(trimmed);
      if (!parsed) {
        pushSystemMessage('Ainda não peguei. Me envie no formato dd/mm/aaaa.');
        return;
      }
      setFormData((prev) => ({ ...prev, birthDate: parsed }));
      setStep('gender');
      pushSystemMessage('Como você prefere registrar seu gênero?');
      return;
    }

    if (step === 'gender') {
      const parsed = parseGender(trimmed);
      if (!parsed) {
        pushSystemMessage('Pode escolher uma das opções: feminino, masculino, outro, prefiro não informar.');
        return;
      }
      setFormData((prev) => ({ ...prev, gender: parsed }));
      setStep('email');
      pushSystemMessage('Qual email vamos usar?');
      return;
    }

    if (step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        pushSystemMessage('Esse email parece inválido. Tenta de novo?');
        return;
      }
      setFormData((prev) => ({ ...prev, email: trimmed }));
      setStep('password');
      pushSystemMessage('Agora digite sua senha.');
      return;
    }

    if (step === 'password') {
      if (trimmed.length < 4) {
        pushSystemMessage('A senha está muito curta. Pode enviar outra?');
        return;
      }
      const nextPayload = { ...formData, password: trimmed };
      setFormData(nextPayload);
      if (!mode) {
        pushSystemMessage('Algo deu errado com o fluxo. Vamos recomeçar?');
        resetFlow(null);
        return;
      }
      await submitAuth(nextPayload, mode);
    }
  };

  const handleSend = () => {
    void handleUserInput(inputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleUserInput(inputValue);
    }
  };

  // Mostra o loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.12),transparent_36%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <InputWindow
            variant="glass"
            size="md"
            radius="lg"
            showAccent
            className="flex flex-col gap-4"
          >
            <div className="space-y-2 border-b border-white/10 pb-4">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-slate-400">
                Cosmos
              </p>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Autenticação em{' '}
                <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
                  conversa
                </span>
              </h1>
              <p className="text-sm text-slate-300">
                Responda às perguntas para acessar o painel do Cosmos.
              </p>
            </div>

            <div
              ref={messagesContainerRef}
              className="flex max-h-[360px] flex-col gap-4 overflow-y-auto px-1 py-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-indigo-500/40 border border-indigo-300/40 text-white rounded-br-none'
                        : 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none'
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
                    className="rounded-full border border-indigo-300/60 bg-indigo-500/30 px-3 py-1 text-[0.65rem] font-semibold text-white transition hover:bg-indigo-500/45"
                    disabled={isSubmitting}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 border-t border-white/10 pt-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua resposta..."
                disabled={isSubmitting}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isSubmitting || inputValue.trim().length < 1}
                className="rounded-2xl border border-indigo-300/60 bg-indigo-500/30 px-4 py-3 text-white transition hover:bg-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-60"
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
          </InputWindow>
        </div>
      </div>
    </div>
  );
}
