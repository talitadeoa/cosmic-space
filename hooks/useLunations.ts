/**
 * @deprecated Importe de @/domains/lunar-cycle em vez de @/hooks/useLunations
 * Este arquivo será removido em versões futuras.
 */

'use client';

export {
  useLunations,
  useLunationsForRange,
  fetchLunations,
  type LunationDay,
  type LunationsResponse,
} from '@/domains/lunar-cycle/hooks/useLunations';
