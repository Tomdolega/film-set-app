import type { NextFunction, Request, Response } from "express";

import {
  markAllNotificationsAsRead,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentMarkAllNotificationsAsReadResult } from "../../presenters/notification.presenter.js";

interface MarkAllNotificationsAsReadControllerParams {
  notificationsRepository: NotificationsRepository;
}

export function createMarkAllNotificationsAsReadController(
  params: MarkAllNotificationsAsReadControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await markAllNotificationsAsRead({
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        notificationsRepository: params.notificationsRepository,
      });

      response.status(200).json(presentMarkAllNotificationsAsReadResult(result));
    } catch (error) {
      next(error);
    }
  };
}
