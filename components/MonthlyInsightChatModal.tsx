'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputWindow from './InputWindow';

interface MonthlyInsightChatModalProps {
  isOpen: boolean;
  moonIndex: number;
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  moonSignLabel?: string;
  initialInsight?: string;
  lastSavedAt?: string | null;
  isLoadingInsight?: boolean;
  onClose: () => void;
  onSubmit: (insight: string) => Promise<void>;
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

const moonPhaseLabels: Record<string, string> = {
  luaNova: '🌑 Lua Nova',
  luaCrescente: '🌓 Lua Crescente',
  luaCheia: '🌕 Lua Cheia',
  luaMinguante: '🌗 Lua Minguante',
};

const getMonthNumber = (monthNumber: number): number => {
  return ((monthNumber - 1) % 12) + 1;
};

const getMonthName = (monthNum: number): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[(monthNum - 1) % 12];
};

const phasePrompts: Record<string, { 
  greeting: string; 
  systemQuestion: string;
  label: string; 
  placeholder: string 
}> = {
  luaNova: {
    greeting: 'Bem-vindo à Lua Nova de {month}',
    systemQuestion: 'O que você gostaria de plantar nesta fase? 🌱',
    label: 'O que você gostaria de plantar nesta fase?',
    placeholder: 'Intenções, sementes, inícios que você quer colocar no mundo...',
  },
  luaCrescente: {
    greeting: 'Bem-vindo à Lua Crescente de {month}',
    systemQuestion: 'Como você está crescendo nesta fase? 📈',
    label: 'Como você está crescendo nesta fase?',
    placeholder: 'Ações, crescimento e desenvolvimento que você está vivendo...',
  },
  luaCheia: {
    greeting: 'Bem-vindo à Lua Cheia de {month}',
    systemQuestion: 'O que você gostaria de colher nesta fase? 🌕',
    label: 'O que você gostaria de colher nesta fase?',
    placeholder: 'Resultados, colheitas e celebrações do que foi plantado...',
  },
  luaMinguante: {
    greeting: 'Bem-vindo à Lua Minguante de {month}',
    systemQuestion: 'O que você gostaria de liberar nesta fase? 🍂',
    label: 'O que você gostaria de liberar nesta fase?',
    placeholder: 'Aprendizados, sombras e padrões que você quer soltar...',
  },
};

