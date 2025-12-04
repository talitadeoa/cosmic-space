// lib/auth.ts
import crypto from 'crypto';

// Simples sistema de tokens em memória (em produção, use JWT + banco de dados)
const tokens = new Set<string>();
const validCredentials = {
  password: process.env.AUTH_PASSWORD || 'cosmos2025'
};

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createAuthToken(): string {
  const token = generateToken();
  tokens.add(token);
  return token;
}

export function validateToken(token: string): boolean {
  return tokens.has(token);
}

export function validatePassword(password: string): boolean {
  return password === validCredentials.password;
}

export function revokeToken(token: string): void {
  tokens.delete(token);
}
