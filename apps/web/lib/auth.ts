// lib/auth.ts
import 'server-only';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

const DEFAULT_TOKEN_TTL_SECONDS = 24 * 60 * 60;
const BCRYPT_ROUNDS = 10;

const resolveTokenTtlSeconds = (): number | null => {
  const raw = process.env.AUTH_TOKEN_TTL_SECONDS;
  if (!raw) return DEFAULT_TOKEN_TTL_SECONDS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_TOKEN_TTL_SECONDS;
  if (parsed <= 0) return null;
  return Math.floor(parsed);
};

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createAuthToken(payload: Record<string, any> = {}): Promise<string> {
  const token = generateToken();
  const ttlSeconds = resolveTokenTtlSeconds();
  const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
  const db = getDb();

  await db`
    INSERT INTO auth_tokens (token, payload, expires_at)
    VALUES (${token}, ${payload ?? {}}, ${expiresAt})
  `;

  return token;
}

export async function validateToken(token: string): Promise<boolean> {
  const db = getDb();
  const rows = (await db`
    SELECT expires_at
    FROM auth_tokens
    WHERE token = ${token}
    LIMIT 1
  `) as Array<{ expires_at: string | null }>;

  if (!rows.length) return false;
  const expiresAt = rows[0]?.expires_at ? new Date(rows[0].expires_at) : null;
  if (expiresAt && expiresAt <= new Date()) {
    await db`DELETE FROM auth_tokens WHERE token = ${token}`;
    return false;
  }
  return true;
}

export async function getTokenPayload(token: string): Promise<Record<string, any> | null> {
  const db = getDb();
  const rows = (await db`
    SELECT payload, expires_at
    FROM auth_tokens
    WHERE token = ${token}
    LIMIT 1
  `) as Array<{ payload: Record<string, any> | null; expires_at: string | null }>;

  if (!rows.length) return null;
  const expiresAt = rows[0]?.expires_at ? new Date(rows[0].expires_at) : null;
  if (expiresAt && expiresAt <= new Date()) {
    await db`DELETE FROM auth_tokens WHERE token = ${token}`;
    return null;
  }
  return rows[0]?.payload ?? null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function revokeToken(token: string): Promise<void> {
  const db = getDb();
  await db`DELETE FROM auth_tokens WHERE token = ${token}`;
}
