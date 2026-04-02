import type { NextFunction, Request, Response } from "express";

import { updateEquipmentItem, type EquipmentRepository } from "@film-set-app/domain-equipment";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentEquipmentItem } from "../../presenters/equipment.presenter.js";

interface UpdateEquipmentItemControllerParams {
  organizationsRepository: OrganizationsRepository;
  equipmentRepository: EquipmentRepository;
}

export function createUpdateEquipmentItemController(params: UpdateEquipmentItemControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const equipmentId =
        typeof request.params.equipmentId === "string" ? request.params.equipmentId : "";

      const result = await updateEquipmentItem({
        equipmentId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        equipmentRepository: params.equipmentRepository,
      });

      response.status(200).json(presentEquipmentItem(result));
    } catch (error) {
      next(error);
    }
  };
}
