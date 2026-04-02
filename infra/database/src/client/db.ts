import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../schema/index.js";

export type Database = NodePgDatabase<typeof schema>;

export interface DatabaseClient {
  db: Database;
  pool: Pool;
  checkConnection: () => Promise<boolean>;
  close: () => Promise<void>;
}

export function createDatabaseClient(connectionString = process.env.DATABASE_URL): DatabaseClient {
  const databaseUrl = getDatabaseUrl(connectionString);
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  const db = drizzle(pool, { schema });

  return {
    db,
    pool,
    checkConnection: async () => {
      try {
        const client = await pool.connect();
        client.release();
        return true;
      } catch {
        return false;
      }
    },
    close: async () => {
      await pool.end();
    },
  };
}

export function getDatabaseUrl(connectionString = process.env.DATABASE_URL): string {
  if (!connectionString?.trim()) {
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env and set a PostgreSQL connection string.",
    );
  }

  try {
    const parsed = new URL(connectionString);

    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error("DATABASE_URL must use postgres:// or postgresql://");
    }

    return connectionString;
  } catch (error) {
    throw new Error(
      `DATABASE_URL is invalid. ${error instanceof Error ? error.message : "Unexpected parse error."}`,
    );
  }
}

export function getDatabaseErrorMessage(error: unknown): string {
  const databaseError = findDatabaseError(error);

  if (databaseError?.code === "ECONNREFUSED" || databaseError?.code === "ENOTFOUND") {
    return "Database connection failed. Check DATABASE_URL and make sure PostgreSQL is running.";
  }

  if (databaseError?.code === "3D000") {
    return "Database does not exist. Create the PostgreSQL database before running migrations.";
  }

  if (databaseError?.code === "28P01") {
    return "Database authentication failed. Check the PostgreSQL username and password in DATABASE_URL.";
  }

  if (databaseError?.code === "42P01") {
    return "Database schema is missing. Run migrations with `npm run db:migrate`.";
  }

  if (databaseError?.message) {
    return databaseError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected database error";
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const databaseError = findDatabaseError(error);

  return databaseError?.code === "ECONNREFUSED" || databaseError?.code === "ENOTFOUND";
}

function findDatabaseError(error: unknown): { code?: string; message?: string } | null {
  if (!error) {
    return null;
  }

  if (error instanceof AggregateError) {
    for (const innerError of error.errors) {
      const found = findDatabaseError(innerError);
      if (found) {
        return found;
      }
    }
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { code?: string; message?: string; cause?: unknown };

    if (typeof maybeError.code === "string" || typeof maybeError.message === "string") {
      const nested = findDatabaseError(maybeError.cause);
      return nested ?? maybeError;
    }

    return findDatabaseError(maybeError.cause);
  }

  return null;
}
