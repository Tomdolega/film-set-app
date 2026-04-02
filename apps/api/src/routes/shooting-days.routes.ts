import { Router } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import { createAssignShootingDayResourceController } from "../controllers/scheduling/assign-shooting-day-resource.controller.js";
import { createDeleteShootingDayController } from "../controllers/scheduling/delete-shooting-day.controller.js";
import { createGetShootingDayCallSheetController } from "../controllers/scheduling/get-shooting-day-call-sheet.controller.js";
import { createGetShootingDayConflictsController } from "../controllers/scheduling/get-shooting-day-conflicts.controller.js";
import { createGetShootingDayController } from "../controllers/scheduling/get-shooting-day.controller.js";
import { createListShootingDayAssignmentsController } from "../controllers/scheduling/list-shooting-day-assignments.controller.js";
import { createRemoveShootingDayAssignmentController } from "../controllers/scheduling/remove-shooting-day-assignment.controller.js";
import { createUpdateShootingDayController } from "../controllers/scheduling/update-shooting-day.controller.js";

interface CreateShootingDaysRouterParams {
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createShootingDaysRouter(params: CreateShootingDaysRouterParams) {
  const router = Router();

  router.get("/:shootingDayId", createGetShootingDayController(params));
  router.patch("/:shootingDayId", createUpdateShootingDayController(params));
  router.delete("/:shootingDayId", createDeleteShootingDayController(params));
  router.post(
    "/:shootingDayId/assignments",
    createAssignShootingDayResourceController(params),
  );
  router.get(
    "/:shootingDayId/assignments",
    createListShootingDayAssignmentsController(params),
  );
  router.delete(
    "/:shootingDayId/assignments/:assignmentId",
    createRemoveShootingDayAssignmentController(params),
  );
  router.get("/:shootingDayId/conflicts", createGetShootingDayConflictsController(params));
  router.get("/:shootingDayId/call-sheet", createGetShootingDayCallSheetController(params));

  return router;
}
