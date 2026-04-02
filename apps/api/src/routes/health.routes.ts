import { sql } from "drizzle-orm";
import { Router } from "express";

import type { DatabaseClient } from "@film-set-app/infra-database";

interface CreateHealthRouterParams {
  databaseClient: DatabaseClient;
}

export function createHealthRouter(params: CreateHealthRouterParams) {
  const router = Router();

  router.get("/health", async (_request, response) => {
    try {
      await params.databaseClient.db.execute(sql`select 1`);
      response.status(200).json({ status: "ok", database: "connected" });
    } catch {
      response.status(200).json({ status: "ok", database: "disconnected" });
    }
  });

  return router;
}
