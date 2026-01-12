/**
 * Tipos compartilhados para SyncEngine
 */

export interface SyncConfig<T = unknown> {
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
  /** Enviar mudanças locais para servidor */
  push?: (local: T) => Promise<PushResult>;
  /** Buscar mudanças do servidor */
  pull?: (cursor: number | null) => Promise<PullResult<T>>;
  /** Merge de dados locais com alterações do servidor */
  merge?: (local: T, remote: T | null) => T;
  /** Persistir metadados de sincronização */
  saveMeta?: (meta: SyncMetadata) => void | Promise<void>;
  /** Callback opcional chamado em erros de sync */
  onSyncError?: (error: Error) => void;
  /** Callback opcional chamado quando há mudanças pendentes */
  onPendingChange?: (hasPending: boolean) => void;
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
  push: (local: T) => Promise<PushResult>;
  pull: (cursor: number | null) => Promise<PullResult<T>>;
  merge: (local: T, remote: T | null) => T;
  saveLocal: (state: T) => void | Promise<void>;
  loadLocal: () => T | Promise<T>;
  saveMeta: (meta: SyncMetadata) => void | Promise<void>;
  loadMeta: () => SyncMetadata | Promise<SyncMetadata>;
  onPendingChange?: (hasPending: boolean) => void;
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
