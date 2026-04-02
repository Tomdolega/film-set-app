import { Router } from "express";

import type { NotificationsRepository } from "@film-set-app/domain-notifications";

import { createGetUnreadNotificationsCountController } from "../controllers/notifications/get-unread-notifications-count.controller.js";
import { createListNotificationsController } from "../controllers/notifications/list-notifications.controller.js";
import { createMarkAllNotificationsAsReadController } from "../controllers/notifications/mark-all-notifications-as-read.controller.js";
import { createMarkNotificationAsReadController } from "../controllers/notifications/mark-notification-as-read.controller.js";

interface CreateNotificationsRouterParams {
  notificationsRepository: NotificationsRepository;
}

export function createNotificationsRouter(params: CreateNotificationsRouterParams) {
  const router = Router();

  router.get("/", createListNotificationsController(params));
  router.get("/unread-count", createGetUnreadNotificationsCountController(params));
  router.patch("/read-all", createMarkAllNotificationsAsReadController(params));
  router.patch("/:notificationId/read", createMarkNotificationAsReadController(params));

  return router;
}
