import {
  SyncConfig,
  SyncState,
  SyncMetadata,
  SyncCallbacks,
  InitializeOptions,
} from './SyncEngine.types';
import { normalizeConfig, createEmptyState, createEmptyMetadata, createLogger, } from './SyncEngine.utils';

/**
 * Generic push/pull sync engine com suporte a offline-first e retry automático.
 *
 * Fluxo:
 * 1. Inicializa com estado local + callbacks (push/pull/merge/storage)
 * 2. Mantém dois estados: local (para usar na UI) e remote (última versão do servidor)
 * 3. Quando updateLocal() é chamado → debounce + enfileira para push
 * 4. Polling periódico executa: PUSH (enviar pendentes) → PULL (buscar mudanças) → MERGE
 * 5. Retry automático com exponential backoff em caso de falha
 *
 * @example
 * ```typescript
 * const engine = new SyncEngine({
 *   name: 'todos',
 *   debounceMs: 500,
 *   syncIntervalMs: 5000,
 *   push: async (local) => ({ applied: [...], conflicts: [] }),
 *   pull: async (cursor) => ({ data: {...}, cursor: 'v2', version: 2 }),
 *   merge: (local, remote) => ({ ...local, ...remote }),
 *   saveMeta: async (meta) => {},
 * });
 *
 * await engine.initialize(todos, metadata);
 * engine.subscribe(state => console.log('Sync state:', state));
 * engine.updateLocal(newTodos);
 * ```
 */
export class SyncEngine<T> {
  private state: SyncState<T>;
  private metadata: SyncMetadata;
  private config: any;
  private callbacks: Partial<SyncCallbacks<T>>;
  private listeners: Set<(state: Readonly<SyncState<T>>) => void>;
  private log: (...args: unknown[]) => void;

  private syncIntervalRef: NodeJS.Timeout | null = null;
  private debounceTimeoutRef: NodeJS.Timeout | null = null;
  private isSyncInProgress = false;
  private isDisposed = false;

  constructor(config: SyncConfig<T> & SyncCallbacks<T>) {
    this.config = normalizeConfig(config as any);
    this.callbacks = {
      push: config.push,
      pull: config.pull,
      merge: config.merge,
      saveMeta: config.saveMeta,
      onSyncError: config.onSyncError,
      onPendingChange: config.onPendingChange,
    };
    this.listeners = new Set();
    this.log = createLogger(this.config.name, this.config.debug);
    this.state = createEmptyState<T>({} as T);
    this.metadata = createEmptyMetadata();
  }

  /**
   * Inicializar com dados locais e metadados armazenados.
   * Dispara primeiro sync imediatamente + polling periódico.
   */
  async initialize(local: T, options: InitializeOptions = {}): Promise<void> {
    const { startPolling: shouldStartPolling = true, syncOnInit = true } = options;
    
    if (this.state.isLoaded) {
      console.warn(`[${this.config.name}] Já foi inicializado`);
      return;
    }

    this.state.local = local;
    this.state.isLoaded = true;
    this.state.remote = null;
    this.state.remoteVersion = this.metadata.remoteVersion;
    this.state.lastSyncAt = this.metadata.lastSyncAt;

    this.emitStateChange();
    this.log('Inicializado com dados locais');

    // Iniciar polling se habilitado
    if (shouldStartPolling) {
      this.startPolling(syncOnInit);
    }
  }

  /**
   * Atualizar dados locais com debounce e marcar como pendente.
   * Suprime callback de outbox para evitar ciclos infinitos.
   */
  updateLocal(fn: (current: T) => T): void {
    this.updateLocalSuppressed(fn);
  }

  /**
   * Versão interna que atualiza sem suprimir outbox callback.
   */
  updateLocalSuppressed(fn: (current: T) => T): void {
    this.state.local = fn(this.state.local);
    this.state.hasPending = true;
    this.callbacks.onPendingChange?.(true);
    this.emitStateChange();

    // Debounce para enviar mudanças
    this.debounceSync();
  }

  /**
   * Forçar sincronização imediata.
   */
  async syncNow(): Promise<void> {
    this.clearDebounceTimeout();
    await this.executeSyncCycle();
  }

  /**
   * Pausar polling (mas mantém engine ativo).
   */
  pause(): void {
    this.stopPolling();
    this.log('Pausado');
  }

  /**
   * Retomar polling.
   */
  resume(): void {
    this.log('Resumindo...');
    this.startPolling(false);
  }

  /**
   * Inscrever para mudanças de estado.
   * Retorna função para cancelar subscrição.
   */
  subscribe(listener: (state: Readonly<SyncState<T>>) => void): () => void {
    this.listeners.add(listener);
    // Emitir estado atual imediatamente
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
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

      if (this.callbacks.saveMeta) {
        await Promise.resolve(this.callbacks.saveMeta(this.metadata));
      }

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
      if (!this.callbacks.push) return;
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
      if (!this.callbacks.pull) return;
      const result = await this.callbacks.pull(this.metadata.cursor);

      if (result.data) {
        this.log('Pull: dados recebidos, fazendo merge');

        // Fazer merge suprimindo outbox para evitar ciclos
        if (!this.callbacks.merge) return;
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
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(`[${this.config.name}] Listener error:`, error);
      }
    });
  }
}
