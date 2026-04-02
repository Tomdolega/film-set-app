import { Router } from "express";

import type { EquipmentRepository } from "@film-set-app/domain-equipment";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import { createArchiveEquipmentItemController } from "../controllers/equipment/archive-equipment-item.controller.js";
import { createCreateEquipmentItemController } from "../controllers/equipment/create-equipment-item.controller.js";
import { createGetEquipmentItemController } from "../controllers/equipment/get-equipment-item.controller.js";
import { createListEquipmentItemsController } from "../controllers/equipment/list-equipment-items.controller.js";
import { createUpdateEquipmentItemController } from "../controllers/equipment/update-equipment-item.controller.js";

interface CreateEquipmentRouterParams {
  organizationsRepository: OrganizationsRepository;
  equipmentRepository: EquipmentRepository;
}

export function createEquipmentRouter(params: CreateEquipmentRouterParams) {
  const router = Router();

  router.post("/", createCreateEquipmentItemController(params));
  router.get("/", createListEquipmentItemsController(params));
  router.get("/:equipmentId", createGetEquipmentItemController(params));
  router.patch("/:equipmentId", createUpdateEquipmentItemController(params));
  router.delete("/:equipmentId", createArchiveEquipmentItemController(params));

  return router;
}
