'use client';

/**
 * Hook genérico para interação com localStorage
 * Fornece métodos para leitura e escrita com parsing JSON seguro
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const getValue = (): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.warn(`Erro ao carregar ${key} do localStorage:`, error);
      return defaultValue;
    }
  };

  const setValue = (value: T) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  const removeValue = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Erro ao remover ${key} do localStorage:`, error);
    }
  };

  return { getValue, setValue, removeValue };
};
