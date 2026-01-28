/**
 * Constantes e estilos do CosmosChatModal
 */

export type Tone = 'indigo' | 'violet' | 'amber' | 'sky';

export interface ChatStyles {
  headerBorder: string;
  eyebrowText: string;
  badge: string;
  userBubble: string;
  systemBubble: string;
  sendButton: string;
  submitButton: string;
}

export const toneStyles: Record<Tone, ChatStyles> = {
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
