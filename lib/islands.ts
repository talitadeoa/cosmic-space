/**
 * 🏝️ Consolidação de Ilhas
 *
 * Single source of truth para todas as ilhas do Flua
 * Evita duplicação de ID e metadata em múltiplos arquivos
 */

/**
 * IDs únicos das ilhas disponíveis
 */
export type IslandId = 'ilha1' | 'ilha2' | 'ilha3' | 'ilha4';

/**
 * Metadata completo de cada ilha
 */
export interface IslandMetadata {
  id: IslandId;
  nome: string;
  label: string;
  descricao?: string;
  icon?: string;
  cor?: string;
}

/**
 * Registro de todas as ilhas com seus metadados
 */
export const ISLANDS: Record<IslandId, IslandMetadata> = {
  ilha1: {
    id: 'ilha1',
    nome: 'Plataforma Criativa',
    label: 'ILHA 1',
    descricao: 'Espaço para ideias criativas e inovação',
    icon: '✨',
    cor: '#FFD700',
  },
  ilha2: {
    id: 'ilha2',
    nome: 'Pier da Comunidade',
    label: 'ILHA 2',
    descricao: 'Conexão e colaboração com outros navegantes',
    icon: '🤝',
    cor: '#87CEEB',
  },
  ilha3: {
    id: 'ilha3',
    nome: 'Ilha Central',
    label: 'ILHA 3',
    descricao: 'Centro de todas as operações e sincronizações',
    icon: '🏛️',
    cor: '#DDA0DD',
  },
  ilha4: {
    id: 'ilha4',
    nome: 'Zona de Encontros',
    label: 'ILHA 4',
    descricao: 'Espaço de reunião e compartilhamento',
    icon: '🌍',
    cor: '#90EE90',
  },
} as const;

/**
 * Lista ordenada de IDs de ilhas
 */
export const ISLAND_IDS: readonly IslandId[] = ['ilha1', 'ilha2', 'ilha3', 'ilha4'] as const;

/**
 * Obtém metadata de uma ilha pelo ID
 * @param id - ID da ilha
 * @returns Metadata da ilha ou undefined
 */
export const getIsland = (id: IslandId): IslandMetadata => ISLANDS[id];

/**
 * Obtém todos os nomes de ilhas
 */
export const getIslandNames = (): Record<IslandId, string> => {
  return {
    ilha1: ISLANDS.ilha1.nome,
    ilha2: ISLANDS.ilha2.nome,
    ilha3: ISLANDS.ilha3.nome,
    ilha4: ISLANDS.ilha4.nome,
  };
};

/**
 * Valida se um valor é um IslandId válido
 */
export const isValidIslandId = (id: unknown): id is IslandId => {
  return ['ilha1', 'ilha2', 'ilha3', 'ilha4'].includes(id as string);
};
