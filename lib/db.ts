import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type DbClient = NeonQueryFunction<any, any>;

let cachedClient: DbClient | null = null;

export function getDb(): DbClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada. Defina a URL do Neon no .env.local");
  }

  if (!cachedClient) {
    cachedClient = neon(connectionString);
  }

  return cachedClient;
}
