import type { NextFunction, Request, Response } from "express";

import {
  getUnreadNotificationsCount,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentUnreadNotificationsCount } from "../../presenters/notification.presenter.js";

interface GetUnreadNotificationsCountControllerParams {
  notificationsRepository: NotificationsRepository;
}

export function createGetUnreadNotificationsCountController(
  params: GetUnreadNotificationsCountControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const count = await getUnreadNotificationsCount({
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        notificationsRepository: params.notificationsRepository,
      });

      response.status(200).json(presentUnreadNotificationsCount(count));
    } catch (error) {
      next(error);
    }
  };
}
