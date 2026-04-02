import type { NextFunction, Request, Response } from "express";

import { archiveEquipmentItem, type EquipmentRepository } from "@film-set-app/domain-equipment";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

interface ArchiveEquipmentItemControllerParams {
  organizationsRepository: OrganizationsRepository;
  equipmentRepository: EquipmentRepository;
}

export function createArchiveEquipmentItemController(params: ArchiveEquipmentItemControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const equipmentId =
        typeof request.params.equipmentId === "string" ? request.params.equipmentId : "";

      await archiveEquipmentItem({
        equipmentId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        equipmentRepository: params.equipmentRepository,
      });

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