export default function MonthlyInsightChatModal({
  isOpen,
  moonIndex,
  moonPhase,
  moonSignLabel,
  initialInsight = '',
  lastSavedAt = null,
  isLoadingInsight = false,
  onClose,
  onSubmit,
}: MonthlyInsightChatModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUserMessage, setHasUserMessage] = useState(false);

  const monthNum = getMonthNumber(moonIndex);
  const monthName = getMonthName(monthNum);
  const phaseLabel = moonPhaseLabels[moonPhase];
  const prompt = phasePrompts[moonPhase] ?? {
    greeting: `Bem-vindo ao insight de ${monthName}`,
    systemQuestion: 'Compartilhe seus pensamentos...',
    label: 'Seu insight do mês',
    placeholder: 'Escreva seu insight, reflexão ou aprendizado para este mês...',
  };
  const signLabel = moonSignLabel?.trim() && moonSignLabel.trim().length > 0 ? moonSignLabel : 'Signo em breve';
  const formattedSavedAt = lastSavedAt
    ? new Date(lastSavedAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar mensagens quando o modal abre
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setHasUserMessage(false);
      setSubmitError(null);
      setIsSaving(false);
    } else {
      // Criar mensagem inicial do sistema com saudação
      const greetingMessage: ChatMessage = {
        id: 'greeting',
        role: 'system',
        content: prompt.greeting.replace('{month}', monthName),
        timestamp: new Date(),
      };
      
      // Pergunta do sistema
      const questionMessage: ChatMessage = {
        id: 'question',
        role: 'system',
        content: prompt.systemQuestion,
        timestamp: new Date(),
      };

      const initialMessages = [greetingMessage];

      // Se há um insight salvo anteriormente, adicionar como mensagem do sistema
      if (initialInsight.trim().length > 0) {
        const savedMessage: ChatMessage = {
          id: 'saved',
          role: 'system',
          content: `💾 Seu insight anterior (salvo em ${formattedSavedAt}):\n\n"${initialInsight}"`,
          timestamp: new Date(),
        };
        initialMessages.push(savedMessage);
      }

      initialMessages.push(questionMessage);
      setMessages(initialMessages);
    }
  }, [isOpen, monthName, prompt, initialInsight, formattedSavedAt]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para enviar.');
      return;
    }

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setHasUserMessage(true);
    setSubmitError(null);

    // Simular resposta do sistema
    setTimeout(() => {
      const systemResponses: Record<string, string[]> = {
        luaNova: [
          'Que intenções poderosas! 🌱 Você está pronto para este novo ciclo.',
          'Excelente! Essas sementes do seu coração estão plantadas. ✨',
          'Que lindo! Você já está abrindo caminhos para o novo. 🌙',
        ],
        luaCrescente: [
          'Seu crescimento é inspirador! Continuamos em movimento. 📈',
          'Ótimo! Você está honrando seu próprio desenvolvimento. 🌟',
          'Que ritmo maravilhoso! Siga este caminho. ✨',
        ],
        luaCheia: [
          'Que colheita magnífica! Você está celebrando o ciclo completo. 🌕',
          'Incrível! Veja tudo que você realizou. ✨',
          'A plenitude é sua! Que beleza neste momento. 🙏',
        ],
        luaMinguante: [
          'Que libertação! Você está honrando o fim do ciclo. 🌙',
          'Profundo! Soltar é tão poderoso quanto plantar. ✨',
          'Excelente insight! Você está trazendo sabedoria para casa. 🍂',
        ],
      };

      const responses = systemResponses[moonPhase] || [
        'Que insight profundo! ✨',
        'Isso ressoa muito bem. 🌙',
        'Você está no caminho certo. 🌟',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, systemMessage]);
    }, 800);
  };

  const handleSaveInsight = async () => {
    const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);
    const fullInsight = userMessages.join('\n\n');

    if (fullInsight.trim().length < 3) {
      setSubmitError('Escreva pelo menos 3 caracteres para salvar.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      await onSubmit(fullInsight);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex w-full max-w-2xl flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <InputWindow variant="glass" size="md" radius="lg" showAccent className="flex flex-col h-[600px]">
              {/* Fechar */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-indigo-200 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 hover:text-white"
                aria-label="Fechar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Cabeçalho */}
              <div className="border-b border-white/10 pb-4">
                <div className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-100/80">
                  {phaseLabel}
                </div>
                <h2 className="text-2xl font-bold text-white">{monthName}</h2>
                <p className="text-xs text-slate-200/70">Mês #{monthNum}</p>
                <div className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-indigo-50">
                  <span>Signo</span>
                  <span className="text-slate-100/90">{signLabel}</span>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4 px-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-indigo-500/40 border border-indigo-300/40 text-white rounded-br-none'
                          : 'bg-white/10 border border-white/15 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-white/10 pt-4 space-y-3">
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
                    onKeyDown={handleKeyDown}
                    placeholder={prompt.placeholder}
                    disabled={isSaving}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-300/70 shadow-inner shadow-black/20 transition-colors focus:border-indigo-300/60 focus:outline-none focus:ring-1 focus:ring-indigo-300/40 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isSaving || inputValue.trim().length < 3}
                    className="rounded-2xl border border-indigo-300/60 bg-indigo-500/30 px-4 py-3 text-white transition hover:bg-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Enviar mensagem"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>

                {hasUserMessage && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={handleSaveInsight}
                    disabled={isSaving}
                    className="w-full rounded-2xl border border-indigo-300/60 bg-indigo-500/30 px-4 py-3 font-semibold text-white shadow-md shadow-indigo-900/40 transition hover:bg-indigo-500/45 hover:shadow-lg hover:shadow-indigo-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Salvando...' : '✨ Concluir e Salvar'}
                  </motion.button>
                )}
              </div>
            </InputWindow>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
