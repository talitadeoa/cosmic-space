/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 Motor de Sincronização Refatorado                          ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  VERSÃO LEGADA - USE SyncEngine.refactor.ts PARA NOVOS PROJETOS           ║
 * ║                                                                            ║
 * ║  Este arquivo foi refatorado em:                                          ║
 * ║  - SyncEngine.types.ts     → Tipos e interfaces                           ║
 * ║  - SyncEngine.strategies.ts → Estratégias de retry/merge                  ║
 * ║  - SyncEngine.utils.ts     → Funções auxiliares                           ║
 * ║  - SyncEngine.core.ts      → Classe principal SyncEngine                  ║
 * ║  - SyncEngine.refactor.ts  → Exports consolidados                         ║
 * ║                                                                            ║
 * ║  Este arquivo é mantido apenas para compatibilidade com código legado.    ║
 * ║  Para novos código: import { SyncEngine } from './SyncEngine.refactor'    ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

// Re-exportar tudo dos novos módulos para compatibilidade
export * from './SyncEngine.refactor';
