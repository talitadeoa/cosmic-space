/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    Motor de Sincronização Reutilizável                     ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  Abstração agnóstica de domínio para sincronizar estado local ↔ remoto    ║
 * ║  com suporte a:                                                            ║
 * ║                                                                            ║
 * ║  ✓ Debounce          - Agrupar mudanças rápidas                           ║
 * ║  ✓ Optimistic Update - Aplicar local antes de confirmar servidor          ║
 * ║  ✓ Retry Automático  - Exponential backoff em falhas                      ║
 * ║  ✓ Conflict Detect   - Identificar e reportar conflitos de versão         ║
 * ║  ✓ Offline-First     - Funciona sem conexão, sincroniza quando online     ║
 * ║                                                                            ║
 * ║  Padrão: separar INFRAESTRUTURA (push/pull) de DOMÍNIO (business logic)   ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 * 
 * @example
 * ```typescript
 * const engine = new SyncEngine<Todo[]>(
 *   [],
 *   { push, pull, merge, saveLocal, loadLocal, saveMeta, loadMeta },
 *   { debounceMs: 500, maxRetries: 3 }
 * );
 * 
 * await engine.initialize();
 * engine.updateLocal(todos => [...todos, newTodo]); // Optimistic + enqueue
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SyncConfig {
  /** Intervalo de polling em ms (default: 10000) */
  syncIntervalMs?: number;
  /** Delay inicial antes do primeiro sync em ms (default: 100) */
  initialDelayMs?: number;
  /** Máximo de tentativas de retry (default: 3) */
  maxRetries?: number;
  /** Delay base entre retries em ms - usa exponential backoff (default: 1000) */
  retryDelayMs?: number;
  /** Debounce para mudanças locais em ms (default: 300) */
  debounceMs?: number;
  /** Se deve fazer retry automático (default: true) */
  autoRetry?: boolean;
  /** Nome do domínio para logs (default: 'SyncEngine') */
  name?: string;
  /** Habilitar logs de debug (default: false) */
  debug?: boolean;
}

export interface SyncState<T> {
  /** Estado local atual */
  local: T;
  /** Estado remoto (última sincronização bem-sucedida) */
  remote: T | null;
  /** Versão do estado remoto */
  remoteVersion: number | null;
  /** Indica se está carregado do storage */
  isLoaded: boolean;
  /** Indica se está sincronizando neste momento */
  isSyncing: boolean;
  /** Erro da última sincronização */
  syncError: Error | null;
  /** Tem mudanças pendentes não sincronizadas */
  hasPending: boolean;
  /** Timestamp da última sincronização bem-sucedida */
  lastSyncAt: string | null;
  /** Número de tentativas de retry pendentes */
  retryCount: number;
}

/** Resultado de uma operação de push */
export interface PushResult {
  /** IDs aplicados com sucesso no servidor */
  applied: Array<{ id: string; version: number; updatedAt: string }>;
  /** IDs que tiveram conflito de versão */
  conflicts: string[];
}

/** Resultado de uma operação de pull */
export interface PullResult<T> {
  /** Dados retornados do servidor (null se não houver mudanças) */
  data: T | null;
  /** Cursor para próxima busca incremental */
  cursor: number | null;
  /** Versão atual do servidor */
  version: number;
}

export interface SyncCallbacks<T> {
  /**
   * Enviar mudanças locais para servidor.
   * Deve implementar a lógica de outbox/queue internamente.
   * 
   * @param local - Estado local completo a sincronizar
   * @returns IDs aplicados com sucesso e conflitos detectados
   * 
   * @example
   * ```typescript
   * push: async (todos) => {
   *   const result = await pushTodoChanges();
   *   return {
   *     applied: result.applied.map(t => ({ id: t.id, version: t.version, updatedAt: t.updatedAt })),
   *     conflicts: result.conflicts ?? []
   *   };
   * }
   * ```
   */
  push: (local: T) => Promise<PushResult>;

  /**
   * Buscar mudanças do servidor (incremental via cursor).
   * 
   * @param cursor - Cursor da última busca (null para busca inicial)
   * @returns Dados novos, próximo cursor e versão atual
   * 
   * @example
   * ```typescript
   * pull: async (cursor) => {
   *   const result = await pullTodoChanges(userId, cursor);
   *   return {
   *     data: result.items,
   *     cursor: result.nextCursor,
   *     version: result.version
   *   };
   * }
   * ```
   */
  pull: (cursor: number | null) => Promise<PullResult<T>>;

  /**
   * Merge de dados locais com alterações do servidor.
   * Responsável por resolver conflitos (last-write-wins, 3-way merge, etc).
   * 
   * @param local - Estado local atual
   * @param remote - Dados vindos do servidor (null se vazio)
   * @returns Estado merged final
   * 
   * @example
   * ```typescript
   * merge: (localTodos, remoteTodos) => {
   *   if (!remoteTodos) return localTodos;
   *   // Last-write-wins por timestamp
   *   return mergeTodosByTimestamp(localTodos, remoteTodos);
   * }
   * ```
   */
  merge: (local: T, remote: T | null) => T;

  /**
   * Persistir estado local (localStorage, IndexedDB, etc).
   * Chamado após cada mudança local.
   */
  saveLocal: (state: T) => void | Promise<void>;

  /**
   * Carregar estado local de storage.
   * Chamado uma vez na inicialização.
   */
  loadLocal: () => T | Promise<T>;

  /**
   * Persistir metadados de sincronização (versão, cursor, etc).
   */
  saveMeta: (meta: SyncMetadata) => void | Promise<void>;

  /**
   * Carregar metadados de sincronização.
   */
  loadMeta: () => SyncMetadata | Promise<SyncMetadata>;

  /**
   * Callback opcional chamado quando há mudanças pendentes.
   * Útil para mostrar indicador de "salvando..." na UI.
   */
  onPendingChange?: (hasPending: boolean) => void;

  /**
   * Callback opcional chamado em erros de sync.
   * Útil para notificações ao usuário.
   */
  onSyncError?: (error: Error) => void;
}

export interface SyncMetadata {
  /** Versão do último pull bem-sucedido */
  remoteVersion: number | null;
  /** Cursor do último pull (para busca incremental) */
  cursor: number | null;
  /** Timestamp da última sincronização bem-sucedida */
  lastSyncAt: string | null;
  /** Retry count para retry automático */
  retryCount: number;
}

/** Opções para inicialização do engine */
export interface InitializeOptions {
  /** Se deve iniciar o polling automaticamente (default: true) */
  startPolling?: boolean;
  /** Se deve fazer sync imediato após carregar (default: true) */
  syncOnInit?: boolean;
}

// ============================================================================
// SYNC ENGINE CLASS
// ============================================================================

/**
 * Motor de sincronização agnóstico de domínio.
 * 
 * ## Responsabilidades:
 * 1. Orquestrar push/pull com retry automático
 * 2. Gerenciar timing (intervalo, debounce, initial delay)
 * 3. Rastrear estado de sincronização
 * 4. Coordenar optimistic updates com suppress de outbox
 * 
 * ## Não cuida de:
 * - Transformação de dados específicos do domínio
 * - Storage específico (localStorage, IndexedDB, etc)
 * - HTTP (abstraído via callbacks)
 * 
 * ## Fluxo de Dados:
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        UPDATE LOCAL                              │
 * │  UI ─→ updateLocal() ─→ optimistic ─→ debounce ─→ push queue   │
 * └─────────────────────────────────────────────────────────────────┘
 *                              ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        SYNC CYCLE                                │
 * │  timer ─→ push() ─→ pull() ─→ merge() ─→ updateLocalSuppressed │
 * └─────────────────────────────────────────────────────────────────┘
 *                              ↓
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        ON ERROR                                  │
 * │  error ─→ retry (exponential backoff) ─→ max retries ─→ fail   │
 * └─────────────────────────────────────────────────────────────────┘
 * ```
 */
