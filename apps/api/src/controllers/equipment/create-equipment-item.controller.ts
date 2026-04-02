import type { NextFunction, Request, Response } from "express";

import { createEquipmentItem, type EquipmentRepository } from "@film-set-app/domain-equipment";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentEquipmentItem } from "../../presenters/equipment.presenter.js";

interface CreateEquipmentItemControllerParams {
  organizationsRepository: OrganizationsRepository;
  equipmentRepository: EquipmentRepository;
}

export function createCreateEquipmentItemController(params: CreateEquipmentItemControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await createEquipmentItem({
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        equipmentRepository: params.equipmentRepository,
      });

      response.status(201).json(presentEquipmentItem(result));
    } catch (error) {
      next(error);
    }
  };
}
