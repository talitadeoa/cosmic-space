/**
 * Compatibilidade: Mapeamento de tipos legados
 * 
 * Este arquivo serve como ponte entre os imports antigos (@/types)
 * e os novos imports (@/domains/[domain]/types)
 * 
 * A medida que cada domínio é migrado, remover as re-exportações aqui
 */

// Re-export de domains que já têm barrel exports
export * from '@/domains/todo';

// Tipos temporários que ainda não foram criados
export type MoonPhase = 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
export type TimelineItemType = 'mensal' | 'trimestral' | 'anual' | 'energia';

// TODO: Migrar para seus respectivos domínios
// export * from '@/domains/astro';
// export * from '@/domains/lunar-cycle';
// export * from '@/domains/insights';
// export * from '@/domains/community';
// export * from '@/domains/auth';
