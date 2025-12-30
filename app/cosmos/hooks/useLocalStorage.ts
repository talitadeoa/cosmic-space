'use client';

/**
 * Hook genérico para sincronizar estado com localStorage
 * Elimina duplicação de try/catch e SSR checks
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    parse?: (value: string) => T;
    stringify?: (value: T) => string;
  }
) {
  const parse: (value: string) => T = options?.parse ?? ((value: string) => JSON.parse(value) as T);
  const stringify = options?.stringify ?? JSON.stringify;

  const getValue = (): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const stored = localStorage.getItem(key);
      return stored ? parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Falha ao ler localStorage[${key}]`, error);
      return defaultValue;
    }
  };

  const setValue = (value: T): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, stringify(value));
    } catch (error) {
      console.warn(`Falha ao salvar localStorage[${key}]`, error);
    }
  };

  return { getValue, setValue };
}
