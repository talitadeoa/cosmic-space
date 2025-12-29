/**
 * 🌙 Tipos e Interfaces Centralizadas de Lunações
 *
 * Single source of truth para definições de lunações em todo o projeto
 */

/**
 * Dados de uma lunação (evento lunar)
 */
export interface LunationData {
  lunation_date: string; // ISO YYYY-MM-DD
  moon_phase: string;
  zodiac_sign: string;
  illumination?: number;
  age_days?: number;
  description?: string;
  source?: string; // 'generated' | 'synced' | 'manual'
}
