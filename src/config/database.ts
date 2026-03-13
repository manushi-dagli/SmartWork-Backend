import { Pool } from "pg";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set; DB operations will fail.");
}

// pg Pool for Better Auth (auth tables + migrate:auth CLI)
const ssl =
  process.env.DATABASE_SSL === "true" ||
  /neon\.tech|supabase\.co|pooler\.supabase\.com/.test(connectionString ?? "")
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl,
});

// postgres-js for Drizzle (app tables). prepare: false required for Neon/Supabase pooler (transaction mode).
const client = postgres(connectionString ?? "", { prepare: false });
export const db = drizzle(client, { schema });
export type Db = typeof db;
