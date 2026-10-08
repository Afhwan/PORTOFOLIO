import "server-only";
import { Pool } from "@neondatabase/serverless";

let pool: Pool | undefined;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Neon is not configured. Set DATABASE_URL in the server environment.");
  }

  pool ??= new Pool({ connectionString });
  return pool;
}
