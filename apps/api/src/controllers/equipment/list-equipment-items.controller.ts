import type { NextFunction, Request, Response } from "express";

import { listEquipmentItems, type EquipmentRepository } from "@film-set-app/domain-equipment";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentEquipmentItemRecord } from "../../presenters/equipment.presenter.js";

interface ListEquipmentItemsControllerParams {
  organizationsRepository: OrganizationsRepository;
  equipmentRepository: EquipmentRepository;
}

export function createListEquipmentItemsController(params: ListEquipmentItemsControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const organizationId =
        typeof request.query.organizationId === "string" ? request.query.organizationId : "";

      const result = await listEquipmentItems({
        organizationId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        equipmentRepository: params.equipmentRepository,
      });

      response
        .status(200)
        .json(
          result.equipmentItems.map((equipmentItem) =>
            presentEquipmentItemRecord(equipmentItem, result.currentUserRole),
          ),
        );
    } catch (error) {
      next(error);
    }
  };
}
