export type ChatRole = 'system' | 'user';

export type ChatMessageMeta = {
  category?: string;
  date?: string;
  tags?: string[];
};

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  meta?: ChatMessageMeta;
}

const STORAGE_PREFIX = 'cosmos_chat';

const buildStorageKey = (key: string) => `${STORAGE_PREFIX}:${key}`;

const safeParse = (value: string | null): ChatMessage[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item?.content === 'string' && typeof item?.role === 'string'
    );
  } catch {
    return [];
  }
};

export const loadChatHistory = (key: string): ChatMessage[] => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(buildStorageKey(key)));
};

export const saveChatHistory = (key: string, messages: ChatMessage[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(buildStorageKey(key), JSON.stringify(messages));
  } catch {}
};

export const appendChatMessage = (key: string, message: ChatMessage, limit = 240) => {
  const current = loadChatHistory(key);
  const next = [...current, message].slice(-limit);
  saveChatHistory(key, next);
  return next;
};

export const getLastUserMessage = (messages: ChatMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
};

export const getLatestUserMessageFromHistory = (key: string) => {
  const messages = loadChatHistory(key);
  return getLastUserMessage(messages);
};
