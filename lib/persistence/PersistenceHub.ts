/**
 * 🎯 PersistenceHub - Camada Central de Persistência
 * 
 * Coordena toda a lógica de persistência, isolando React de localStorage.
 * Fornece métodos tipados para cada domínio (menstruação, emoções, etc).
 * Pronto para Capacitor Preferences em mobile.
 */

'use client';

import type {
  StorageAdapter,
  ObservableStorageAdapter,
  StorageObserver,
} from './StorageAdapter';
import { webStorageAdapter } from './WebStorageAdapter';

/**
 * Tipos de domínios de persistência
 */
export type PersistenceDomain =
  | 'emotional'
  | 'menstrual'
  | 'planet'
  | 'todos'
  | 'auth'
  | 'cache';

/**
 * Configuração por domínio
 */
interface DomainConfig {
  /** Prefixo de chave para este domínio */
  prefix: string;
  /** Adapter a usar (padrão: webStorageAdapter) */
  adapter?: StorageAdapter;
  /** TTL em ms (null = sem expiração) */
  ttl?: number | null;
}

/**
 * Mapeamento de domínios para configurações
 */
const DOMAIN_CONFIG: Record<PersistenceDomain, DomainConfig> = {
  emotional: {
    prefix: 'flua:emotional:',
    ttl: null, // Emoções são históricas
  },
  menstrual: {
    prefix: 'flua:menstrual:',
    ttl: null, // Ciclo menstrual é histórico
  },
  planet: {
    prefix: 'flua:planet:',
    ttl: 1000 * 60 * 60 * 24, // 24h para cache de UI
  },
  todos: {
    prefix: 'flua:todos:',
    ttl: null, // Todos são persistentes
  },
  auth: {
    prefix: 'flua:auth:',
    ttl: 1000 * 60 * 60, // 1h para sessão
  },
  cache: {
    prefix: 'flua:cache:',
    ttl: 1000 * 60 * 30, // 30min para caches genéricas
  },
};

/**
 * Valor com timestamp de expiração
 */
interface ExpiringValue<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * Hub central de persistência
 * Fornece interface única para todo o app
 */
class PersistenceHub {
  private adapter: StorageAdapter;
  private observableAdapter: ObservableStorageAdapter | null = null;

  constructor(adapter: StorageAdapter = webStorageAdapter) {
    this.adapter = adapter;
    // Se adapter implementa observadores, guarda referência
    if ('observe' in adapter) {
      this.observableAdapter = adapter as ObservableStorageAdapter;
    }
  }

  /**
   * Define novo adapter (útil para testes ou mudança de implementação)
   */
  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
    if ('observe' in adapter) {
      this.observableAdapter = adapter as ObservableStorageAdapter;
    }
  }

  /**
   * Salva valor em um domínio
   */
  save<T>(domain: PersistenceDomain, key: string, value: T): boolean {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);

    const wrapped: ExpiringValue<T> = {
      value,
      expiresAt: config.ttl ? Date.now() + config.ttl : null,
    };

    return this.adapter.set(fullKey, wrapped);
  }

  /**
   * Salva valor assincronamente (Capacitor-ready)
   */
  async saveAsync<T>(domain: PersistenceDomain, key: string, value: T): Promise<boolean> {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);

    const wrapped: ExpiringValue<T> = {
      value,
      expiresAt: config.ttl ? Date.now() + config.ttl : null,
    };

    return this.adapter.setAsync(fullKey, wrapped);
  }

  /**
   * Carrega valor de um domínio (com validação de TTL)
   */
  load<T>(domain: PersistenceDomain, key: string, defaultValue: T): T {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);

    const wrapped = this.adapter.get<ExpiringValue<T> | null>(fullKey, null);

    if (wrapped === null) {
      return defaultValue;
    }

    // Verifica expiração
    if (wrapped.expiresAt !== null && wrapped.expiresAt < Date.now()) {
      // Remove valor expirado
      this.adapter.remove(fullKey);
      return defaultValue;
    }

    return wrapped.value;
  }

  /**
   * Carrega valor assincronamente (Capacitor-ready)
   */
  async loadAsync<T>(domain: PersistenceDomain, key: string, defaultValue: T): Promise<T> {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);

    const wrapped = await this.adapter.getAsync<ExpiringValue<T> | null>(fullKey, null);

    if (wrapped === null) {
      return defaultValue;
    }

    // Verifica expiração
    if (wrapped.expiresAt !== null && wrapped.expiresAt < Date.now()) {
      // Remove valor expirado
      await this.adapter.removeAsync(fullKey);
      return defaultValue;
    }

    return wrapped.value;
  }

  /**
   * Remove valor de um domínio
   */
  remove(domain: PersistenceDomain, key: string): boolean {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);
    return this.adapter.remove(fullKey);
  }

  /**
   * Remove valor assincronamente
   */
  async removeAsync(domain: PersistenceDomain, key: string): Promise<boolean> {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);
    return this.adapter.removeAsync(fullKey);
  }

  /**
   * Verifica se chave existe em um domínio
   */
  has(domain: PersistenceDomain, key: string): boolean {
    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);
    return this.adapter.has(fullKey);
  }

  /**
   * Lista chaves de um domínio
   */
  keys(domain: PersistenceDomain): string[] {
    const config = DOMAIN_CONFIG[domain];
    return this.adapter
      .keys()
      .filter((k) => k.startsWith(config.prefix))
      .map((k) => k.slice(config.prefix.length));
  }

  /**
   * Limpa todas as chaves de um domínio
   */
  clear(domain: PersistenceDomain): void {
    const keys = this.keys(domain);
    keys.forEach((key) => this.remove(domain, key));
  }

  /**
   * Observa mudanças em uma chave de um domínio
   * Retorna função para desinscrever
   */
  observe(
    domain: PersistenceDomain,
    key: string,
    callback: StorageObserver
  ): (() => void) | null {
    if (!this.observableAdapter) {
      console.warn(
        '[PersistenceHub] Adapter não suporta observadores. Implemente ObservableStorageAdapter.'
      );
      return null;
    }

    const config = DOMAIN_CONFIG[domain];
    const fullKey = this.buildKey(config.prefix, key);

    return this.observableAdapter.observe(fullKey, callback);
  }

  /**
   * (Privado) Constrói chave com prefixo do domínio
   */
  private buildKey(prefix: string, key: string): string {
    return `${prefix}${key}`;
  }
}

/**
 * Instância singleton do PersistenceHub
 */
export const persistenceHub = new PersistenceHub(webStorageAdapter);

/**
 * Tipos exportados para uso em hooks e componentes
 */
export type { StorageObserver };