export class SyncEngine<T> {
  private config: Required<Omit<SyncConfig, 'name' | 'debug'>> & { name: string; debug: boolean };
  private state: SyncState<T>;
  private metadata: SyncMetadata;
  private callbacks: SyncCallbacks<T>;
  
  private syncIntervalRef: ReturnType<typeof setInterval> | null = null;
  private debounceTimeoutRef: ReturnType<typeof setTimeout> | null = null;
  private isSyncInProgress = false;
  private isDisposed = false;
  private suppressOutbox = false;
  
  private listeners: Set<(state: SyncState<T>) => void> = new Set();

  constructor(
    initialState: T,
    callbacks: SyncCallbacks<T>,
    config: SyncConfig = {}
  ) {
    this.callbacks = callbacks;
    this.config = {
      syncIntervalMs: config.syncIntervalMs ?? 10000,
      initialDelayMs: config.initialDelayMs ?? 100,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      debounceMs: config.debounceMs ?? 300,
      autoRetry: config.autoRetry ?? true,
      name: config.name ?? 'SyncEngine',
      debug: config.debug ?? false,
    };

    this.state = {
      local: initialState,
      remote: null,
      remoteVersion: null,
      isLoaded: false,
      isSyncing: false,
      syncError: null,
      hasPending: false,
      lastSyncAt: null,
      retryCount: 0,
    };

    this.metadata = {
      remoteVersion: null,
      cursor: null,
      lastSyncAt: null,
      retryCount: 0,
    };

    this.log('Criado com config:', this.config);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Inicializar: carregar state/meta do storage e iniciar polling.
   */
  async initialize(options: InitializeOptions = {}): Promise<void> {
    const { startPolling = true, syncOnInit = true } = options;
    
    if (this.state.isLoaded) {
      this.log('Já inicializado, ignorando');
      return;
    }

    this.log('Inicializando...');

    try {
      // Carregar dados do storage (sync ou async)
      const [localData, meta] = await Promise.all([
        Promise.resolve(this.callbacks.loadLocal()),
        Promise.resolve(this.callbacks.loadMeta()),
      ]);

      this.state.local = localData;
      this.metadata = meta;
      this.state.isLoaded = true;
      this.state.remote = null;
      this.state.remoteVersion = meta.remoteVersion;
      this.state.lastSyncAt = meta.lastSyncAt;

      this.log('Dados carregados:', { itemCount: Array.isArray(localData) ? localData.length : 'object', meta });
      this.emitStateChange();

      // Iniciar polling
      if (startPolling) {
        this.startPolling(syncOnInit);
      }
    } catch (error) {
      console.error(`[${this.config.name}] initialize falhou:`, error);
      // Continuar mesmo se falhar a carregar - permitir offline-first
      this.state.isLoaded = true;
      this.emitStateChange();
    }
  }

  /**
   * Atualizar estado local e enfileirar sincronização.
   * Suporte a optimistic updates (aplica imediatamente, sincroniza depois).
   * 
   * @param updater - Função que recebe estado atual e retorna novo estado
   * 
   * @example
   * ```typescript
   * engine.updateLocal(todos => [...todos, newTodo]);
   * engine.updateLocal(todos => todos.filter(t => t.id !== deletedId));
   * ```
   */
  updateLocal(updater: (prev: T) => T): void {
    if (!this.state.isLoaded) {
      this.log('updateLocal ignorado: não carregado ainda');
      return;
    }

    if (this.suppressOutbox) {
      this.log('updateLocal ignorado: suppressOutbox ativo');
      return;
    }

    const prevState = this.state.local;
    const updated = updater(prevState);
    
    // Optimistic update
    this.state.local = updated;
    this.state.hasPending = true;
    
    // Persistir localmente
    void Promise.resolve(this.callbacks.saveLocal(updated));
    
    // Notificar callback de pending
    this.callbacks.onPendingChange?.(true);
    
    this.log('Estado local atualizado, pendente de sync');
    this.emitStateChange();

    // Debounce: adiar sincronização para agrupar mudanças rápidas
    this.debounceSync();
  }

  /**
   * Atualizar sem enfileirar (usado internamente após pull bem-sucedido).
   * Usa suppressOutbox para evitar ciclos de sync.
   */
  updateLocalSuppressed(updater: (prev: T) => T): void {
    if (!this.state.isLoaded) return;

    this.suppressOutbox = true;
    const updated = updater(this.state.local);
    this.state.local = updated;
    
    // Persistir localmente
    void Promise.resolve(this.callbacks.saveLocal(updated));
    
    this.suppressOutbox = false;
    this.emitStateChange();
  }

  /**
   * Forçar sincronização imediata (ignora debounce).
   * Útil para sync antes de fechar app ou em "pull to refresh".
   */
  async syncNow(): Promise<void> {
    if (this.isDisposed || this.isSyncInProgress) {
      this.log('syncNow ignorado:', this.isDisposed ? 'disposed' : 'sync em andamento');
      return;
    }

    this.log('Sync imediato solicitado');
    this.clearDebounceTimeout();
    await this.executeSyncCycle();
  }

  /**
   * Pausar o polling (útil quando app vai para background).
   */
  pause(): void {
    this.log('Pausando polling');
    this.stopPolling();
  }

  /**
   * Retomar o polling (útil quando app volta para foreground).
   */
  resume(): void {
    if (!this.state.isLoaded) return;
    this.log('Retomando polling');
    this.startPolling(true);
  }

  /**
   * Registrar listener de mudanças de estado.
   * Retorna função para cancelar inscrição.
   * 
   * @param callback - Função chamada a cada mudança de estado
   * @returns Função unsubscribe
   */
  subscribe(callback: (state: SyncState<T>) => void): () => void {
    this.listeners.add(callback);
    // Emitir estado atual imediatamente
    callback({ ...this.state });
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Limpar recursos e parar polling.
   * DEVE ser chamado quando o engine não for mais necessário.
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.log('Disposing...');
    this.isDisposed = true;
    this.stopPolling();
    this.clearDebounceTimeout();
    this.listeners.clear();
  }

  /**
   * Getter do estado atual (snapshot).
   */
  getState(): Readonly<SyncState<T>> {
    return { ...this.state };
  }

  /**
   * Getter dos metadados atuais (snapshot).
   */
  getMetadata(): Readonly<SyncMetadata> {
    return { ...this.metadata };
  }

  /**
   * Verificar se o engine está ativo.
   */
  isActive(): boolean {
    return this.state.isLoaded && !this.isDisposed;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[${this.config.name}]`, ...args);
    }
  }

  private startPolling(syncImmediately = true): void {
    if (this.syncIntervalRef) return;

    // Sync inicial após delay
    if (syncImmediately) {
      const initialTimeoutRef = setTimeout(() => {
        if (!this.isDisposed) {
          void this.executeSyncCycle();
        }
      }, this.config.initialDelayMs);
    }

    // Polling periódico
    this.syncIntervalRef = setInterval(() => {
      if (!this.isDisposed && !this.isSyncInProgress) {
        void this.executeSyncCycle();
      }
    }, this.config.syncIntervalMs);

    this.log(`Polling iniciado (intervalo: ${this.config.syncIntervalMs}ms)`);
  }

  private stopPolling(): void {
    if (this.syncIntervalRef) {
      clearInterval(this.syncIntervalRef);
      this.syncIntervalRef = null;
      this.log('Polling parado');
    }
  }

  private debounceSync(): void {
    this.clearDebounceTimeout();
    this.debounceTimeoutRef = setTimeout(() => {
      if (!this.isDisposed && !this.isSyncInProgress) {
        this.log('Debounce expirado, executando sync');
        void this.executeSyncCycle();
      }
    }, this.config.debounceMs);
  }

  private clearDebounceTimeout(): void {
    if (this.debounceTimeoutRef) {
      clearTimeout(this.debounceTimeoutRef);
      this.debounceTimeoutRef = null;
    }
  }

  private async executeSyncCycle(): Promise<void> {
    if (this.isSyncInProgress || this.isDisposed) return;

    this.isSyncInProgress = true;
    this.state.isSyncing = true;
    this.emitStateChange();

    this.log('Iniciando ciclo de sync...');

    try {
      // 1. PUSH: enviar mudanças locais
      if (this.state.hasPending) {
        this.log('Push: enviando mudanças pendentes');
        await this.executePush();
      }

      // 2. PULL: buscar mudanças do servidor
      this.log('Pull: buscando mudanças do servidor');
      await this.executePull();

      // Sucesso: resetar retry count e atualizar timestamps
      this.metadata.retryCount = 0;
      this.state.syncError = null;
      this.state.retryCount = 0;
      this.metadata.lastSyncAt = new Date().toISOString();
      this.state.lastSyncAt = this.metadata.lastSyncAt;

      await Promise.resolve(this.callbacks.saveMeta(this.metadata));
      
      this.log('Ciclo de sync completo com sucesso');
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error(String(error));
      this.state.syncError = syncError;
      console.error(`[${this.config.name}] Sync cycle falhou:`, error);

      // Notificar callback de erro
      this.callbacks.onSyncError?.(syncError);

      // Retry automático com exponential backoff
      if (this.config.autoRetry && this.metadata.retryCount < this.config.maxRetries) {
        this.metadata.retryCount++;
        this.state.retryCount = this.metadata.retryCount;
        await this.scheduleRetry();
      }
    } finally {
      this.isSyncInProgress = false;
      this.state.isSyncing = false;
      this.emitStateChange();
    }
  }

  private async executePush(): Promise<void> {
    try {
      const result = await this.callbacks.push(this.state.local);

      // Atualizar estado baseado no resultado
      if (result.applied.length > 0) {
        this.log(`Push: ${result.applied.length} mudanças aplicadas`);
      }

      // Marcar como sincronizado (exceto se houver conflicts)
      this.state.hasPending = result.conflicts.length > 0;
      this.callbacks.onPendingChange?.(this.state.hasPending);

      if (result.conflicts.length > 0) {
        console.warn(`[${this.config.name}] ${result.conflicts.length} conflitos detectados:`, result.conflicts);
      }
    } catch (error) {
      console.error(`[${this.config.name}] Push falhou:`, error);
      throw error; // Re-throw para retry
    }
  }

  private async executePull(): Promise<void> {
    try {
      const result = await this.callbacks.pull(this.metadata.cursor);

      if (result.data) {
        this.log('Pull: dados recebidos, fazendo merge');
        
        // Fazer merge suprimindo outbox para evitar ciclos
        const merged = this.callbacks.merge(this.state.local, result.data);
        this.updateLocalSuppressed(() => merged);
        
        // Atualizar remote state
        this.state.remote = result.data;
      }

      // Atualizar metadados de cursor/versão
      this.metadata.remoteVersion = result.version;
      this.metadata.cursor = result.cursor;
      this.state.remoteVersion = result.version;
      
      this.log('Pull: cursor atualizado para', result.cursor);
    } catch (error) {
      console.error(`[${this.config.name}] Pull falhou:`, error);
      throw error; // Re-throw para retry
    }
  }

  private async scheduleRetry(): Promise<void> {
    // Exponential backoff: delay * 2^(retryCount-1)
    const delayMs = this.config.retryDelayMs * Math.pow(2, this.metadata.retryCount - 1);
    this.log(`Retry agendado em ${delayMs}ms (tentativa ${this.metadata.retryCount}/${this.config.maxRetries})`);

    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.isDisposed) {
          void this.executeSyncCycle().then(resolve);
        } else {
          resolve();
        }
      }, delayMs);
    });
  }

  private emitStateChange(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach(listener => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(`[${this.config.name}] Listener error:`, error);
      }
    });
  }
}

// ============================================================================
// FACTORY HELPERS
// ============================================================================

/**
 * Criar metadata vazia (útil para primeiro uso).
 */
export function createEmptyMetadata(): SyncMetadata {
  return {
    remoteVersion: null,
    cursor: null,
    lastSyncAt: null,
    retryCount: 0,
  };
}

/**
 * Criar estado inicial vazio (útil para tipagem).
 */
export function createEmptyState<T>(initial: T): SyncState<T> {
  return {
    local: initial,
    remote: null,
    remoteVersion: null,
    isLoaded: false,
    isSyncing: false,
    syncError: null,
    hasPending: false,
    lastSyncAt: null,
    retryCount: 0,
  };
}
