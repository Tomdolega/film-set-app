import type { NextFunction, Request, Response } from "express";

import {
  markNotificationAsRead,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentNotification } from "../../presenters/notification.presenter.js";

interface MarkNotificationAsReadControllerParams {
  notificationsRepository: NotificationsRepository;
}

export function createMarkNotificationAsReadController(
  params: MarkNotificationAsReadControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const notificationId =
        typeof request.params.notificationId === "string" ? request.params.notificationId : "";
      const notification = await markNotificationAsRead({
        notificationId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        notificationsRepository: params.notificationsRepository,
      });

      response.status(200).json(presentNotification(notification));
    } catch (error) {
      next(error);
    }
  };
}
