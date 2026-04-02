import "dotenv/config";

import {
  createDatabaseClient,
  DrizzleContactsRepository,
  DrizzleCrewRepository,
  DrizzleDocumentsRepository,
  DrizzleEquipmentRepository,
  DrizzleNotificationsRepository,
  DrizzleOrganizationsRepository,
  DrizzleProjectsRepository,
  DrizzleSchedulingRepository,
  DrizzleUsersRepository,
  getDatabaseErrorMessage,
} from "@film-set-app/infra-database";
import { createLocalDocumentsStorage } from "@film-set-app/infra-storage";

import { createApp } from "./app.js";

async function main() {
  const port = Number(process.env.PORT ?? 3001);
  const databaseClient = createDatabaseClient();
  const usersRepository = new DrizzleUsersRepository(databaseClient.db);
  const organizationsRepository = new DrizzleOrganizationsRepository(databaseClient.db);
  const projectsRepository = new DrizzleProjectsRepository(databaseClient.db);
  const contactsRepository = new DrizzleContactsRepository(databaseClient.db);
  const crewRepository = new DrizzleCrewRepository(databaseClient.db);
  const documentsRepository = new DrizzleDocumentsRepository(databaseClient.db);
  const equipmentRepository = new DrizzleEquipmentRepository(databaseClient.db);
  const notificationsRepository = new DrizzleNotificationsRepository(databaseClient.db);
  const schedulingRepository = new DrizzleSchedulingRepository(databaseClient.db);
  const documentsStorage = createLocalDocumentsStorage();
  const app = createApp({
    databaseClient,
    usersRepository,
    organizationsRepository,
    projectsRepository,
    contactsRepository,
    crewRepository,
    documentsRepository,
    documentsStorage,
    equipmentRepository,
    notificationsRepository,
    schedulingRepository,
  });

  const databaseConnected = await databaseClient.checkConnection();

  if (databaseConnected) {
    console.log("Database connected");
  } else {
    console.warn(
      "Database is not reachable on startup. The API will still boot, but database-backed routes will fail until PostgreSQL is available.",
    );
  }

  const server = app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down`);

    server.close(async () => {
      await databaseClient.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void main().catch((error) => {
  console.error(getDatabaseErrorMessage(error));
  process.exit(1);
});
