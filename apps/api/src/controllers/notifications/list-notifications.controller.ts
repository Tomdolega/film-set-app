import type { NextFunction, Request, Response } from "express";

import {
  listNotifications,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentNotifications } from "../../presenters/notification.presenter.js";

interface ListNotificationsControllerParams {
  notificationsRepository: NotificationsRepository;
}

export function createListNotificationsController(params: ListNotificationsControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const notifications = await listNotifications({
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        notificationsRepository: params.notificationsRepository,
      });

      response.status(200).json(presentNotifications(notifications));
    } catch (error) {
      next(error);
    }
  };
}
