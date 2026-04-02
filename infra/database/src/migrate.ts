import "dotenv/config";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { createDatabaseClient, getDatabaseErrorMessage } from "./client/db.js";

async function main() {
  const databaseClient = createDatabaseClient();

  try {
    await migrate(databaseClient.db, {
      migrationsFolder: "infra/database/src/migrations",
    });

    console.log("Database migrations applied successfully");
  } catch (error) {
    console.error(getDatabaseErrorMessage(error));
    process.exitCode = 1;
  } finally {
    await databaseClient.close();
  }
}

void main();

