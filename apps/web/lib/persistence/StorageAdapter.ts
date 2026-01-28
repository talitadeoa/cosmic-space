/**
 * 💾 StorageAdapter - Interface de Abstração
 * 
 * Define contrato que qualquer implementação de storage deve seguir.
 * Permite trocar localStorage por Capacitor Preferences sem quebrar código.
 */

/**
 * Interface genérica para qualquer camada de storage
 * Implementado por: WebStorageAdapter, CapacitorStorageAdapter
 */
export interface StorageAdapter {
  /**
   * Obtém valor (síncrono para inicialização)
   * Preferir getAsync para novas operações
   */
  get<T>(key: string, defaultValue: T): T;

  /**
   * Obtém valor (assíncrono - Capacitor-ready)
   */
  getAsync<T>(key: string, defaultValue: T): Promise<T>;

  /**
   * Salva valor (síncrono)
   * Preferir setAsync para novas operações
   */
  set<T>(key: string, value: T): boolean;

  /**
   * Salva valor (assíncrono - Capacitor-ready)
   */
  setAsync<T>(key: string, value: T): Promise<boolean>;

  /**
   * Remove chave (síncrono)
   */
  remove(key: string): boolean;

  /**
   * Remove chave (assíncrono)
   */
  removeAsync(key: string): Promise<boolean>;

  /**
   * Verifica se chave existe
   */
  has(key: string): boolean;

  /**
   * Lista todas as chaves
   */
  keys(): string[];
}

/**
 * Tipos de eventos de storage para sincronização
 */
export type StorageEventType = 'set' | 'remove' | 'clear';

export interface StorageEvent {
  type: StorageEventType;
  key: string;
  value?: any;
  timestamp: number;
}

/**
 * Callback para observar mudanças
 */
export type StorageObserver = (event: StorageEvent) => void;

/**
 * Interface com suporte a observadores
 */
export interface ObservableStorageAdapter extends StorageAdapter {
  /**
   * Observa mudanças em uma chave específica
   */
  observe(key: string, callback: StorageObserver): () => void;

  /**
   * Observa todas as mudanças
   */
  observeAll(callback: StorageObserver): () => void;
}
