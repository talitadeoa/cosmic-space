/**
 * Hook para utilidades e helpers da comunidade
 * Responsável por: formatação de datas, prompt do dia, etc
 */

import { useMemo } from 'react';

const DAILY_PROMPTS = [
  'Qual pergunta você quer lançar para a comunidade hoje?',
  'O que te deu clareza neste ciclo?',
  'Quem merece um agradecimento nesta órbita?',
  'Que convite você quer abrir para a tripulação?',
  'Qual ritual está guiando seu foco?',
];

export const truncate = (text: string, length = 140) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
};

export const getPromptOfDay = (date = new Date()) => {
  if (DAILY_PROMPTS.length === 0) return '';
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.max(0, Math.floor(diff / 86400000));
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
};

export const useCommunityHelpers = () => {
  // Formatter de tempo relativo
  const relativeTime = useMemo(() => {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  }, []);

  // Prompt do dia
  const promptOfDay = useMemo(() => getPromptOfDay(), []);

  // Formatar tempo relativo (ex: "há 2 horas")
  const formatRelativeTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'agora';
    const diffMs = date.getTime() - Date.now();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffSeconds) < 60) return relativeTime.format(diffSeconds, 'second');
    if (Math.abs(diffMinutes) < 60) return relativeTime.format(diffMinutes, 'minute');
    if (Math.abs(diffHours) < 24) return relativeTime.format(diffHours, 'hour');
    return relativeTime.format(diffDays, 'day');
  };

  return {
    promptOfDay,
    formatRelativeTime,
    truncate,
  };
};
