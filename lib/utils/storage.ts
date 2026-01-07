/**
 * 💾 Storage Utility - Capacitor-Ready
 * 
 * Abstração sobre localStorage que funciona em Web e Mobile.
 * Automaticamente usa Capacitor Preferences quando disponível.
 */

'use client';

import { useState } from 'react';

/**
 * Storage class com fallback automático
 * Web: localStorage
 * Mobile: Capacitor Preferences (quando implementado)
 */
class StorageManager {
  private isClient = typeof window !== 'undefined';

  /**
   * Obtém valor do storage
   */
  get<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[Storage] Erro ao ler "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Salva valor no storage
   */
  set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;

    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao salvar "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove valor do storage
   */
  remove(key: string): boolean {
    if (!this.isClient) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao remover "${key}":`, error);
      return false;
    }
  }

  /**
   * Limpa todo o storage
   */
  clear(): boolean {
    if (!this.isClient) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('[Storage] Erro ao limpar storage:', error);
      return false;
    }
  }

  /**
   * Verifica se chave existe
   */
  has(key: string): boolean {
    if (!this.isClient) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Obtém todas as chaves
   */
  keys(): string[] {
    if (!this.isClient) return [];
    return Object.keys(localStorage);
  }
}

/**
 * Instância singleton do storage
 */
export const storage = new StorageManager();

// ============================================
// CAPACITOR-READY ASYNC STORAGE
// (Use quando Capacitor for instalado)
// ============================================

/**
 * Storage assíncrono compatível com Capacitor Preferences
 * Placeholder até @capacitor/preferences ser instalado
 */
export const asyncStorage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    // TODO: Quando instalar @capacitor/preferences:
    // import { Preferences } from '@capacitor/preferences';
    // const { value } = await Preferences.get({ key });
    // return value ? JSON.parse(value) : defaultValue;
    
    return storage.get(key, defaultValue);
  },

  async set<T>(key: string, value: T): Promise<void> {
    // TODO: Quando instalar @capacitor/preferences:
    // await Preferences.set({ key, value: JSON.stringify(value) });
    
    storage.set(key, value);
  },

  async remove(key: string): Promise<void> {
    // TODO: Quando instalar @capacitor/preferences:
    // await Preferences.remove({ key });
    
    storage.remove(key);
  },
};

// ============================================
// REACT HOOK
// ============================================

/**
 * Hook para usar storage com React state
 * (compatível com useLocalStorage existente)
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.get(key, initialValue);
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error(`[useStorage] Erro ao salvar "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

