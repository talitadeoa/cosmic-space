/**
 * 🎨 Format Utilities
 * 
 * Funções de formatação e utilitários diversos.
 */

// ============================================
// TIMEZONE & DATE FORMATTING (original)
// ============================================

export const getResolvedTimezone = () => {
  if (typeof Intl === 'undefined') return 'UTC';
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

export const formatTimePtBr = (date: Date) =>
  date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const formatDateTimePtBr = (value: Date | string) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
};

export const formatSavedAtLabel = (value?: string | null) => {
  if (!value) return '';
  const formatted = formatDateTimePtBr(value);
  return formatted ? `salvo em ${formatted}` : '';
};

// ============================================
// CLASS UTILITIES
// ============================================

/**
 * Combina classes CSS condicionalmente (estilo clsx/cn)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================
// RELATIVE TIME
// ============================================

/**
 * Formata data relativa (ex: "há 5 minutos")
 */
export function formatRelativeTime(isoDate: string, locale = 'pt-BR'): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second');
  }
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }
  if (diffDays < 30) {
    return rtf.format(-diffDays, 'day');
  }

  // Para datas mais antigas, retorna formato completo
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formata data ISO para display
 */
export function formatDate(isoDate: string, locale = 'pt-BR'): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data ISO com horário
 */
export function formatDateTime(isoDate: string, locale = 'pt-BR'): string {
  const date = new Date(isoDate);
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Trunca texto com ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================
// ID GENERATION
// ============================================

/**
 * Gera ID único
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce simples
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle simples
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
