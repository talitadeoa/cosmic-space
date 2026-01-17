/**
 * Script descontinuado: Sincronização de lunações do Google Sheets
 * 
 * Motivo: Removida em favor da solução USNO (U.S. Naval Observatory)
 * Nova abordagem: Usar `lib/usno-client.ts` para capturar dados via API oficial
 * 
 * Para sincronizar, use:
 * ```typescript
 * import { getMoonPhases } from '@/lib/usno-client';
 * const phases = await getMoonPhases(2025);
 * ```
 */

console.error('❌ Este script foi descontinuado. Use usno-client.ts em vez disso.');

