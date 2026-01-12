/**
 * 💾 Storage Utility - Capacitor-Ready
 * 
 * Abstração sobre localStorage que funciona em Web e Mobile.
 * Automaticamente usa Capacitor Preferences quando disponível.
 * 
 * USO:
 * ```ts
 * // Síncrono (Web - para inicialização de state)
 * const value = storage.get('key', defaultValue);
 * storage.set('key', value);
 * 
 * // Assíncrono (Capacitor-ready)
 * const value = await storage.getAsync('key', defaultValue);
 * await storage.setAsync('key', value);
 * ```
 */

'use client';

// Detecta ambiente Capacitor
const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

// Cache do módulo Preferences
let PreferencesModule: any = null;

const getPreferences = async (): Promise<any> => {
  if (!PreferencesModule && isCapacitor()) {
    try {
      // @ts-ignore - Import dinâmico do Capacitor (só disponível quando instalado)
      const mod = await import('@capacitor/preferences');
      PreferencesModule = mod.Preferences;
    } catch {
      // Capacitor não instalado - usa localStorage como fallback
      PreferencesModule = null;
    }
  }
  return PreferencesModule;
};

/**
 * Storage class com fallback automático
 * Web: localStorage
 * Mobile: Capacitor Preferences
 */
class StorageManager {
  private isClient = typeof window !== 'undefined';

  /**
   * Obtém valor do storage (síncrono - localStorage)
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
   * Obtém valor do storage (assíncrono - Capacitor-ready)
   */
  async getAsync<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.isClient) return defaultValue;

    const Preferences = await getPreferences();

    if (Preferences) {
      try {
        const { value } = await Preferences.get({ key });
        if (value === null) return defaultValue;
        return JSON.parse(value) as T;
      } catch {
        return defaultValue;
      }
    }

    return this.get(key, defaultValue);
  }

  /**
   * Salva valor no storage (síncrono - localStorage)
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
   * Salva valor no storage (assíncrono - Capacitor-ready)
   */
  async setAsync<T>(key: string, value: T): Promise<boolean> {
    if (!this.isClient) return false;

    const Preferences = await getPreferences();

    if (Preferences) {
      try {
        await Preferences.set({ key, value: JSON.stringify(value) });
        return true;
      } catch (error) {
        console.error(`[Storage] Erro Capacitor ao salvar "${key}":`, error);
        return false;
      }
    }

    return this.set(key, value);
  }

  /**
   * Remove valor do storage (síncrono)
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
   * Remove valor do storage (assíncrono - Capacitor-ready)
   */
  async removeAsync(key: string): Promise<boolean> {
    if (!this.isClient) return false;

    const Preferences = await getPreferences();

    if (Preferences) {
      try {
        await Preferences.remove({ key });
        return true;
      } catch (error) {
        console.error(`[Storage] Erro ao remover "${key}":`, error);
        return false;
      }
    }

    return this.remove(key);
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

/**
 * Chaves de storage usadas no app
 * Centraliza nomes para evitar typos
 */
export const STORAGE_KEYS = {
  AUTH_STATE: 'flua-auth-state',
  TODOS: 'flua_todos_salvos',
  PLANET_STATE: 'flua_planet_state',
  PLANET_META: 'flua_planet_meta',
  PHASE_INPUTS: 'flua_phase_inputs',
  CYCLE_RECORDS: 'cycle_records',
  EMOTIONS: 'flua_emotions',
  DEVICE_ID: 'flua_device_id',
  SFX_ENABLED: 'flua_sfx_enabled',
  LUNATIONS_CACHE: 'flua_lunations_cache',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Hook para usar storage com React state
 * (compatível com useLocalStorage existente)
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    return storage.get(key, initialValue);
  });

  // Memoizar setValue para estabilizar referência e evitar re-renders
  const setValue = React.useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        storage.set(key, valueToStore);
        return valueToStore;
      });
    } catch (error) {
      console.error(`[useStorage] Erro ao salvar "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

// React import (apenas se usado)
import React from 'react';
