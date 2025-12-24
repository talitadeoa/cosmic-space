// lib/auth.ts
import 'server-only';
import crypto from 'crypto';

// Em memória: map token -> payload (ex: { email, provider })
// Em produção use JWT ou um armazenamento persistente.
const tokens = new Map<string, Record<string, any>>();
const validCredentials = {
  password: process.env.AUTH_PASSWORD || 'cosmos2025',
};

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createAuthToken(payload: Record<string, any> = {}): string {
  const token = generateToken();
  tokens.set(token, payload || {});
  return token;
}

export function validateToken(token: string): boolean {
  return tokens.has(token);
}

export function getTokenPayload(token: string): Record<string, any> | null {
  return tokens.get(token) ?? null;
}

export function validatePassword(password: string): boolean {
  return password === validCredentials.password;
}

export function revokeToken(token: string): void {
  tokens.delete(token);
}
