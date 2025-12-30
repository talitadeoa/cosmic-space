/**
 * 📋 Sistema centralizado de logging
 *
 * Fornece formatação consistente e padronizada para logs em toda aplicação.
 *
 * @example
 * import { logger } from '@/lib/logger';
 *
 * logger.info("Iniciando sincronização");
 * logger.success("Dados salvos com sucesso");
 * logger.warn("Atenção: isso pode levar um tempo");
 * logger.error("Falha ao conectar", error);
 */

type LogLevel = 'error' | 'success' | 'info' | 'warn';

const COLORS = {
  error: '\x1b[31m', // Red
  success: '\x1b[32m', // Green
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  reset: '\x1b[0m',
};

const ICONS = {
  error: '❌',
  success: '✅',
  info: 'ℹ️',
  warn: '⚠️',
};

/**
 * Sistema de logging centralizado
 */
export const logger = {
  /**
   * Log de erro
   */
  error: (message: string, error?: any): void => {
    console.error(`${COLORS.error}${ICONS.error} ${message}${COLORS.reset}`, error);
  },

  /**
   * Log de sucesso
   */
  success: (message: string): void => {
    console.warn(`${COLORS.success}${ICONS.success} ${message}${COLORS.reset}`);
  },

  /**
   * Log informativo
   */
  info: (message: string): void => {
    console.warn(`${COLORS.info}${ICONS.info} ${message}${COLORS.reset}`);
  },

  /**
   * Log de aviso
   */
  warn: (message: string): void => {
    console.warn(`${COLORS.warn}${ICONS.warn} ${message}${COLORS.reset}`);
  },

  /**
   * Log de cabeçalho com separador
   */
  header: (emoji: string, title: string): void => {
    const separator = '─'.repeat(title.length + emoji.length + 1);
    console.warn(`\n${emoji} ${title}\n${separator}`);
  },

  /**
   * Log de resultado com contador
   */
  result: (count: number, total: number, label = 'registros'): void => {
    console.warn(`${COLORS.success}✓ ${count}/${total} ${label}${COLORS.reset}`);
  },

  /**
   * Log para indicar progresso (skip)
   */
  skip: (message: string): void => {
    console.warn(`⏭️  ${message}`);
  },
} as const;

/**
 * Sair do processo com erro
 */
export const exitWithError = (message: string, code = 1): never => {
  logger.error(message);
  process.exit(code);
};
