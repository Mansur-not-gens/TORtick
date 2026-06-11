import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Supabase Postgres requires SSL; without this, connections hang/time out.
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
});

export async function query<T>(text: string, params: unknown[] = []) {
  const res = await pool.query<T>(text, params);
  return res;
}

