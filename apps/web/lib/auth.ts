/**
 * @deprecated Importe de @/server em vez de @/lib/auth
 * Este arquivo será removido em versões futuras.
 */
export {
  generateToken,
  createAuthToken,
  validateToken,
  getTokenPayload,
  hashPassword,
  validatePassword,
  revokeToken,
} from '@/server/auth';
