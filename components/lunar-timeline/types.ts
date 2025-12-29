/**
 * Tipos para o componente de Timeline Lunar Interativa
 * Visualização contínua e contemplativa das fases da Lua
 */

/**
 * Dados lunares calculados para um instante específico
 */
export interface MoonData {
  /** Fração iluminada da Lua (0.0 = nova, 0.5 = quarto, 1.0 = cheia) */
  illumination: number;
  
  /** Fração de fase no ciclo completo (0.0 - 1.0) */
  phaseFraction: number;
  
  /** Se a Lua está crescente (true) ou minguante (false) */
  isWaxing: boolean;
  
  /** Nome legível da fase atual */
  phaseName: string;
  
  /** Ângulo de rotação do terminator em graus (0-360) */
  terminatorAngle: number;
  
  /** Data/hora do cálculo */
  date: Date;
  
  /** Dias desde a última lua nova */
  daysSinceNew: number;
  
  /** Idade da lua em dias (0-29.53) */
  lunarAge: number;
}

/**
 * Configuração da timeline horizontal
 */
export interface TimelineConfig {
  /** Data inicial visível na timeline */
  startDate: Date;
  
  /** Data final visível na timeline */
  endDate: Date;
  
  /** Intervalo entre marcações principais (em horas) */
  majorTickInterval: number;
  
  /** Intervalo entre marcações secundárias (em horas) */
  minorTickInterval: number;
  
  /** Largura da timeline em pixels */
  width: number;
  
  /** Pixels por hora */
  scale: number;
}

/**
 * Estado do scrubbing/drag
 */
export interface ScrubState {
  /** Se está atualmente arrastando */
  isDragging: boolean;
  
  /** Posição X inicial do drag */
  startX: number;
  
  /** Offset acumulado em pixels */
  offsetX: number;
  
  /** Velocidade do drag (pixels/ms) */
  velocity: number;
  
  /** Timestamp do último evento */
  lastTime: number;
}

/**
 * Propriedades para renderização da Lua
 */
export interface MoonRenderProps {
  /** Dados lunares atuais */
  moonData: MoonData;
  
  /** Tamanho do canvas em pixels */
  size: number;
  
  /** Se deve animar transições */
  animate?: boolean;
  
  /** Qualidade da renderização (1-3) */
  quality?: 'low' | 'medium' | 'high';
  
  /** Callback quando a renderização estiver completa */
  onRenderComplete?: () => void;
}

/**
 * Dia na timeline
 */
export interface TimelineDay {
  /** Data completa */
  date: Date;
  
  /** Abreviação do dia da semana (SEG, TER, etc) */
  dayAbbr: string;
  
  /** Dia do mês (1-31) */
  dayOfMonth: number;
  
  /** Se é hoje */
  isToday: boolean;
  
  /** Se é fim de semana */
  isWeekend: boolean;
  
  /** Posição X na timeline */
  x: number;
}

/**
 * Ponto de marcação na timeline
 */
export interface TimelineTick {
  /** Timestamp */
  time: Date;
  
  /** Posição X */
  x: number;
  
  /** Tipo de marcação */
  type: 'hour' | 'day' | 'major';
  
  /** Label opcional */
  label?: string;
}

/**
 * Propriedades do componente principal
 */
export interface LunarTimelineProps {
  /** Data inicial (padrão: agora) */
  initialDate?: Date;
  
  /** Callback quando a data mudar */
  onDateChange?: (date: Date, moonData: MoonData) => void;
  
  /** Timezone (padrão: local) */
  timezone?: string;
  
  /** Localização geográfica opcional */
  location?: {
    latitude: number;
    longitude: number;
  };
  
  /** Se deve mostrar informações detalhadas */
  showDetails?: boolean;
  
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Opções de cache para cálculos lunares
 */
export interface MoonDataCacheOptions {
  /** Tamanho máximo do cache */
  maxSize: number;
  
  /** TTL em milissegundos */
  ttl: number;
  
  /** Precisão em minutos (para agrupamento de cache) */
  precision: number;
}

/**
 * Resultado de cálculo de fase lunar
 */
export interface LunarPhaseCalculation {
  /** Fase atual (0-7) */
  phase: number;
  
  /** Iluminação (0-1) */
  illumination: number;
  
  /** Ângulo (0-360) */
  angle: number;
  
  /** Nome da fase */
  name: string;
}

/**
 * Constantes de fases lunares
 */
export enum MoonPhase {
  NEW = 'Nova',
  WAXING_CRESCENT = 'Crescente',
  FIRST_QUARTER = 'Quarto Crescente',
  WAXING_GIBBOUS = 'Gibosa Crescente',
  FULL = 'Cheia',
  WANING_GIBBOUS = 'Gibosa Minguante',
  LAST_QUARTER = 'Quarto Minguante',
  WANING_CRESCENT = 'Minguante'
}

/**
 * Configuração de renderização da Lua
 */
export interface MoonRenderConfig {
  /** Cor de base da Lua */
  moonColor: string;
  
  /** Cor da sombra */
  shadowColor: string;
  
  /** Cor do ambiente (luz refletida da Terra) */
  earthshineColor: string;
  
  /** Intensidade do earthshine (0-1) */
  earthshineIntensity: number;
  
  /** Suavidade do terminator (0-1) */
  terminatorSoftness: number;
  
  /** Se deve renderizar crateras */
  showCraters: boolean;
  
  /** Se deve renderizar brilho */
  showGlow: boolean;
}
