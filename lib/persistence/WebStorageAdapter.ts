/**
 * 💾 WebStorageAdapter - Implementação localStorage
 * 
 * Camada de abstração sobre localStorage que segue StorageAdapter.
 * Preparado para ser substituído por CapacitorStorageAdapter em mobile.
 */

'use client';

import type { ObservableStorageAdapter, StorageEvent, StorageObserver } from './StorageAdapter';

/**
 * Implementação localStorage da interface StorageAdapter
 * Suporta observadores para sincronização reativa
 */
export class WebStorageAdapter implements ObservableStorageAdapter {
  private observers: Map<string, Set<StorageObserver>> = new Map();
  private allObservers: Set<StorageObserver> = new Set();
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      // Sincroniza mudanças entre abas
      window.addEventListener('storage', (event) => {
        if (event.key) {
          this.notifyObservers(event.key, 'set', event.newValue);
        }
      });
    }
  }

  /**
   * Obtém valor do localStorage (síncrono)
   */
  get<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[WebStorageAdapter] Erro ao ler "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Obtém valor do localStorage (assíncrono para compatibilidade com Capacitor)
   */
  async getAsync<T>(key: string, defaultValue: T): Promise<T> {
    // Sem operações I/O reais, mas mantém interface consistente
    return Promise.resolve(this.get(key, defaultValue));
  }

  /**
   * Salva valor no localStorage (síncrono)
   */
  set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;

    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);

      // Notifica observadores
      this.notifyObservers(key, 'set', value);

      return true;
    } catch (error) {
      console.error(`[WebStorageAdapter] Erro ao salvar "${key}":`, error);
      return false;
    }
  }

  /**
   * Salva valor no localStorage (assíncrono para compatibilidade com Capacitor)
   */
  async setAsync<T>(key: string, value: T): Promise<boolean> {
    return Promise.resolve(this.set(key, value));
  }

  /**
   * Remove chave do localStorage (síncrono)
   */
  remove(key: string): boolean {
    if (!this.isClient) return false;

    try {
      localStorage.removeItem(key);

      // Notifica observadores
      this.notifyObservers(key, 'remove', undefined);

      return true;
    } catch (error) {
      console.error(`[WebStorageAdapter] Erro ao remover "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove chave do localStorage (assíncrono)
   */
  async removeAsync(key: string): Promise<boolean> {
    return Promise.resolve(this.remove(key));
  }

  /**
   * Verifica se chave existe
   */
  has(key: string): boolean {
    if (!this.isClient) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Lista todas as chaves
   */
  keys(): string[] {
    if (!this.isClient) return [];
    return Object.keys(localStorage);
  }

  /**
   * Observa mudanças em uma chave específica
   * Retorna função para desinscrever
   */
  observe(key: string, callback: StorageObserver): () => void {
    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }

    this.observers.get(key)!.add(callback);

    // Retorna função de desinscrição
    return () => {
      this.observers.get(key)?.delete(callback);
    };
  }

  /**
   * Observa todas as mudanças
   * Retorna função para desinscrever
   */
  observeAll(callback: StorageObserver): () => void {
    this.allObservers.add(callback);

    return () => {
      this.allObservers.delete(callback);
    };
  }

  /**
   * (Privado) Notifica observadores sobre mudanças
   */
  private notifyObservers(
    key: string,
    type: StorageEvent['type'],
    value?: any
  ): void {
    const event: StorageEvent = {
      type,
      key,
      value,
      timestamp: Date.now(),
    };

    // Notifica observadores específicos da chave
    this.observers.get(key)?.forEach((cb) => cb(event));

    // Notifica todos os observadores
    this.allObservers.forEach((cb) => cb(event));
  }
}

/**
 * Instância singleton do WebStorageAdapter
 */
export const webStorageAdapter = new WebStorageAdapter();
