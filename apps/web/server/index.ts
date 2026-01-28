/**
 * 🗄️ Server Module - Index
 * 
 * Centraliza todas as funcionalidades server-only.
 * Use este módulo apenas em Server Components ou API Routes.
 * 
 * @example
 * import { getDb, logger, validators } from '@/server';
 */

// Database
export { getDb } from './db';

// Auth
export {
  generateToken,
  createAuthToken,
  validateToken,
  getTokenPayload,
  hashPassword,
  validatePassword,
  revokeToken,
} from './auth';

// Forms
export {
  saveFormEntry,
  listFormEntries,
  type FormEntryInput,
  type FormEntryRow,
  type FormEntryType,
} from './forms';

// Google Sheets
export { appendToSheet, getSheetData } from './sheets';

// Timeline
export { getTimelineEntries, type TimelineQuery } from './timeline';

// Phase Inputs
export {
  savePhaseInput,
  listPhaseInputs,
  type PhaseInputRecord,
  type PhaseInputSave,
} from './phaseInputs';

// Planet Todos
export {
  listPlanetTodos,
  mergePlanetTodos,
  type PlanetTodoRecord,
} from './planetTodos';

// Planet State
export {
  getPlanetState,
  savePlanetState,
} from './planetState';

// Logger
export { logger } from './logger';

// Validators
export { validators, isMoonPhase, isIslandId, isTodoInputType, isPhaseInputType } from './validators';
